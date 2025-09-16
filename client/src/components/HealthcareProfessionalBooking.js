import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './OnlineMeetingInterface.module.css';

const HealthcareProfessionalBooking = ({ elderId, onBookingSuccess }) => {
  const [healthProfessionals, setHealthProfessionals] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load healthcare professionals when component mounts
  useEffect(() => {
    fetchHealthcareProfessionals();
  }, [elderId]);

  const fetchHealthcareProfessionals = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/elders/${elderId}/healthcare-professionals/online`);
      
      if (response.data.success) {
        setHealthProfessionals(response.data.healthProfessionals);
      } else {
        setError('Failed to load healthcare professionals');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error('Error fetching healthcare professionals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    
    if (!selectedProvider || !appointmentDate || !appointmentTime) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const appointmentData = {
        counselorId: selectedProvider.counselor_id,
        appointmentDate,
        appointmentTime,
        appointmentType: 'online',
        notes: notes || 'Online healthcare professional consultation'
      };

      const response = await axios.post(
        `/api/elders/${elderId}/healthcare-appointments`, 
        appointmentData
      );

      if (response.data.success) {
        setSuccess('Appointment booked successfully! Meeting link generated.');
        
        // Show success details
        const appointment = response.data.appointment;
        alert(`
          ✅ Healthcare Professional Appointment Confirmed!
          
          📅 Date: ${appointmentDate}
          🕐 Time: ${appointmentTime}
          👩‍⚕️ Provider: ${selectedProvider.counselor_name}
          🏥 Specialty: ${selectedProvider.specialty}
          
          🔗 Meeting Link: ${appointment.meeting_link}
          
          You can join the meeting using the link above. 
          The meeting is accessible globally and doesn't require any local setup.
        `);
        
        // Reset form
        setSelectedProvider(null);
        setAppointmentDate('');
        setAppointmentTime('');
        setNotes('');
        
        if (onBookingSuccess) {
          onBookingSuccess(response.data.appointment);
        }
      } else {
        setError(response.data.error || 'Failed to book appointment');
      }
    } catch (err) {
      setError('Error booking appointment');
      console.error('Booking error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getAvailableTimeSlots = () => {
    return [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
    ];
  };

  if (loading && !healthProfessionals.length) {
    return <div className={styles.loading}>Loading healthcare professionals...</div>;
  }

  return (
    <div className={styles.bookingContainer}>
      <h2 className={styles.title}>Book Online Healthcare Professional Consultation</h2>
      
      {error && (
        <div className={styles.errorMessage}>
          ❌ {error}
        </div>
      )}
      
      {success && (
        <div className={styles.successMessage}>
          ✅ {success}
        </div>
      )}

      <form onSubmit={handleBookAppointment} className={styles.bookingForm}>
        {/* Healthcare Professional Selection */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Select Healthcare Professional:</label>
          <div className={styles.providersGrid}>
            {healthProfessionals.map((professional) => (
              <div
                key={professional.counselor_id}
                className={`${styles.providerCard} ${
                  selectedProvider?.counselor_id === professional.counselor_id 
                    ? styles.selected 
                    : ''
                }`}
                onClick={() => setSelectedProvider(professional)}
              >
                <div className={styles.providerInfo}>
                  <h3 className={styles.providerName}>{professional.counselor_name}</h3>
                  <p className={styles.specialty}>{professional.specialty}</p>
                  <p className={styles.experience}>
                    {professional.years_experience} years experience
                  </p>
                  <p className={styles.district}>📍 {professional.district}</p>
                  {professional.phone && (
                    <p className={styles.contact}>📞 {professional.phone}</p>
                  )}
                </div>
                <div className={styles.onlineIndicator}>
                  🌐 Online Consultation Available
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Date Selection */}
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="appointmentDate">
            Select Date:
          </label>
          <input
            type="date"
            id="appointmentDate"
            value={appointmentDate}
            onChange={(e) => setAppointmentDate(e.target.value)}
            min={getMinDate()}
            className={styles.dateInput}
            required
          />
        </div>

        {/* Time Selection */}
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="appointmentTime">
            Select Time:
          </label>
          <select
            id="appointmentTime"
            value={appointmentTime}
            onChange={(e) => setAppointmentTime(e.target.value)}
            className={styles.timeSelect}
            required
          >
            <option value="">Choose a time slot</option>
            {getAvailableTimeSlots().map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>

        {/* Notes */}
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="notes">
            Additional Notes (Optional):
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any specific concerns or topics you'd like to discuss..."
            className={styles.notesTextarea}
            rows={3}
          />
        </div>

        {/* Book Button */}
        <button
          type="submit"
          disabled={loading || !selectedProvider || !appointmentDate || !appointmentTime}
          className={styles.bookButton}
        >
          {loading ? '⏳ Booking...' : '📅 Book Online Consultation'}
        </button>
      </form>

      {/* Info Section */}
      <div className={styles.infoSection}>
        <h3>🌐 About Online Consultations:</h3>
        <ul className={styles.infoList}>
          <li>✅ Secure video consultations via Jitsi Meet</li>
          <li>✅ Global access - no localhost dependencies</li>
          <li>✅ Automatic meeting link generation</li>
          <li>✅ Join from any device with internet connection</li>
          <li>✅ Same quality care as in-person visits</li>
          <li>✅ Appointment confirmation with meeting details</li>
        </ul>
      </div>
    </div>
  );
};

export default HealthcareProfessionalBooking;
