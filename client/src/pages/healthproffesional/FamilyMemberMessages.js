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
      <div className={styles.container}>
        <Navbar />
        <div className={styles.layout}>
          <HealthProfessionalSidebar />
          <div className={styles.content}>
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <h2>Loading family members...</h2>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <Navbar />
        <div className={styles.layout}>
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
    <div className={styles.container}>
      <Navbar />
      <div className={styles.layout}>
        <HealthProfessionalSidebar />
        <div className={styles.content}>
          <div className={styles.header}>
            <div className={styles.headerContent}>
              <h1 className={styles.title}>👨‍👩‍👧‍👦 Family Member Chat</h1>
              <p className={styles.subtitle}>
                Connect with family members of your patients
              </p>
            </div>
            <button 
              className={styles.backButton}
              onClick={() => navigate('/healthprofessional/dashboard')}
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
                  <div className={styles.noFamilyMembersIcon}>👨‍👩‍👧‍�</div>
                  <h3>No Family Members Available for Chat</h3>
                  <p>
                    No family members are currently available for chat. Family members appear here when you have confirmed or completed appointments with them.
                  </p>
                </div>
              ) : (
                <div className={styles.familyMembersList}>
                  {familyMembers.map((familyMember) => (
                    <div 
                      key={familyMember.user_id} 
                      className={`${styles.familyMemberCard} ${selectedFamilyMember?.user_id === familyMember.user_id ? styles.selectedFamilyMember : ''}`}
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
                          <span className={styles.detailLabel}>Fixed Phone:</span>
                          <span className={styles.detailValue}>{familyMember.phone_fixed || 'Not provided'}</span>
                        </div>
                        <div className={styles.detailRow}>
                          <span className={styles.detailLabel}>Mobile:</span>
                          <span className={styles.detailValue}>{familyMember.family_member_phone}</span>
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
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Chat Section */}
            <div className={styles.chatSection}>
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
