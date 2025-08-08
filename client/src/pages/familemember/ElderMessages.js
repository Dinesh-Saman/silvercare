import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { elderChatApi } from '../../services/elderChatApi';
import Navbar from '../../components/navbar';
import FamilyMemberLayout from '../../components/FamilyMemberLayout';
import ElderChat from '../../components/Chat/ElderChat';
import styles from '../../components/css/familymember/ElderMessages.module.css';

const ElderMessages = () => {
  const { currentUser, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [elders, setElders] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedElder, setSelectedElder] = useState(null);
  const [showChat, setShowChat] = useState(false);

  // Redirect if not authenticated or not family member
  useEffect(() => {
    if (!loading && (!isAuthenticated || currentUser?.role !== 'family_member')) {
      navigate('/login');
    }
  }, [currentUser, loading, isAuthenticated, navigate]);

  // Fetch elders for chat
  useEffect(() => {
    const fetchEldersForChat = async () => {
      if (!currentUser?.user_id) return;
      
      try {
        setDataLoading(true);
        setError(null);
        
        const response = await elderChatApi.getEldersForChat(currentUser.user_id);
        
        if (response.success) {
          setElders(response.elders);
        }
        
      } catch (err) {
        console.error('Error fetching elders for chat:', err);
        setError('Failed to load elders');
      } finally {
        setDataLoading(false);
      }
    };

    if (currentUser && currentUser.role === 'family_member') {
      fetchEldersForChat();
    }
  }, [currentUser]);

  // Handle elder selection and show chat
  const handleElderSelect = async (elder) => {
    setSelectedElder(elder);
    setShowChat(true);
  };

  // Handle closing chat
  const handleCloseChat = () => {
    setShowChat(false);
    setSelectedElder(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
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
        <Navbar />
        <FamilyMemberLayout>
          <div className={styles.content}>
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <h2>Loading elders...</h2>
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
              <h1 className={styles.title}>💬 Elder Messages</h1>
              <p className={styles.subtitle}>
                Connect and chat with your family elders
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
            {/* Elders List */}
            <div className={styles.eldersSection}>
              <h2 className={styles.sectionTitle}>
                👥 Available Elders ({elders.length})
              </h2>
              
              {elders.length === 0 ? (
                <div className={styles.noElders}>
                  <div className={styles.noEldersIcon}>👥</div>
                  <h3>No Elders Available for Chat</h3>
                  <p>
                    No elders are currently assigned to your family for messaging.
                  </p>
                  <button 
                    className={styles.contactCareButton}
                    onClick={() => navigate('/family-member/elders')}
                  >
                    View Elders
                  </button>
                </div>
              ) : (
                <div className={styles.eldersList}>
                  {elders.map((elder) => (
                    <div 
                      key={elder.user_id} 
                      className={`${styles.elderCard} ${selectedElder?.user_id === elder.user_id ? styles.selectedElder : ''}`}
                      onClick={() => handleElderSelect(elder)}
                    >
                      <div className={styles.elderInfo}>
                        <div className={styles.elderHeader}>
                          <h3 className={styles.elderName}>{elder.name}</h3>
                          <span className={styles.elderAge}>Age {elder.age || 'N/A'}</span>
                        </div>
                        
                        <div className={styles.elderDetails}>
                          <p><strong>Gender:</strong> <span>{elder.gender}</span></p>
                          <p><strong>Location:</strong> <span>{elder.location || 'Not specified'}</span></p>
                          {elder.medical_conditions && (
                            <p><strong>Medical Conditions:</strong> <span>{elder.medical_conditions}</span></p>
                          )}
                          {elder.emergency_contact && (
                            <p><strong>Emergency Contact:</strong> <span>{elder.emergency_contact}</span></p>
                          )}
                        </div>
                        
                        <div className={styles.elderStats}>
                          <div className={styles.statItem}>
                            <span className={styles.statNumber}>{elder.total_messages || 0}</span>
                            <span className={styles.statLabel}>Messages</span>
                          </div>
                          <div className={styles.statItem}>
                            <span className={styles.statNumber}>{elder.care_requests || 0}</span>
                            <span className={styles.statLabel}>Care Requests</span>
                          </div>
                          <div className={styles.statItem}>
                            <span className={styles.statNumber}>{elder.appointments || 0}</span>
                            <span className={styles.statLabel}>Appointments</span>
                          </div>
                        </div>
                        
                        {elder.last_message_time && (
                          <div className={styles.lastActivity}>
                            Last activity: {formatDate(elder.last_message_time)}
                          </div>
                        )}
                      </div>
                      
                      <button className={styles.chatButton}>
                        💬 Chat
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Chat/History Section */}
            {selectedElder && showChat ? (
              <div className={styles.chatSection}>
                <ElderChat 
                  currentUser={currentUser}
                  selectedElder={selectedElder}
                  onClose={handleCloseChat}
                />
              </div>
            ) : selectedElder ? (
              <div className={styles.chatSection}>
                <div className={styles.chatHeader}>
                  <h2 className={styles.sectionTitle}>
                    💬 Chat with {selectedElder.name}
                  </h2>
                </div>

                <div className={styles.elderHistory}>
                  <div className={styles.chatInterface}>
                    <div className={styles.comingSoon}>
                      <h4>💬 Ready to Chat!</h4>
                      <p>Click the chat button to start messaging {selectedElder.name}</p>
                      <button 
                        className={styles.startChatButton}
                        onClick={() => setShowChat(true)}
                      >
                        Start Conversation
                      </button>
                      <div className={styles.contactInfo}>
                        <p><strong>Elder Information:</strong></p>
                        <p>👤 {selectedElder.name}</p>
                        <p>⚧ {selectedElder.gender}</p>
                        <p>🎂 Age {selectedElder.age || 'N/A'}</p>
                        {selectedElder.location && <p>📍 {selectedElder.location}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </FamilyMemberLayout>
    </div>
  );
};

export default ElderMessages;
