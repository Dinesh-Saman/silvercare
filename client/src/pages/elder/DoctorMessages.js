import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { elderDoctorChatApi } from '../../services/elderDoctorChatApi';
import { getElderDetailsByEmail } from '../../services/elderApi2';
import ElderDoctorChat from '../../components/Chat/ElderDoctorChat';
import SuccessNotification from '../../components/SuccessNotification';
import Navbar from "../../components/navbar";
import ElderLayout from "../../components/ElderLayout";
import styles from './DoctorMessages.module.css';

const DoctorMessages = () => {
  const { currentUser } = useAuth();
  const [elderDetails, setElderDetails] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState(null);

  // First get elder details by email, then fetch doctors
  const fetchElderDetails = async () => {
    if (!currentUser?.email) {
      console.log('No current user email found');
      return;
    }

    try {
      console.log('Fetching elder details for email:', currentUser.email);
      const response = await getElderDetailsByEmail(currentUser.email);
      
      console.log('Elder details response:', response.data);
      setElderDetails(response.data);
      
      // Now fetch doctors with the elder_id
      if (response.data.elder_id) {
        await fetchDoctors(response.data.elder_id);
      }
    } catch (error) {
      console.error('Error fetching elder details:', error);
      setError('Failed to load elder information. Please try again.');
      setLoading(false);
    }
  };

  // Fetch doctors that have appointments with the elder
  const fetchDoctors = async (elderId) => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching doctors for elder_id:', elderId);
      const response = await elderDoctorChatApi.getDoctorsWithAppointments(elderId);
      
      console.log('Doctors response:', response);
      
      if (response.success) {
        setDoctors(response.doctors || []);
        
        if (response.doctors && response.doctors.length === 0) {
          setNotification({
            message: 'No doctors available for chat. You need confirmed or completed appointments to chat with doctors.',
            type: 'info'
          });
        }
      } else {
        setError(response.message || 'Failed to load doctors');
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setError('Failed to load doctors. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter doctors based on search term
  const filteredDoctors = doctors.filter(doctor =>
    doctor.doctor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle doctor selection for chat
  const handleDoctorSelect = (doctor) => {
    console.log('Selected doctor for chat:', doctor);
    setSelectedDoctor(doctor);
  };

  // Handle closing chat
  const handleCloseChat = () => {
    setSelectedDoctor(null);
  };

  // Get status badge color
  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return styles.statusConfirmed;
      case 'completed':
        return styles.statusCompleted;
      case 'pending':
        return styles.statusPending;
      case 'cancelled':
        return styles.statusCancelled;
      default:
        return styles.statusDefault;
    }
  };

  // Load elder details and doctors on component mount
  useEffect(() => {
    fetchElderDetails();
  }, [currentUser?.email]);

  if (loading) {
    return (
      <div className={styles.container}>
        
        <div className={styles.header}>
          <h1>💬 Doctor Messages</h1>
          <p>Connect with your healthcare providers</p>
        </div>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading your doctors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
         <Navbar />
         <ElderLayout>
      {/* Notification */}
      {notification && (
        <SuccessNotification
          message={notification.message}
          onClose={() => setNotification(null)}
          type={notification.type}
        />
      )}

      <div className={styles.header}>
        <h1>💬 Doctor Messages</h1>
        <p>Chat with doctors who have appointments with you</p>
      </div>

      {error && (
        <div className={styles.errorMessage}>
          <span>⚠️ {error}</span>
          <button onClick={fetchElderDetails} className={styles.retryButton}>
            Try Again
          </button>
        </div>
      )}

      {/* Chat Interface */}
      {selectedDoctor && elderDetails ? (
        <div className={styles.chatInterface}>
          <ElderDoctorChat
            currentUser={{
              user_id: elderDetails.user_details?.user_id,
              name: elderDetails.name,
              elder_id: elderDetails.elder_id
            }}
            selectedDoctor={selectedDoctor}
            onClose={handleCloseChat}
          />
        </div>
      ) : (
        <>
          {/* Search Bar */}
          {doctors.length > 0 && (
            <div className={styles.searchContainer}>
              <div className={styles.searchBox}>
                <span className={styles.searchIcon}>🔍</span>
                <input
                  type="text"
                  placeholder="Search doctors by name or specialization..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
            </div>
          )}

          {/* Doctors List */}
          <div className={styles.doctorsContainer}>
            {filteredDoctors.length === 0 ? (
              <div className={styles.emptyState}>
                {doctors.length === 0 ? (
                  <>
                    <div className={styles.emptyIcon}>👨‍⚕️</div>
                    <h3>No Doctors Available</h3>
                    <p>
                      You need to have confirmed or completed appointments with doctors 
                      to start chatting with them.
                    </p>
                    <div className={styles.helpText}>
                      <h4>To chat with doctors:</h4>
                      <ul>
                        <li>Book an appointment with a doctor</li>
                        <li>Wait for the appointment to be confirmed</li>
                        <li>After confirmation, you can start chatting</li>
                      </ul>
                    </div>
                  </>
                ) : (
                  <>
                    <div className={styles.emptyIcon}>🔍</div>
                    <h3>No doctors found</h3>
                    <p>No doctors match your search criteria.</p>
                  </>
                )}
              </div>
            ) : (
              <div className={styles.doctorsGrid}>
                {filteredDoctors.map((doctor) => (
                  <div
                    key={doctor.user_id}
                    className={styles.doctorCard}
                    onClick={() => handleDoctorSelect(doctor)}
                  >
                    <div className={styles.doctorHeader}>
                      <div className={styles.doctorAvatar}>
                        👨‍⚕️
                      </div>
                      <div className={styles.doctorInfo}>
                        <h3 className={styles.doctorName}>
                          Dr. {doctor.doctor_name}
                        </h3>
                        <p className={styles.doctorSpecialization}>
                          {doctor.specialization}
                        </p>
                      </div>
                      <div className={styles.chatIndicator}>
                        💬
                      </div>
                    </div>
                    
                    <div className={styles.doctorDetails}>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Experience:</span>
                        <span className={styles.detailValue}>
                          {doctor.years_experience} years
                        </span>
                      </div>
                      
                      {doctor.appointment_status && (
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>Status:</span>
                          <span className={`${styles.statusBadge} ${getStatusBadgeClass(doctor.appointment_status)}`}>
                            {doctor.appointment_status}
                          </span>
                        </div>
                      )}
                      
                      {doctor.appointment_date && (
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>Latest Appointment:</span>
                          <span className={styles.detailValue}>
                            {new Date(doctor.appointment_date).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className={styles.cardFooter}>
                      <button className={styles.chatButton}>
                        <span>💬</span>
                        Start Chat
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
          </div>
        </>
      )}
      </ElderLayout>
    </div>
  );
};

export default DoctorMessages;
