import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { elderApi } from '../../services/elderApi';
import Navbar from '../../components/navbar';
import FamilyMemberLayout from '../../components/FamilyMemberLayout';
import styles from '../../components/css/familymember/online-appointment.module.css';

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
  const [dataLoading, setDataLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [notes, setNotes] = useState('');

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
    const fetchProviderInfo = async () => {
      if (!elderId || !counselorId) return;
      
      try {
        setDataLoading(true);
        setError(null);
        
        console.log('Fetching healthcare professional info for elder:', elderId, 'counselor:', counselorId);
        
        // Get all healthcare professionals and find the specific one
        const response = await elderApi.getAllHealthProfessionalsForOnlineMeeting(elderId);
        
        if (response.success) {
          console.log('Healthcare professionals response:', response);
          
          const counselor = response.healthProfessionals.find(
            hp => hp.counselor_id === parseInt(counselorId)
          );
          
          if (counselor) {
            setCounselorInfo({
              name: counselor.counselor_name,
              specialty: counselor.specialty,
              district: counselor.district,
              experience: counselor.years_experience,
              email: counselor.email,
              phone: counselor.phone
            });
          } else {
            throw new Error('Healthcare professional not found');
          }
          
          setElderInfo({
            name: response.elderInfo.name,
            district: response.elderInfo.district
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

    fetchProviderInfo();
  }, [elderId, counselorId]);

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Get available time slots
  const getAvailableTimeSlots = () => {
    return [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
    ];
  };

  // Handle appointment booking
  const handleBookAppointment = async (e) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTime) {
      setError('Please select both date and time for your appointment');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      const appointmentData = {
        counselorId: parseInt(counselorId),
        appointmentDate: selectedDate,
        appointmentTime: selectedTime,
        appointmentType: 'online',
        familyId: currentUser.family_id, // Add family ID from current user
        patientName: elderInfo?.name || 'Elder Patient',
        contactNumber: currentUser.phone || '',
        emergencyContact: currentUser.phone || '',
        notes: notes || 'Online healthcare professional consultation'
      };

      console.log('Booking healthcare professional appointment:', appointmentData);
      
      const response = await elderApi.createHealthProfessionalAppointment(elderId, appointmentData);
      
      if (response.success) {
        setSuccessMessage('Healthcare professional appointment booked successfully!');
        
        // Show success modal with meeting details
        const meetingLink = response.appointment.meeting_link;
        
        setTimeout(() => {
          alert(`
✅ Healthcare Professional Appointment Confirmed!

📅 Date: ${formatDateForDisplay(selectedDate)}
🕐 Time: ${formatTimeForDisplay(selectedTime)}
👩‍⚕️ Healthcare Professional: ${counselorInfo.name}
🧠 Specialty: ${counselorInfo.specialty}

🔗 Meeting Link: ${meetingLink}

You can join the meeting using the link above. 
The meeting is accessible globally and doesn't require any local setup.

You will be redirected to your appointments page.
          `);
          
          // Redirect to appointments page
          navigate(`/family-member/appointments`);
        }, 500);
        
      } else {
        throw new Error(response.error || 'Failed to book appointment');
      }
      
    } catch (err) {
      console.error('Error booking appointment:', err);
      setError(err.message || 'Failed to book appointment');
    } finally {
      setSubmitting(false);
    }
  };

  // Protect the route
  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated || !currentUser || currentUser.role !== 'family_member') {
      navigate('/login', { replace: true });
      return;
    }
  }, [currentUser, isAuthenticated, loading, navigate]);

  // Show loading
  if (loading || dataLoading) {
    return (
      <div>
        <Navbar />
        <FamilyMemberLayout>
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <h2>Loading healthcare professional information...</h2>
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
              Book Healthcare Professional Consultation
            </h1>
            <p className={styles.pageSubtitle}>
              Schedule an online consultation with a healthcare professional
            </p>
          </div>

          {error && (
            <div className={styles.errorMessage}>
              <span className={styles.errorIcon}>⚠️</span>
              {error}
            </div>
          )}

          {successMessage && (
            <div className={styles.successMessage}>
              <span className={styles.successIcon}>✅</span>
              {successMessage}
            </div>
          )}

          <div className={styles.appointmentContent}>
            {/* Healthcare Professional Info */}
            {counselorInfo && (
              <div className={styles.providerCard}>
                <div className={styles.providerHeader}>
                  <div className={styles.providerAvatar}>
                    <span className={styles.avatarText}>
                      {counselorInfo.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className={styles.providerInfo}>
                    <h2 className={styles.providerName}>{counselorInfo.name}</h2>
                    <p className={styles.providerSpecialty}>{counselorInfo.specialty}</p>
                    <div className={styles.providerDetails}>
                      <span className={styles.detail}>
                        📍 {counselorInfo.district}
                      </span>
                      <span className={styles.detail}>
                        🎓 {counselorInfo.experience} years experience
                      </span>
                      <span className={styles.detail}>
                        💻 Online Consultation Available
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Elder Info */}
            {elderInfo && (
              <div className={styles.elderCard}>
                <h3 className={styles.elderTitle}>Appointment For:</h3>
                <div className={styles.elderInfo}>
                  <span className={styles.elderName}>{elderInfo.name}</span>
                  <span className={styles.elderLocation}>📍 {elderInfo.district}</span>
                </div>
              </div>
            )}

            {/* Booking Form */}
            <form onSubmit={handleBookAppointment} className={styles.bookingForm}>
              <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>Select Date & Time</h3>
                
                <div className={styles.dateTimeGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="appointmentDate">
                      Preferred Date:
                    </label>
                    <input
                      type="date"
                      id="appointmentDate"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={getMinDate()}
                      className={styles.dateInput}
                      required
                    />
                    {selectedDate && (
                      <p className={styles.dateDisplay}>
                        Selected: {formatDateForDisplay(selectedDate)}
                      </p>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="appointmentTime">
                      Preferred Time:
                    </label>
                    <select
                      id="appointmentTime"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className={styles.timeSelect}
                      required
                    >
                      <option value="">Select a time slot</option>
                      {getAvailableTimeSlots().map((time) => (
                        <option key={time} value={time}>
                          {formatTimeForDisplay(time)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>Additional Information</h3>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="notes">
                    Notes or specific concerns (Optional):
                  </label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Please describe any specific concerns or topics you'd like to discuss during the consultation..."
                    className={styles.notesTextarea}
                    rows={4}
                  />
                </div>
              </div>

              <div className={styles.bookingActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => navigate(`/family-member/elder/${elderId}/providers`)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !selectedDate || !selectedTime}
                  className={styles.bookButton}
                >
                  {submitting ? '⏳ Booking...' : '📅 Book Consultation'}
                </button>
              </div>
            </form>

            {/* Meeting Info */}
            <div className={styles.meetingInfoCard}>
              <h3 className={styles.infoTitle}>🌐 About Online Consultations</h3>
              <ul className={styles.infoList}>
                <li>✅ Secure video consultations via Jitsi Meet</li>
                <li>✅ Global access - works from anywhere with internet</li>
                <li>✅ Automatic meeting link generation</li>
                <li>✅ No software installation required</li>
                <li>✅ Professional healthcare support</li>
                <li>✅ 60-minute consultation duration</li>
              </ul>
            </div>
          </div>
        </div>
      </FamilyMemberLayout>
    </div>
  );
};

export default HealthcareProfessionalAppointment;
