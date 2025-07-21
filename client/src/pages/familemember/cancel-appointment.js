import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { appointmentApi } from '../../services/appointmentApi';
import Navbar from '../../components/navbar';
import FamilyMemberLayout from '../../components/FamilyMemberLayout';
import styles from '../../components/css/familymember/cancel-appointment.module.css';

const CancelAppointment = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [cancelledAppointments, setCancelledAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCancelledAppointments();
  }, [currentUser]);

  const fetchCancelledAppointments = async () => {
    if (!currentUser?.user_id) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch only cancelled appointments
      const response = await appointmentApi.getAllAppointmentsByFamily(currentUser.user_id, {
        status: 'cancelled'
      });

      if (response.success) {
        setCancelledAppointments(response.appointments);
      }
    } catch (err) {
      console.error('Error fetching cancelled appointments:', err);
      setError('Failed to load cancelled appointments');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAppointmentTypeIcon = (type) => {
    return type === 'online' ? '💻' : '🏥';
  };

  const calculateDaysBetween = (date1, date2) => {
    const diffTime = Math.abs(new Date(date2) - new Date(date1));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getRefundStatus = (refundStatus) => {
    switch (refundStatus) {
      case 'pending':
        return { color: '#f39c12', text: 'Refund Pending' };
      case 'processed':
        return { color: '#27ae60', text: 'Refund Processed' };
      case 'completed':
        return { color: '#27ae60', text: 'Refund Completed' };
      case 'failed':
        return { color: '#e74c3c', text: 'Refund Failed' };
      default:
        return { color: '#95a5a6', text: 'No Refund' };
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <FamilyMemberLayout>
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <h2>Loading cancelled appointments...</h2>
          </div>
        </FamilyMemberLayout>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Navbar />
      <FamilyMemberLayout>
        <div className={styles.appointmentsContainer}>
          <div className={styles.appointmentsHeader}>
            <h1 className={styles.appointmentsTitle}>Cancelled Appointments</h1>
            <p className={styles.appointmentsSubtitle}>
              View all your cancelled appointments and refund status
            </p>
          </div>

          {error && (
            <div className={styles.errorMessage}>
              <p>⚠️ {error}</p>
            </div>
          )}

          {cancelledAppointments.length === 0 ? (
            <div className={styles.noAppointments}>
              <div className={styles.noAppointmentsIcon}>❌</div>
              <h2>No Cancelled Appointments</h2>
              <p>You don't have any cancelled appointments.</p>
              <p className={styles.infoText}>
                All your appointments are either confirmed, completed, or pending.
              </p>
              <button 
                className={styles.backButton}
                onClick={() => navigate('/family-member/appointments')}
              >
                View All Appointments
              </button>
            </div>
          ) : (
            <>
              {/* Summary Stats */}
              <div className={styles.summaryStats}>
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>❌</div>
                  <div className={styles.statContent}>
                    <h3 className={styles.statNumber}>{cancelledAppointments.length}</h3>
                    <p className={styles.statLabel}>Total Cancelled</p>
                  </div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>💰</div>
                  <div className={styles.statContent}>
                    <h3 className={styles.statNumber}>
                      {cancelledAppointments.filter(apt => apt.refund_amount > 0).length}
                    </h3>
                    <p className={styles.statLabel}>With Refunds</p>
                  </div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>⏳</div>
                  <div className={styles.statContent}>
                    <h3 className={styles.statNumber}>
                      {cancelledAppointments.filter(apt => apt.refund_status === 'pending').length}
                    </h3>
                    <p className={styles.statLabel}>Pending Refunds</p>
                  </div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>✅</div>
                  <div className={styles.statContent}>
                    <h3 className={styles.statNumber}>
                      {cancelledAppointments.filter(apt => apt.refund_status === 'completed').length}
                    </h3>
                    <p className={styles.statLabel}>Refunds Completed</p>
                  </div>
                </div>
              </div>

              <div className={styles.appointmentsList}>
                {cancelledAppointments.map((appointment) => {
                  const refundInfo = getRefundStatus(appointment.refund_status);
                  const cancelledDate = new Date(appointment.updated_at);
                  const appointmentDate = new Date(appointment.date_time);
                  const daysBetween = calculateDaysBetween(appointment.created_at, appointment.updated_at);

                  return (
                    <div key={appointment.appointment_id} className={styles.appointmentCard}>
                      <div className={styles.appointmentHeader}>
                        <div className={styles.appointmentType}>
                          <span className={styles.typeIcon}>
                            {getAppointmentTypeIcon(appointment.appointment_type)}
                          </span>
                          <span className={styles.typeText}>
                            {appointment.appointment_type.charAt(0).toUpperCase() + appointment.appointment_type.slice(1)} Appointment
                          </span>
                        </div>
                        <div className={styles.appointmentStatus}>
                          <span className={`${styles.statusBadge} ${styles.cancelled}`}>
                            ❌ Cancelled
                          </span>
                        </div>
                      </div>

                      <div className={styles.appointmentContent}>
                        <div className={styles.appointmentDetails}>
                          <h3 className={styles.doctorName}>Dr. {appointment.doctor_name}</h3>
                          <p className={styles.specialization}>{appointment.specialization}</p>
                          
                          <div className={styles.detailsGrid}>
                            <div className={styles.detailItem}>
                              <span className={styles.detailLabel}>👤 Elder:</span>
                              <span className={styles.detailValue}>{appointment.elder_name}</span>
                            </div>
                            <div className={styles.detailItem}>
                              <span className={styles.detailLabel}>📅 Original Date & Time:</span>
                              <span className={styles.detailValue}>{formatDate(appointment.date_time)}</span>
                            </div>
                            <div className={styles.detailItem}>
                              <span className={styles.detailLabel}>🏥 Institution:</span>
                              <span className={styles.detailValue}>{appointment.current_institution}</span>
                            </div>
                            <div className={styles.detailItem}>
                              <span className={styles.detailLabel}>📍 District:</span>
                              <span className={styles.detailValue}>{appointment.doctor_district}</span>
                            </div>
                            <div className={styles.detailItem}>
                              <span className={styles.detailLabel}>📅 Cancelled On:</span>
                              <span className={styles.detailValue}>
                                {formatDate(appointment.updated_at)}
                              </span>
                            </div>
                            <div className={styles.detailItem}>
                              <span className={styles.detailLabel}>⏰ Days Before Cancellation:</span>
                              <span className={styles.detailValue}>
                                {daysBetween} day{daysBetween !== 1 ? 's' : ''} after booking
                              </span>
                            </div>
                            {appointment.payment_amount && (
                              <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>💰 Original Amount:</span>
                                <span className={styles.detailValue}>Rs. {appointment.payment_amount}</span>
                              </div>
                            )}
                            {appointment.refund_amount && (
                              <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>💸 Refund Amount:</span>
                                <span className={styles.detailValue}>Rs. {appointment.refund_amount}</span>
                              </div>
                            )}
                          </div>

                          {appointment.cancellation_reason && (
                            <div className={styles.cancellationReason}>
                              <strong>Cancellation Reason:</strong>
                              <p className={styles.reasonText}>{appointment.cancellation_reason}</p>
                            </div>
                          )}



                          {appointment.refund_amount > 0 && (
                            <div className={styles.refundInfo}>
                              <div className={styles.refundHeader}>
                                <strong>Refund Information:</strong>
                                <span 
                                  className={styles.refundStatus}
                                  style={{ backgroundColor: refundInfo.color }}
                                >
                                  {refundInfo.text}
                                </span>
                              </div>
                              <div className={styles.refundDetails}>
                                <p>Amount: Rs. {appointment.refund_amount}</p>
                                {appointment.refund_status === 'pending' && (
                                  <p className={styles.refundNote}>
                                    💡 Refunds are typically processed within 3-5 business days
                                  </p>
                                )}
                                {appointment.refund_status === 'completed' && (
                                  <p className={styles.refundNote}>
                                    ✅ Refund has been processed to your original payment method
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            </>
          )}


        </div>
      </FamilyMemberLayout>
    </div>
  );
};

export default CancelAppointment;
