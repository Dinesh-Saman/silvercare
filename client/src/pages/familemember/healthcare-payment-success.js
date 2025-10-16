import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/navbar';
import FamilyMemberLayout from '../../components/FamilyMemberLayout';
import styles from '../../components/css/familymember/payment-success.module.css';

const HealthcarePaymentSuccess = () => {
  const { currentUser, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get success details from URL params
  const appointmentId = searchParams.get('appointmentId');
  const elderId = searchParams.get('elderId');
  const counselorName = searchParams.get('counselorName');
  const elderName = searchParams.get('elderName');
  const appointmentDate = searchParams.get('date');
  const appointmentTime = searchParams.get('time');
  const appointmentType = searchParams.get('type');
  const amount = searchParams.get('amount');
  const transactionId = searchParams.get('transactionId');

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

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    // Clear any payment timers on success
    if (appointmentId) {
      // Clear all payment timer entries from localStorage
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('payment_timer_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    }
  }, [appointmentId]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <h2>Loading...</h2>
      </div>
    );
  }

  // Redirect if missing required data
  if (!appointmentId || !elderId) {
    navigate('/family-member/elder-doctors');
    return null;
  }

  return (
    <FamilyMemberLayout>
      <div className={styles.container}>
        <div className={styles.successCard}>
          {/* Success Icon and Header */}
          <div className={styles.successHeader}>
            <div className={styles.successIcon}>
              <div className={styles.checkmark}>
                <svg viewBox="0 0 24 24" className={styles.checkmarkSvg}>
                  <path 
                    fill="currentColor" 
                    d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z" 
                  />
                </svg>
              </div>
            </div>
            <h1>Payment Successful!</h1>
            <p>Your healthcare professional appointment has been confirmed</p>
          </div>

          {/* Appointment Details */}
          <div className={styles.appointmentDetails}>
            <h2>Appointment Details</h2>
            
            <div className={styles.detailsGrid}>
              <div className={styles.detailItem}>
                <div className={styles.detailIcon}>👤</div>
                <div>
                  <strong>Patient</strong>
                  <p>{elderName}</p>
                </div>
              </div>

              <div className={styles.detailItem}>
                <div className={styles.detailIcon}>🩺</div>
                <div>
                  <strong>Healthcare Professional</strong>
                  <p>{counselorName}</p>
                </div>
              </div>

              <div className={styles.detailItem}>
                <div className={styles.detailIcon}>📅</div>
                <div>
                  <strong>Date</strong>
                  <p>{formatDateForDisplay(appointmentDate)}</p>
                </div>
              </div>

              <div className={styles.detailItem}>
                <div className={styles.detailIcon}>🕐</div>
                <div>
                  <strong>Time</strong>
                  <p>{formatTimeForDisplay(appointmentTime)}</p>
                </div>
              </div>

              <div className={styles.detailItem}>
                <div className={styles.detailIcon}>
                  {appointmentType === 'physical' ? '🏥' : '💻'}
                </div>
                <div>
                  <strong>Type</strong>
                  <p>{appointmentType === 'physical' ? 'Physical Consultation' : 'Online Consultation'}</p>
                </div>
              </div>

              <div className={styles.detailItem}>
                <div className={styles.detailIcon}>💰</div>
                <div>
                  <strong>Amount Paid</strong>
                  <p>Rs. {parseFloat(amount).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className={styles.paymentInfo}>
            <h3>Payment Information</h3>
            <div className={styles.paymentDetails}>
              <div className={styles.paymentRow}>
                <span>Appointment ID:</span>
                <span>#{appointmentId}</span>
              </div>
              <div className={styles.paymentRow}>
                <span>Transaction ID:</span>
                <span>{transactionId}</span>
              </div>
              <div className={styles.paymentRow}>
                <span>Payment Status:</span>
                <span className={styles.statusPaid}>Paid</span>
              </div>
              <div className={styles.paymentRow}>
                <span>Payment Date:</span>
                <span>{new Date().toLocaleDateString('en-GB', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</span>
              </div>
            </div>
          </div>

          {/* Online Meeting Information */}
          {appointmentType === 'online' && (
            <div className={styles.meetingInfo}>
              <h3>📹 Online Meeting Information</h3>
              <div className={styles.meetingDetails}>
                <p>
                  Your online consultation will be conducted via secure video call. 
                  You will receive the meeting link via SMS and email before your appointment.
                </p>
                <div className={styles.meetingTips}>
                  <h4>Before your online consultation:</h4>
                  <ul>
                    <li>✅ Ensure you have a stable internet connection</li>
                    <li>✅ Test your camera and microphone</li>
                    <li>✅ Find a quiet, private space for the consultation</li>
                    <li>✅ Have any relevant medical documents ready</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Physical Appointment Information */}
          {appointmentType === 'physical' && (
            <div className={styles.physicalInfo}>
              <h3>🏥 Physical Consultation Information</h3>
              <div className={styles.physicalDetails}>
                <p>
                  Please arrive 15 minutes before your scheduled appointment time. 
                  Bring a valid ID and any relevant medical documents.
                </p>
                <div className={styles.physicalTips}>
                  <h4>For your physical consultation:</h4>
                  <ul>
                    <li>✅ Arrive 15 minutes early for check-in</li>
                    <li>✅ Bring a valid government-issued ID</li>
                    <li>✅ Bring any relevant medical records or test results</li>
                    <li>✅ Prepare a list of questions or concerns</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Important Notes */}
          <div className={styles.importantNotes}>
            <h3>⚠️ Important Information</h3>
            <div className={styles.notesList}>
              <div className={styles.noteItem}>
                <strong>Cancellation Policy:</strong>
                <p>Appointments can be cancelled up to 24 hours before the scheduled time for a full refund.</p>
              </div>
              <div className={styles.noteItem}>
                <strong>Rescheduling:</strong>
                <p>If you need to reschedule, please contact us at least 4 hours before your appointment.</p>
              </div>
              <div className={styles.noteItem}>
                <strong>Contact Information:</strong>
                <p>For any questions or concerns, please contact our support team at +94 77 123 4567</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className={styles.actionButtons}>
            <button 
              onClick={() => navigate('/family-member/appointments')}
              className={styles.primaryButton}
            >
              View All Appointments
            </button>
            
            <button 
              onClick={() => navigate('/family-member/elder-doctors')}
              className={styles.secondaryButton}
            >
              Book Another Appointment
            </button>
            
            <button 
              onClick={() => window.print()}
              className={styles.printButton}
            >
              Print Receipt
            </button>
          </div>

          {/* Footer Message */}
          <div className={styles.footerMessage}>
            <p>
              Thank you for choosing our healthcare services. We look forward to providing you with 
              excellent healthcare consultation.
            </p>
          </div>
        </div>
      </div>
    </FamilyMemberLayout>
  );
};

export default HealthcarePaymentSuccess;