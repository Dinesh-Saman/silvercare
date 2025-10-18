import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { elderApi } from '../../services/elderApi';
import Navbar from '../../components/navbar';
import FamilyMemberLayout from '../../components/FamilyMemberLayout';
import styles from '../../components/css/familymember/physical-appointment.module.css';

const HealthcareProfessionalAppointment = () => {
  const { currentUser, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { elderId, counselorId } = useParams();
  const [searchParams] = useSearchParams();
  const meetingType = searchParams.get('meetingType');

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [counselorInfo, setCounselorInfo] = useState(null);
  const [elderInfo, setElderInfo] = useState(null);
  const [blockedSlots, setBlockedSlots] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Calculate age from date of birth
  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

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

  // Fetch appointment booking info from backend
  useEffect(() => {
    const fetchAppointmentInfo = async () => {
      if (!elderId || !counselorId) return;
      
      try {
        setDataLoading(true);
        setError(null);
        
        console.log('Fetching healthcare professional booking info for elder:', elderId, 'counselor:', counselorId);
        
        // Get healthcare professional information
        const response = await elderApi.getAllHealthProfessionalsForOnlineMeeting(elderId);
        
        if (response.success) {
          console.log('Healthcare professional booking info received:', response);
          
          const counselor = response.healthProfessionals.find(
            hp => hp.counselor_id === parseInt(counselorId)
          );
          
          if (counselor) {
            setCounselorInfo({
              name: counselor.counselor_name,
              specialization: counselor.specialty,
              institution: counselor.district, // Using district as institution
              district: counselor.district,
              experience: counselor.years_experience,
              email: counselor.email,
              phone: counselor.phone,
              fee: meetingType === 'physical' ? 2500 : 2000
            });
          } else {
            throw new Error('Healthcare professional not found');
          }
          
          setElderInfo({
            name: response.elderInfo.name,
            age: 'N/A', // We might not have DOB
            gender: 'N/A',
            district: response.elderInfo.district,
            contact: 'N/A',
            medical_conditions: 'N/A'
          });
          
        } else {
          throw new Error(response.error || 'Failed to fetch healthcare professional information');
        }
        
      } catch (err) {
        console.error('Error fetching booking info:', err);
        setError(err.message || 'Error loading booking information. Please try again.');
      } finally {
        setDataLoading(false);
      }
    };

    fetchAppointmentInfo();
  }, [elderId, counselorId, meetingType]);

  // Generate calendar days for current month without timezone issues
  const generateCalendarDays = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      
      const date = new Date(currentYear, currentMonth, day);
      const isToday = date.toDateString() === today.toDateString();
      const isPast = date < today;
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      
      days.push({
        day,
        date: dateString,
        isToday,
        isPast,
        isWeekend,
        isAvailable: !isPast && !isWeekend
      });
    }
    
    return days;
  };

  // Generate available time slots for healthcare professional appointments
  const generateTimeSlots = () => {
    const slots = [];
    
    // Afternoon slots (3 PM - 8 PM) 
    for (let hour = 15; hour <= 20; hour++) {
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

  // Handle booking appointment - redirect to booking summary
  const handleBookAppointment = async () => {
    if (!selectedDate || !selectedTime) {
      setError('Please select both date and time for the appointment');
      return;
    }

    if (isTimeSlotBlocked(selectedTime)) {
      setError('Selected time slot is not available. Please choose a different time.');
      return;
    }

    // Redirect to healthcare professional booking summary page
    const summaryParams = new URLSearchParams({
      date: selectedDate,
      time: selectedTime,
      type: meetingType || 'online'
    });

    navigate(`/family-member/elder/${elderId}/healthcare-professional-booking-summary/${counselorId}?${summaryParams.toString()}`);
  };

  const days = generateCalendarDays();
  const timeSlots = generateTimeSlots();
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  const currentMonth = monthNames[new Date().getMonth()];
  const currentYear = new Date().getFullYear();
  
  // Debug log to verify calendar generation
  console.log('Healthcare Professional Calendar - Generated days:', days.length);

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
        <p>You need to be logged in as a family member to book healthcare professional appointments.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Navbar />
      <FamilyMemberLayout>
        <div className={styles.content}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerContent}>
              <h1 className={styles.title}>
                🩺 Book Healthcare Professional Appointment
              </h1>
              <p className={styles.subtitle}>
                Schedule a {meetingType === 'physical' ? 'physical meeting (2 hours)' : 'video consultation (1 hour)'} 
              </p>
            </div>
            <button 
              className={styles.backButton}
              onClick={() => navigate(`/family-member/elder/${elderId}/doctors`)}
            >
              ← Back to Providers
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className={styles.errorMessage}>
              <span className={styles.errorIcon}>⚠️</span>
              {error}
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className={styles.successMessage}>
              <span className={styles.successIcon}>✅</span>
              {successMessage}
            </div>
          )}

          {dataLoading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p>Loading healthcare professional information...</p>
            </div>
          ) : (
            <>
              {/* Info Cards */}
              <div className={styles.infoCards}>
                <div className={styles.infoCard}>
                  <div className={styles.cardIcon}>🩺</div>
                  <div className={styles.cardContent}>
                    <h3>Healthcare Professional Information</h3>
                    {counselorInfo && (
                      <>
                        <p><strong>{counselorInfo.name}</strong></p>
                        <p>{counselorInfo.specialization}</p>
                        <p>🏥 {counselorInfo.institution}</p>
                        <p>📍 {counselorInfo.district}</p>
                        <p>⭐ {counselorInfo.experience} years experience</p>
                        {counselorInfo.phone && <p>📞 {counselorInfo.phone}</p>}
                        {counselorInfo.email && <p>✉️ {counselorInfo.email}</p>}
                      </>
                    )}
                  </div>
                </div>

                <div className={styles.infoCard}>
                  <div className={styles.cardIcon}>👨‍👩‍👧‍👦</div>
                  <div className={styles.cardContent}>
                    <h3>Patient Information</h3>
                    {elderInfo && (
                      <>
                        <p><strong>{elderInfo.name}</strong></p>
                        <p>Age: {elderInfo.age} years</p>
                        <p>Gender: {elderInfo.gender}</p>
                        <p>📍 {elderInfo.district}</p>
                        <p>📞 {elderInfo.contact}</p>
                        {elderInfo.medical_conditions !== 'N/A' && (
                          <p><strong>Medical Conditions:</strong> {elderInfo.medical_conditions}</p>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className={styles.infoCard}>
                  <div className={styles.cardIcon}>💰</div>
                  <div className={styles.cardContent}>
                    <h3>Appointment Details</h3>
                    <p><strong>Meeting Type:</strong> {meetingType === 'physical' ? 'Physical' : 'Online'}</p>
                    <p><strong>Duration:</strong> {meetingType === 'physical' ? '2 hours' : '1 hour'}</p>
                    <p><strong>Consultation Fee:</strong> Rs. {counselorInfo?.fee || (meetingType === 'physical' ? 2500 : 2000)}</p>
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
                          <h3>{currentMonth} {currentYear}</h3>
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
                                    dayInfo.isWeekend ? styles.weekend :
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
                        <div className={styles.calendarLegend}>
                          <div className={styles.legendItem}>
                            <div className={styles.legendColor + ' ' + styles.availableColor}></div>
                            <span>Available</span>
                          </div>
                          <div className={styles.legendItem}>
                            <div className={styles.legendColor + ' ' + styles.selectedColor}></div>
                            <span>Selected</span>
                          </div>
                          <div className={styles.legendItem}>
                            <div className={styles.legendColor + ' ' + styles.weekendColor}></div>
                            <span>Weekend</span>
                          </div>
                          <div className={styles.legendItem}>
                            <div className={styles.legendColor + ' ' + styles.pastColor}></div>
                            <span>Past</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Time Wrapper */}
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
                                title={isBlocked ? 'This time slot is not available' : ''}
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
                            <span>Blocked</span>
                          </div>
                        </div>
                      </div>
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
                      <p><strong>Duration:</strong> {meetingType === 'physical' ? '2 hours' : '1 hour'}</p>
                      <p><strong>Type:</strong> {meetingType === 'physical' ? 'Physical Meeting' : 'Online Consultation'}</p>
                      <p><strong>Fee:</strong> Rs. {counselorInfo?.fee || (meetingType === 'physical' ? 2500 : 2000)}</p>
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
                        Processing...
                      </>
                    ) : (
                      `📅 Book ${meetingType === 'physical' ? 'Physical' : 'Online'} Appointment`
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </FamilyMemberLayout>
    </div>
  );
};

export default HealthcareProfessionalAppointment;