import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { counselorFamilyMemberChatApi } from '../../services/counselorFamilyMemberChatApi';
import Navbar from '../../components/navbar';
import HealthProfessionalSidebar from '../../components/HealthProfessionalSidebar';
import CounselorFamilyMemberChat from '../../components/Chat/CounselorFamilyMemberChat';
import styles from './FamilyMemberMessages.module.css';

const FamilyMemberMessages = () => {
  const { currentUser, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [familyMembers, setFamilyMembers] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFamilyMember, setSelectedFamilyMember] = useState(null);
  const [showChat, setShowChat] = useState(false);

  // Redirect if not authenticated or not health professional
  useEffect(() => {
    if (!loading && (!isAuthenticated || currentUser?.role !== 'healthprofessional')) {
      navigate('/login');
    }
  }, [currentUser, loading, isAuthenticated, navigate]);

  // Fetch family members for chat
  useEffect(() => {
    const fetchFamilyMembersForChat = async () => {
      if (!currentUser?.counselor_id) return;
      
      try {
        setDataLoading(true);
        setError(null);
        
        console.log('Fetching family members for counselor:', currentUser.counselor_id);
        const response = await counselorFamilyMemberChatApi.getFamilyMembersWithAppointments(currentUser.counselor_id);
        
        if (response.success) {
          setFamilyMembers(response.familyMembers);
        }
        
      } catch (err) {
        console.error('Error fetching family members for chat:', err);
        setError('Failed to load family members');
      } finally {
        setDataLoading(false);
      }
    };

    if (currentUser && currentUser.counselor_id) {
      fetchFamilyMembersForChat();
    }
  }, [currentUser]);

  const handleFamilyMemberSelect = (familyMember) => {
    setSelectedFamilyMember(familyMember);
    setShowChat(true);
  };

  const handleCloseChat = () => {
    setShowChat(false);
    setSelectedFamilyMember(null);
  };

  if (loading || dataLoading) {
    return (
      <div className={styles.pageContainer}>
        <Navbar />
        <div className={styles.mainLayout}>
          <HealthProfessionalSidebar />
          <div className={styles.content}>
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p>Loading family members...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.pageContainer}>
        <Navbar />
        <div className={styles.mainLayout}>
          <HealthProfessionalSidebar />
          <div className={styles.content}>
            <div className={styles.errorContainer}>
              <h2>Error</h2>
              <p>{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className={styles.retryButton}
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <Navbar />
      <div className={styles.mainLayout}>
        <HealthProfessionalSidebar />
        <div className={styles.content}>
          <div className={styles.header}>
            <h1 className={styles.title}>Family Member Messages</h1>
            <p className={styles.subtitle}>
              Chat with family members who have appointments with you
            </p>
          </div>

          <div className={styles.chatLayout}>
            <div className={styles.familyMembersList}>
              <h3 className={styles.listTitle}>Family Members ({familyMembers.length})</h3>
              
              {familyMembers.length === 0 ? (
                <div className={styles.noFamilyMembers}>
                  <div className={styles.noFamilyMembersIcon}>👥</div>
                  <h4>No Family Members Available</h4>
                  <p>You don't have any family members with confirmed or completed appointments yet.</p>
                </div>
              ) : (
                <div className={styles.familyMembersGrid}>
                  {familyMembers.map((familyMember) => (
                    <div
                      key={familyMember.user_id}
                      className={`${styles.familyMemberCard} ${
                        selectedFamilyMember?.user_id === familyMember.user_id ? styles.selectedCard : ''
                      }`}
                      onClick={() => handleFamilyMemberSelect(familyMember)}
                    >
                      <div className={styles.familyMemberHeader}>
                        <div className={styles.familyMemberAvatar}>
                          {familyMember.family_member_name?.charAt(0).toUpperCase() || 'F'}
                        </div>
                        <div className={styles.familyMemberInfo}>
                          <h4 className={styles.familyMemberName}>
                            {familyMember.family_member_name}
                          </h4>
                          <p className={styles.familyMemberEmail}>
                            {familyMember.family_member_email}
                          </p>
                        </div>
                      </div>
                      
                      <div className={styles.familyMemberDetails}>
                        <div className={styles.detailRow}>
                          <span className={styles.label}>Fixed Phone:</span>
                          <span className={styles.value}>{familyMember.phone_fixed || 'Not provided'}</span>
                        </div>
                        <div className={styles.detailRow}>
                          <span className={styles.label}>Mobile Phone:</span>
                          <span className={styles.value}>{familyMember.family_member_phone}</span>
                        </div>
                      </div>

                      <div className={styles.appointmentStats}>
                        <div className={styles.stat}>
                          <span className={styles.statNumber}>{familyMember.total_appointments}</span>
                          <span className={styles.statLabel}>Total</span>
                        </div>
                        <div className={styles.stat}>
                          <span className={styles.statNumber}>{familyMember.confirmed_appointments}</span>
                          <span className={styles.statLabel}>Confirmed</span>
                        </div>
                        <div className={styles.stat}>
                          <span className={styles.statNumber}>{familyMember.completed_appointments}</span>
                          <span className={styles.statLabel}>Completed</span>
                        </div>
                      </div>

                      <div className={styles.lastAppointment}>
                        <span className={styles.lastAppointmentLabel}>Last Appointment:</span>
                        <span className={styles.lastAppointmentDate}>
                          {new Date(familyMember.latest_appointment_date).toLocaleDateString()}
                        </span>
                      </div>

                      <button className={styles.chatButton}>
                        💬 Start Chat
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.chatArea}>
              {showChat && selectedFamilyMember ? (
                <CounselorFamilyMemberChat
                  currentUser={currentUser}
                  selectedFamilyMember={selectedFamilyMember}
                  onClose={handleCloseChat}
                />
              ) : (
                <div className={styles.noChatSelected}>
                  <div className={styles.noChatIcon}>💬</div>
                  <h3>Select a Family Member</h3>
                  <p>Choose a family member from the list to start chatting</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FamilyMemberMessages;
