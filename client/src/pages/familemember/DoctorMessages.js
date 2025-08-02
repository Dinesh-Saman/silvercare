import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { doctormessageApi } from '../../services/doctormessageApi';
import Navbar from '../../components/navbar';
import FamilyMemberLayout from '../../components/FamilyMemberLayout';
import styles from '../../components/css/familymember/DoctorMessages.module.css';

const DoctorMessages = () => {
  const { currentUser, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [doctors, setDoctors] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [appointmentHistory, setAppointmentHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Redirect if not authenticated or not family member
  useEffect(() => {
    if (!loading && (!isAuthenticated || currentUser?.role !== 'family_member')) {
      navigate('/login');
    }
  }, [currentUser, loading, isAuthenticated, navigate]);

  // Fetch doctors with appointments
  useEffect(() => {
    const fetchDoctorsWithAppointments = async () => {
      if (!currentUser?.user_id) return;
      
      try {
        setDataLoading(true);
        setError(null);
        
        const response = await doctormessageApi.getDoctorsWithAppointments(currentUser.user_id);
        
        if (response.success) {
          setDoctors(response.doctors);
        }
        
      } catch (err) {
        console.error('Error fetching doctors with appointments:', err);
        setError('Failed to load doctors');
      } finally {
        setDataLoading(false);
      }
    };

    if (currentUser && currentUser.role === 'family_member') {
      fetchDoctorsWithAppointments();
    }
  }, [currentUser]);

  // Fetch appointment history for selected doctor
  const handleDoctorSelect = async (doctor) => {
    setSelectedDoctor(doctor);
    setHistoryLoading(true);
    
    try {
      const response = await doctormessageApi.getAppointmentHistoryWithDoctor(
        currentUser.user_id, 
        doctor.doctor_id
      );
      
      if (response.success) {
        setAppointmentHistory(response.appointments);
      }
    } catch (err) {
      console.error('Error fetching appointment history:', err);
      setError('Failed to load appointment history');
    } finally {
      setHistoryLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'confirmed':
        return styles.statusConfirmed;
      case 'completed':
        return styles.statusCompleted;
      default:
        return styles.statusDefault;
    }
  };

  if (loading || dataLoading) {
    return (
      <div className={styles.container}>
    
        <FamilyMemberLayout>
          <div className={styles.content}>
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <h2>Loading doctors...</h2>
            </div>
          </div>
        </FamilyMemberLayout>
      </div>
    );
  }

  return (
    <div className={styles.container}>
        <Navbar />
      <FamilyMemberLayout>
        <div className={styles.content}>
          <div className={styles.header}>
            <div className={styles.headerContent}>
              <h1 className={styles.title}>💬 Doctor Messages</h1>
              <p className={styles.subtitle}>
                Chat with doctors who have treated your registered elders
              </p>
            </div>
            <button 
              className={styles.backButton}
              onClick={() => navigate('/family-member/dashboard')}
            >
              ← Back to Dashboard
            </button>
          </div>

          {error && (
            <div className={styles.errorMessage}>
              <span className={styles.errorIcon}>⚠️</span>
              {error}
            </div>
          )}

          <div className={styles.mainContent}>
            {/* Doctors List */}
            <div className={styles.doctorsSection}>
              <h2 className={styles.sectionTitle}>
                👨‍⚕️ Available Doctors ({doctors.length})
              </h2>
              
              {doctors.length === 0 ? (
                <div className={styles.noDoctors}>
                  <div className={styles.noDoctorsIcon}>👨‍⚕️</div>
                  <h3>No Doctors Available for Chat</h3>
                  <p>
                    You can only message doctors who have confirmed or completed appointments 
                    with your registered elders.
                  </p>
                  <button 
                    className={styles.bookAppointmentButton}
                    onClick={() => navigate('/family-member/elders')}
                  >
                    Book New Appointment
                  </button>
                </div>
              ) : (
                <div className={styles.doctorsList}>
                  {doctors.map((doctor) => (
                    <div 
                      key={doctor.doctor_id} 
                      className={`${styles.doctorCard} ${selectedDoctor?.doctor_id === doctor.doctor_id ? styles.selectedDoctor : ''}`}
                      onClick={() => handleDoctorSelect(doctor)}
                    >
                      <div className={styles.doctorInfo}>
                        <div className={styles.doctorHeader}>
                          <h3 className={styles.doctorName}>{doctor.doctor_name}</h3>
                          <span className={styles.specialization}>{doctor.specialization}</span>
                        </div>
                        
                        <div className={styles.doctorDetails}>
                          <p><strong>Institution:</strong> {doctor.current_institution}</p>
                          <p><strong>Experience:</strong> {doctor.years_experience} years</p>
                          <p><strong>District:</strong> {doctor.doctor_district}</p>
                          <p><strong>Elders Treated:</strong> {doctor.elders_treated}</p>
                        </div>
                        
                        <div className={styles.appointmentStats}>
                          <div className={styles.statItem}>
                            <span className={styles.statNumber}>{doctor.total_appointments}</span>
                            <span className={styles.statLabel}>Total</span>
                          </div>
                          <div className={styles.statItem}>
                            <span className={styles.statNumber}>{doctor.confirmed_appointments}</span>
                            <span className={styles.statLabel}>Confirmed</span>
                          </div>
                          <div className={styles.statItem}>
                            <span className={styles.statNumber}>{doctor.completed_appointments}</span>
                            <span className={styles.statLabel}>Completed</span>
                          </div>
                        </div>
                        
                        <div className={styles.lastAppointment}>
                          <small>Last appointment: {formatDate(doctor.latest_appointment_date)}</small>
                        </div>
                      </div>
                      
                      <div className={styles.chatButton}>
                        <span>💬 Chat</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Chat/History Section */}
            {selectedDoctor && (
              <div className={styles.chatSection}>
                <div className={styles.chatHeader}>
                  <h2 className={styles.sectionTitle}>
                    💬 Chat with Dr. {selectedDoctor.doctor_name}
                  </h2>
                  <p className={styles.chatSubtitle}>
                    Appointment History & Messages
                  </p>
                </div>

                {historyLoading ? (
                  <div className={styles.historyLoading}>
                    <div className={styles.loadingSpinner}></div>
                    <p>Loading appointment history...</p>
                  </div>
                ) : (
                  <div className={styles.appointmentHistory}>
                    <h3 className={styles.historyTitle}>
                      📋 Appointment History ({appointmentHistory.length})
                    </h3>
                    
                    {appointmentHistory.length === 0 ? (
                      <div className={styles.noHistory}>
                        <p>No appointment history found</p>
                      </div>
                    ) : (
                      <div className={styles.historyList}>
                        {appointmentHistory.map((appointment) => (
                          <div key={appointment.appointment_id} className={styles.historyItem}>
                            <div className={styles.historyHeader}>
                              <div className={styles.historyInfo}>
                                <h4>{appointment.elder_name}</h4>
                                <span className={styles.appointmentType}>
                                  {appointment.appointment_type}
                                </span>
                              </div>
                              <div className={styles.historyMeta}>
                                <span className={`${styles.statusBadge} ${getStatusBadgeClass(appointment.status)}`}>
                                  {appointment.status}
                                </span>
                                <span className={styles.appointmentDate}>
                                  {formatDate(appointment.date_time)}
                                </span>
                              </div>
                            </div>
                            
                            {appointment.notes && (
                              <div className={styles.appointmentNotes}>
                                <strong>Notes:</strong> {appointment.notes}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Future: Chat interface would go here */}
                    <div className={styles.chatInterface}>
                      <div className={styles.comingSoon}>
                        <h4>💬 Chat Interface</h4>
                        <p>Real-time messaging feature coming soon!</p>
                        <div className={styles.contactInfo}>
                          <p><strong>Contact Dr. {selectedDoctor.doctor_name}:</strong></p>
                          <p>📧 {selectedDoctor.doctor_email}</p>
                          <p>📞 {selectedDoctor.doctor_phone}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </FamilyMemberLayout>
    </div>
  );
};

export default DoctorMessages;