import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { elderApi } from '../../services/elderApi';
import Navbar from '../../components/navbar';
import FamilyMemberLayout from '../../components/FamilyMemberLayout';
import styles from '../../components/css/familymember/physical-appointment.module.css';

const OnlineHealthcareProfessionalAppointment = () => {
  const { currentUser, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { elderId, counselorId } = useParams();

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [counselorInfo, setCounselorInfo] = useState(null);
  const [elderInfo, setElderInfo] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [blockedSlots, setBlockedSlots] = useState([]);

  // Format date for display
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    
    const [year, month, day] = dateString.split('-');
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const dayOfWeek = dayNames[date.getDay()];
    
    return `${dayOfWeek}, ${monthNames[parseInt(month) - 1]} ${parseInt(day)}, ${year}`;
  };

  // Format time for display
  const formatTimeForDisplay = (timeString) => {
    if (!timeString) return '';
    
    const [hours, minutes] = timeString.split(':');
    const hour12 = parseInt(hours) > 12 ? parseInt(hours) - 12 : parseInt(hours);
    const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
    const displayHour = hour12 === 0 ? 12 : hour12;
    
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Fetch healthcare professional and elder info
  useEffect(() => {
    const fetchAppointmentInfo = async () => {
      if (!elderId || !counselorId) return;
      
      try {
        setDataLoading(true);
        setError(null);
        
        console.log('Fetching appointment booking info for elder:', elderId, 'counselor:', counselorId);
        
        // Get all healthcare professionals for online appointments
        const response = await elderApi.getAllHealthProfessionalsForOnlineMeeting(elderId);
        
        if (response.success) {
          console.log('Healthcare professionals response:', response);
          
          const counselor = response.healthProfessionals.find(
            hp => hp.counselor_id === parseInt(counselorId)
          );
          
          if (counselor) {
            setCounselorInfo({
              counselor_id: counselor.counselor_id,
              name: counselor.counselor_name,
              specialty: counselor.specialty,
              district: counselor.district,
              experience: counselor.years_experience,
              email: counselor.email,
              phone: counselor.phone,
              fee: 1800, // Default fee for online healthcare appointments
              license_number: counselor.license_number
            });
          } else {
            throw new Error('Healthcare professional not found');
          }
          
          setElderInfo({
            name: response.elderInfo.name,
            district: response.elderInfo.district,
            elder_id: response.elderInfo.elder_id,
            contact: currentUser.phone || '',
            gender: 'Not specified', // Could be enhanced
            medical_conditions: null
          });
          
        } else {
          throw new Error(response.error || 'Failed to fetch healthcare professional information');
        }
        
      } catch (err) {
        console.error('Error fetching healthcare professional info:', err);
        setError(err.message || 'Failed to load healthcare professional information');
      } finally {
        setDataLoading(false);
      }
    };

    fetchAppointmentInfo();
  }, [elderId, counselorId, currentUser]);

  // Fetch blocked time slots when date is selected
  useEffect(() => {
    const fetchBlockedSlots = async () => {
      if (!selectedDate || !counselorId) return;
      
      try {
        console.log('Fetching blocked slots for counselor:', counselorId, 'date:', selectedDate, 'type: online');
        
        // Note: We might need to create a specific endpoint for counselor blocked slots
        // For now, using empty array since we don't have counselor blocking system yet
        setBlockedSlots([]);
        
      } catch (err) {
        console.error('Error fetching blocked slots:', err);
        setBlockedSlots([]);
      }
    };

    fetchBlockedSlots();
  }, [selectedDate, counselorId]);

  // Protect the route
  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated || !currentUser || currentUser.role !== 'family_member') {
      navigate('/login', { replace: true });
      return;
    }

    // Validate required params
    if (!elderId || !counselorId) {
      navigate(`/family-member/elder/${elderId}/providers`, { replace: true });
      return;
    }
  }, [currentUser, isAuthenticated, loading, navigate, elderId, counselorId]);

  // Generate calendar days for current month with leading blanks to align grid
  const generateCalendarDays = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Leading empty cells for alignment
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${day
        .toString()
        .padStart(2, '0')}`;

      const date = new Date(currentYear, currentMonth, day);
      const isToday = date.toDateString() === today.toDateString();
      const isPast = date < today;

      days.push({
        day,
        date: dateString,
        isToday,
        isPast,
        isAvailable: !isPast,
      });
    }

    return days;
  };

  // Generate available time slots for online appointments (1 hour duration)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 12; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    
    return slots;
  };

  // Check if a time slot is blocked
  const isTimeSlotBlocked = (timeSlot) => {
    return blockedSlots.includes(timeSlot);
  };

  const handleDateSelection = (dateString) => {
    setSelectedDate(dateString);
    setSelectedTime(''); // Reset selected time when date changes
    console.log('Calendar day clicked, date set to:', dateString);
  };

  const handleTimeSelection = (time) => {
    if (!isTimeSlotBlocked(time)) {
      setSelectedTime(time);
      console.log('Selected time:', time);
    }
  };

  const handleBookAppointment = async () => {
    if (!selectedDate || !selectedTime) {
      setError('Please select both date and time for the appointment');
      return;
    }

    if (isTimeSlotBlocked(selectedTime)) {
      setError('Selected time slot is not available. Please choose a different time.');
      return;
    }

    // Redirect to booking summary page instead of directly creating appointment
    const summaryParams = new URLSearchParams({
      date: selectedDate,
      time: selectedTime,
      type: 'online',
      provider: 'healthcare'
    });

    navigate(`/family-member/elder/${elderId}/healthcare-booking-summary/${counselorId}?${summaryParams.toString()}`);
  };

  const days = generateCalendarDays();
  const timeSlots = generateTimeSlots();
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  const currentMonth = monthNames[new Date().getMonth()];
  const currentYear = new Date().getFullYear();

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <h2>Loading...</h2>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated || !currentUser || currentUser.role !== 'family_member') {
    return (
      <div className={styles.accessDenied}>
        <h2>Access Denied</h2>
        <p>Please log in as a family member to access this page.</p>
      </div>
    );
  }

  // Show loading while fetching data
  if (dataLoading) {
    return (
      <div>
        <Navbar />
        <FamilyMemberLayout>
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <h2>Loading appointment information...</h2>
          </div>
        </FamilyMemberLayout>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <FamilyMemberLayout>
        <div className={styles.appointmentContainer}>
          <div className={styles.headerSection}>
            <button 
              className={styles.backButton}
              onClick={() => navigate(`/family-member/elder/${elderId}/providers`)}
            >
              ← Back to Healthcare Professionals
            </button>
            
            <h1 className={styles.pageTitle}>
              💻 Book Online Healthcare Consultation
            </h1>
            <p className={styles.pageSubtitle}>
              Schedule an online video consultation with {counselorInfo?.name}
            </p>
          </div>

          {error && (
            <div className={styles.errorMessage}>
              <span className={styles.errorIcon}>⚠️</span>
              {error}
            </div>
          )}

          <div className={styles.appointmentContent}>
          {/* Info Cards */}
          <div className={styles.infoCardsContainer}>
            <div className={styles.infoCard}>
              <div className={styles.cardIcon}>👩‍⚕️</div>
              <div className={styles.cardContent}>
                <h3>Healthcare Professional</h3>
                {counselorInfo ? (
                  <>
                    <p><strong>{counselorInfo.name}</strong></p>
                    <p>{counselorInfo.specialty}</p>
                    <p>📍 {counselorInfo.district}</p>
                    <p>🎓 {counselorInfo.experience} years experience</p>
                    <p>💻 Online Consultation Available</p>
                  </>
                ) : (
                  <p>Loading healthcare professional details...</p>
                )}
              </div>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.cardIcon}>👴</div>
              <div className={styles.cardContent}>
                <h3>Patient Information</h3>
                {elderInfo ? (
                  <>
                    <p><strong>{elderInfo.name}</strong></p>
                    <p>Age: {elderInfo.age || 'Not specified'}</p>
                    <p>Gender: {elderInfo.gender}</p>
                    <p>📍 {elderInfo.district}</p>
                    <p>📞 {elderInfo.contact}</p>
                    {elderInfo.medical_conditions && (
                      <p><strong>Medical Conditions:</strong> {elderInfo.medical_conditions}</p>
                    )}
                  </>
                ) : (
                  <p>Loading patient details...</p>
                )}
              </div>
            </div>

            <div className={styles.infoCard}>
                            <div className={styles.cardIcon}>💰</div>
              <div className={styles.cardContent}>
                <h3>Appointment Details</h3>
                <p><strong>Meeting Type:</strong> Online</p>
                <p><strong>Duration:</strong> 1 hour</p>
                <p><strong>Consultation Fee:</strong> Rs. {counselorInfo?.fee || 1800}</p>
                <p><strong>Platform:</strong> Video Call</p>
              </div>
            </div>
          </div>

                    <div className={styles.appointmentForm}>
            {/* Calendar and Time Section - Combined */}
            <div className={styles.calendarSection}>
              <div className={styles.calendarTimeContainer}>
                {/* Calendar Wrapper */}
                <div className={styles.calendarWrapper}>
                  <h2 className={styles.sectionTitle}>📅 Select Date</h2>
                  <div className={styles.calendarContainer}>
                    <div className={styles.calendarHeader}>
                      <h3 className={styles.monthYear}>{currentMonth} {currentYear}</h3>
                    </div>
                    <div className={styles.calendarGrid}>
                      <div className={styles.dayHeaders}>
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                          <div key={day} className={styles.dayHeader}>{day}</div>
                        ))}
                      </div>
                      <div className={styles.daysGrid}>
                        {days.map((dayInfo, index) => (
                          <div
                            key={index}
                            className={`${styles.dayCell} ${
                              dayInfo ? (
                                dayInfo.isToday ? styles.today :
                                dayInfo.isPast ? styles.pastDay :
                                dayInfo.date === selectedDate ? styles.selected :
                                styles.available
                              ) : styles.empty
                            }`}
                            onClick={() => {
                              if (dayInfo && dayInfo.isAvailable) {
                                handleDateSelection(dayInfo.date);
                              }
                            }}
                          >
                            {dayInfo?.day}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Time Selection */}
                <div className={styles.timeWrapper}>
                  <div className={styles.timeSection}>
                    <h2 className={styles.sectionTitle}>🕐 Select Time</h2>
                    {selectedDate && blockedSlots.length > 0 && (
                      <div className={styles.blockedSlotsInfo}>
                        <p className={styles.infoText}>
                          ⚠️ Some time slots are unavailable due to existing appointments
                        </p>
                      </div>
                    )}
                    <div className={styles.timeSlots}>
                      {timeSlots.map(time => {
                        const isBlocked = isTimeSlotBlocked(time);
                        return (
                          <button
                            key={time}
                            className={`${styles.timeSlot} ${
                              selectedTime === time ? styles.selectedTime : ''
                            } ${isBlocked ? styles.blockedTime : ''}`}
                            onClick={() => handleTimeSelection(time)}
                            disabled={!selectedDate || isBlocked}
                            title={isBlocked ? 'This time slot is not available (conflicts with existing appointment)' : ''}
                          >
                            {formatTimeForDisplay(time)}
                            {isBlocked && <span className={styles.blockedIcon}>🚫</span>}
                          </button>
                        );
                      })}
                    </div>
                    <div className={styles.timeSlotLegend}>
                      <div className={styles.legendItem}>
                        <div className={styles.legendColor + ' ' + styles.availableTimeColor}></div>
                        <span>Available</span>
                      </div>
                      <div className={styles.legendItem}>
                        <div className={styles.legendColor + ' ' + styles.selectedTimeColor}></div>
                        <span>Selected</span>
                      </div>
                      <div className={styles.legendItem}>
                        <div className={styles.legendColor + ' ' + styles.blockedTimeColor}></div>
                        <span>Unavailable</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Requirements Section */}
            <div className={styles.requirementsSection}>
              <h3 className={styles.requirementsTitle}>💻 Online Consultation Requirements</h3>
              <div className={styles.requirementsList}>
                <div className={styles.requirementItem}>
                  <span className={styles.requirementIcon}>🌐</span>
                  <span>Stable internet connection</span>
                </div>
                <div className={styles.requirementItem}>
                  <span className={styles.requirementIcon}>📹</span>
                  <span>Camera and microphone</span>
                </div>
                <div className={styles.requirementItem}>
                  <span className={styles.requirementIcon}>🔇</span>
                  <span>Quiet environment</span>
                </div>
              </div>
            </div>

            {/* Summary Section */}
            {selectedDate && selectedTime && (
              <div className={styles.appointmentSummary}>
                <h3>📋 Appointment Summary</h3>
                <div className={styles.summaryContent}>
                  <p><strong>Date:</strong> {formatDateForDisplay(selectedDate)}</p>
                  <p><strong>Time:</strong> {formatTimeForDisplay(selectedTime)}</p>
                  <p><strong>Duration:</strong> 1 hour</p>
                  <p><strong>Type:</strong> Online Meeting</p>
                  <p><strong>Platform:</strong> Video Call</p>
                  <p><strong>Fee:</strong> Rs. {counselorInfo?.fee || 1800}</p>
                </div>
              </div>
            )}

            {/* Book Button */}
            <div className={styles.submitSection}>
              <button
                className={styles.submitButton}
                onClick={handleBookAppointment}
                disabled={!selectedDate || !selectedTime || submitting || isTimeSlotBlocked(selectedTime)}
              >
                {submitting ? (
                  <>
                    <div className={styles.buttonSpinner}></div>
                    Booking Appointment...
                  </>
                ) : (
                  '💻 Book Online Consultation'
                )}
              </button>
            </div>
          </div>

        </div>
        </div>
      </FamilyMemberLayout>
    </div>
  );
};

export default OnlineHealthcareProfessionalAppointment;