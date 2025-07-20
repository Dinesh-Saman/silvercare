import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { appointmentApi } from '../../services/appointmentApi';
import Navbar from '../../components/navbar';
import FamilyMemberLayout from '../../components/FamilyMemberLayout';
import styles from '../../components/css/familymember/appointments.module.css';

const AppointmentHistory = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'completed', 'cancelled'

  useEffect(() => {
    fetchAppointmentHistory();
  }, [currentUser, filter]);

  const fetchAppointmentHistory = async () => {
    if (!currentUser?.user_id) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch appointments with completed or cancelled status
      const response = await appointmentApi.getAppointmentHistory(currentUser.user_id, {
        status: filter === 'all' ? undefined : filter
      });

      if (response.success) {
        setAppointments(response.appointments);
      }
    } catch (err) {
      console.error('Error fetching appointment history:', err);
      setError('Failed to load appointment history');
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#27ae60'; // Green
      case 'cancelled':
        return '#e74c3c'; // Red
      default:
        return '#95a5a6'; // Gray
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'cancelled':
        return '❌';
      default:
        return '📅';
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <FamilyMemberLayout>
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <h2>Loading appointment history...</h2>
          </div>
        </FamilyMemberLayout>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <FamilyMemberLayout>
        <div className={styles.appointmentsContainer}>
          <div className={styles.appointmentsHeader}>
            <h1 className={styles.appointmentsTitle}>Appointment History</h1>
            <p className={styles.appointmentsSubtitle}>
              View your past appointments - completed and cancelled
            </p>
          </div>

          {/* Filter Buttons */}
          <div className={styles.filterContainer}>
            <button
              className={`${styles.filterButton} ${filter === 'all' ? styles.active : ''}`}
              onClick={() => setFilter('all')}
            >
              All History
            </button>
            <button
                           className={`${styles.filterButton} ${filter === 'completed' ? styles.active : ''}`}
              onClick={() => setFilter('completed')}
            >
              Completed
            </button>
            <button
              className={`${styles.filterButton} ${filter === 'cancelled' ? styles.active : ''}`}
              onClick={() => setFilter('cancelled')}
            >
              Cancelled
            </button>
          </div>

          {error && (
            <div className={styles.errorMessage}>
              <p>⚠️ {error}</p>
            </div>
          )}

          {appointments.length === 0 ? (
            <div className={styles.noAppointments}>
              <div className={styles.noAppointmentsIcon}>📋</div>
              <h2>No Appointment History</h2>
              <p>
                {filter === 'all' 
                  ? "You don't have any completed or cancelled appointments yet."
                  : `You don't have any ${filter} appointments yet.`
                }
              </p>
              <button 
                className={styles.backButton}
                onClick={() => navigate('/family-member/appointments')}
              >
                View Current Appointments
              </button>
            </div>
          ) : (
            <div className={styles.appointmentsList}>
              {appointments.map((appointment) => (
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
                      <span 
                        className={styles.statusBadge}
                        style={{ backgroundColor: getStatusColor(appointment.status) }}
                      >
                        {getStatusIcon(appointment.status)} {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
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
                          <span className={styles.detailLabel}>📅 Date & Time:</span>
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
                        {appointment.payment_amount && (
                          <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>💰 Amount:</span>
                            <span className={styles.detailValue}>Rs. {appointment.payment_amount}</span>
                          </div>
                        )}
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>📅 Booked on:</span>
                          <span className={styles.detailValue}>
                            {new Date(appointment.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {appointment.notes && (
                        <div className={styles.appointmentNotes}>
                          <strong>Notes:</strong> {appointment.notes}
                        </div>
                      )}

                      {appointment.cancellation_reason && (
                        <div className={styles.cancellationReason}>
                          <strong>Cancellation Reason:</strong> {appointment.cancellation_reason}
                        </div>
                      )}

                      {appointment.refund_amount && (
                        <div className={styles.refundInfo}>
                          <strong>Refund:</strong> Rs. {appointment.refund_amount} 
                          {appointment.refund_status && (
                            <span className={styles.refundStatus}>
                              ({appointment.refund_status})
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={styles.appointmentActions}>
                    {appointment.status === 'completed' && (
                      <button
                        className={styles.viewDetailsButton}
                        onClick={() => navigate(`/family-member/appointment/${appointment.appointment_id}`)}
                      >
                        View Details
                      </button>
                    )}
                    
                    {appointment.status === 'completed' && (
                      <button
                        className={styles.bookAgainButton}
                        onClick={() => navigate(`/family-member/elder/${appointment.elder_id}/doctors`)}
                      >
                        Book Again
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Summary Statistics */}
          {appointments.length > 0 && (
            <div className={styles.summaryStats}>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>
                  {appointments.filter(apt => apt.status === 'completed').length}
                </span>
                <span className={styles.statLabel}>Completed</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>
                  {appointments.filter(apt => apt.status === 'cancelled').length}
                </span>
                <span className={styles.statLabel}>Cancelled</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>{appointments.length}</span>
                <span className={styles.statLabel}>Total History</span>
              </div>
            </div>
          )}
        </div>
      </FamilyMemberLayout>
    </div>
  );
};

export default AppointmentHistory;

