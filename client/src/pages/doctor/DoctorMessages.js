import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { doctorChatApi } from '../../services/doctorChatApi';
import Navbar from '../../components/navbar';
import DoctorLayout from '../../components/DoctorLayout';
import DoctorChat from '../../components/Chat/DoctorChat';
import styles from '../../components/css/doctor/DoctorMessages.module.css';

const DoctorMessages2 = () => {
  const { currentUser, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [familyMembers, setFamilyMembers] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFamilyMember, setSelectedFamilyMember] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [doctorInfo, setDoctorInfo] = useState(null);

  // Redirect if not authenticated or not doctor
  useEffect(() => {
    if (!loading && (!isAuthenticated || currentUser?.role !== 'doctor')) {
      navigate('/login');
    }
  }, [currentUser, loading, isAuthenticated, navigate]);

  // Fetch family members with appointments
  useEffect(() => {
    const fetchDoctorAndFamilyMembers = async () => {
      if (!currentUser?.user_id) return;
      
      try {
        setDataLoading(true);
        setError(null);
        
        // First, get doctor information to get doctor_id
        console.log('Fetching doctor info for user ID:', currentUser.user_id);
        const doctorResponse = await fetch(`http://localhost:5000/api/doctor/user/${currentUser.user_id}`);
        const doctorData = await doctorResponse.json();
        
        console.log('Doctor API response:', doctorData);
        
        if (!doctorResponse.ok || !doctorData.doctor) {
          throw new Error('Failed to fetch doctor information');
        }
        
        setDoctorInfo(doctorData.doctor);
        
        // Then fetch family members using doctor_id
        console.log('Fetching family members for doctor ID:', doctorData.doctor.doctor_id);
        const response = await doctorChatApi.getFamilyMembersWithAppointments(doctorData.doctor.doctor_id);
        
        if (response.success) {
          setFamilyMembers(response.familyMembers);
        }
        
      } catch (err) {
        console.error('Error fetching doctor and family members:', err);
        setError('Failed to load family members');
      } finally {
        setDataLoading(false);
      }
    };

    if (currentUser && currentUser.role === 'doctor') {
      fetchDoctorAndFamilyMembers();
    }
  }, [currentUser]);

  // Handle family member selection and show chat
  const handleFamilyMemberSelect = async (familyMember) => {
    setSelectedFamilyMember(familyMember);
    setShowChat(true);
  };

  // Handle closing chat
  const handleCloseChat = () => {
    setShowChat(false);
    setSelectedFamilyMember(null);
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

  if (loading || dataLoading) {
    return (
      <div className={styles.container}>
        <DoctorLayout>
          <div className={styles.content}>
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <h2>Loading family members...</h2>
            </div>
          </div>
        </DoctorLayout>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Navbar />
      <DoctorLayout>
        <div className={styles.content}>
          <div className={styles.header}>
            <div className={styles.headerContent}>
              <h1 className={styles.title}>💬 Family Messages</h1>
              <p className={styles.subtitle}>
                Chat with family members of your patients
              </p>
            </div>
            <button 
              className={styles.backButton}
              onClick={() => navigate('/doctor/dashboard')}
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
            {/* Family Members List */}
            <div className={styles.familyMembersSection}>
              <h2 className={styles.sectionTitle}>
                👨‍👩‍👧‍👦 Available Family Members ({familyMembers.length})
              </h2>
              
              {familyMembers.length === 0 ? (
                <div className={styles.noFamilyMembers}>
                  <div className={styles.noFamilyMembersIcon}>👨‍👩‍👧‍👦</div>
                  <h3>No Family Members Available for Chat</h3>
                  <p>
                    You can only message family members who have confirmed or completed appointments 
                    for their registered elders.
                  </p>
                  <button 
                    className={styles.viewAppointmentsButton}
                    onClick={() => navigate('/doctor/appointments')}
                  >
                    View Appointments
                  </button>
                </div>
              ) : (
                <div className={styles.familyMembersList}>
                  {familyMembers.map((familyMember) => (
                    <div 
                      key={familyMember.user_id} 
                      className={`${styles.familyMemberCard} ${selectedFamilyMember?.user_id === familyMember.user_id ? styles.selectedFamilyMember : ''}`}
                      onClick={() => handleFamilyMemberSelect(familyMember)}
                    >
                      <div className={styles.familyMemberInfo}>
                        <div className={styles.familyMemberHeader}>
                          <h3 className={styles.familyMemberName}>{familyMember.family_member_name}</h3>
                          <span className={styles.elderCount}>{familyMember.elders_count} Elder(s)</span>
                        </div>
                        
                        <div className={styles.familyMemberDetails}>
                          <p><strong>Email:</strong> <span>{familyMember.family_member_email}</span></p>
                          <p><strong>Phone:</strong> <span>{familyMember.family_member_phone}</span></p>
                          <p><strong>Address:</strong> <span>{familyMember.family_member_address}</span></p>
                          <p><strong>Elders Under Care:</strong> <span>{familyMember.elders_treated}</span></p>
                        </div>
                        
                        <div className={styles.appointmentStats}>
                          <div className={styles.statItem}>
                            <span className={styles.statNumber}>{familyMember.total_appointments}</span>
                            <span className={styles.statLabel}>Total</span>
                          </div>
                          <div className={styles.statItem}>
                            <span className={styles.statNumber}>{familyMember.confirmed_appointments}</span>
                            <span className={styles.statLabel}>Confirmed</span>
                          </div>
                          <div className={styles.statItem}>
                            <span className={styles.statNumber}>{familyMember.completed_appointments}</span>
                            <span className={styles.statLabel}>Completed</span>
                          </div>
                        </div>
                        
                        <div className={styles.lastAppointment}>
                          Last appointment: {formatDate(familyMember.latest_appointment_date)}
                        </div>
                      </div>
                      
                      <button className={styles.chatButton}>
                        💬 Chat
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Chat Section */}
            {selectedFamilyMember && showChat ? (
              <div className={styles.chatSection}>
                <DoctorChat 
                  currentUser={currentUser}
                  selectedFamilyMember={selectedFamilyMember}
                  onClose={handleCloseChat}
                />
              </div>
            ) : selectedFamilyMember ? (
              <div className={styles.chatSection}>
                <div className={styles.chatHeader}>
                  <h2 className={styles.sectionTitle}>
                    💬 Chat with {selectedFamilyMember.family_member_name}
                  </h2>
                </div>

                <div className={styles.chatInterface}>
                  <div className={styles.comingSoon}>
                    <h4>💬 Ready to Chat!</h4>
                    <p>Click the chat button to start messaging {selectedFamilyMember.family_member_name}</p>
                    <button 
                      className={styles.startChatButton}
                      onClick={() => setShowChat(true)}
                    >
                      Start Conversation
                    </button>
                    <div className={styles.contactInfo}>
                      <p><strong>Contact {selectedFamilyMember.family_member_name}:</strong></p>
                      <p>📧 {selectedFamilyMember.family_member_email}</p>
                      <p>📞 {selectedFamilyMember.family_member_phone}</p>
                      <p>👨‍👩‍👧‍👦 Guardian of {selectedFamilyMember.elders_count} elder(s)</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </DoctorLayout>
    </div>
  );
};

export default DoctorMessages2;
