import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { elderChatApi } from '../../services/elderChatApi';
import ElderChat from '../../components/Chat/ElderChat';
import { messagesApi } from '../../services/messagesApi';
import Navbar from '../../components/navbar';
import FamilyMemberLayout from '../../components/FamilyMemberLayout';
import styles from '../../components/css/familymember/ElderMessages.module.css';

const ElderMessages = () => {
  const { currentUser } = useAuth();
  const [elders, setElders] = useState([]);
  const [selectedElder, setSelectedElder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});

  // Fetch elders for chat
  const fetchElders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('ElderMessages - Fetching elders for family member:', currentUser?.user_id);
      
      if (!currentUser?.user_id) {
        throw new Error('User not authenticated');
      }

      const response = await elderChatApi.getEldersForChat(currentUser.user_id);
      
      if (response.success) {
        console.log('ElderMessages - Elders fetched successfully:', response.elders);
        setElders(response.elders);
        
        // Fetch unread message counts for each elder
        await fetchUnreadCounts(response.elders);
      } else {
        throw new Error(response.message || 'Failed to fetch elders');
      }
    } catch (error) {
      console.error('Error fetching elders:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch unread message counts
  const fetchUnreadCounts = async (eldersList) => {
    try {
      const counts = {};
      
      for (const elder of eldersList) {
        try {
          const response = await messagesApi.getUnreadCount(currentUser.user_id, elder.user_id);
          if (response.success) {
            counts[elder.user_id] = response.count;
          }
        } catch (error) {
          console.error(`Error fetching unread count for elder ${elder.user_id}:`, error);
          counts[elder.user_id] = 0;
        }
      }
      
      setUnreadCounts(counts);
    } catch (error) {
      console.error('Error fetching unread counts:', error);
    }
  };

  // Handle elder selection for chat
  const handleElderSelect = (elder) => {
    console.log('ElderMessages - Elder selected for chat:', elder);
    setSelectedElder(elder);
    
    // Reset unread count for this elder
    setUnreadCounts(prev => ({
      ...prev,
      [elder.user_id]: 0
    }));
  };

  // Handle closing chat
  const handleCloseChat = () => {
    setSelectedElder(null);
    // Refresh elders list to update any changes
    fetchElders();
  };

  // Format last message time
  const formatLastMessageTime = (timestamp) => {
    if (!timestamp) return '';
    
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - messageTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return messageTime.toLocaleDateString();
  };

  // Initial load
  useEffect(() => {
    if (currentUser?.user_id) {
      fetchElders();
    }
  }, [currentUser?.user_id]);

  // Periodic refresh of unread counts
  useEffect(() => {
    if (elders.length > 0 && !selectedElder) {
      const interval = setInterval(() => {
        fetchUnreadCounts(elders);
      }, 10000); // Refresh every 10 seconds
      
      return () => clearInterval(interval);
    }
  }, [elders, selectedElder, currentUser?.user_id]);

  if (loading) {
    return (
      <div className={styles.container}>
        
        <div className={styles.header}>
          <h1>💬 Elder Messages</h1>
          <p>Connect with your family elders</p>
        </div>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading elders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>💬 Elder Messages</h1>
          <p>Connect with your family elders</p>
        </div>
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>⚠️</div>
          <h3>Unable to Load Elders</h3>
          <p>{error}</p>
          <button className={styles.retryButton} onClick={fetchElders}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (selectedElder) {
    return (
      <div className={styles.container}>
        <ElderChat
          currentUser={currentUser}
          selectedElder={selectedElder}
          onClose={handleCloseChat}
        />
      </div>
    );
  }

  return (
    <div className={styles.container}>
         <Navbar />
         <FamilyMemberLayout>
      <div className={styles.header}>
        <h1>💬 Elder Messages</h1>
        <p>Connect with your family elders</p>
      </div>

      <div className={styles.content}>
        {elders.length === 0 ? (
          <div className={styles.noElders}>
            <div className={styles.noEldersIcon}>👥</div>
            <h3>No Elders Available</h3>
            <p>No elders are currently assigned to your family.</p>
            <p className={styles.subText}>
              Contact your care coordinator if you think this is an error.
            </p>
          </div>
        ) : (
          <div className={styles.eldersGrid}>
            {elders.map((elder) => (
              <div
                key={elder.user_id}
                className={styles.elderCard}
                onClick={() => handleElderSelect(elder)}
              >
                <div className={styles.elderCardHeader}>
                  <div className={styles.elderAvatar}>
                    {elder.name.charAt(0).toUpperCase()}
                  </div>
                  <div className={styles.elderInfo}>
                    <h3>{elder.name}</h3>
                    <p className={styles.elderDetails}>
                      {elder.gender} • Age {elder.age || 'N/A'}
                    </p>
                  </div>
                  {unreadCounts[elder.user_id] > 0 && (
                    <div className={styles.unreadBadge}>
                      {unreadCounts[elder.user_id]}
                    </div>
                  )}
                </div>
                
                <div className={styles.elderCardBody}>
                  {elder.medical_conditions && (
                    <p className={styles.medicalConditions}>
                      <span className={styles.conditionsLabel}>Conditions:</span>
                      {elder.medical_conditions}
                    </p>
                  )}
                  
                  {elder.last_message && (
                    <div className={styles.lastMessage}>
                      <p className={styles.messageText}>
                        {elder.last_message.length > 50 
                          ? `${elder.last_message.substring(0, 50)}...`
                          : elder.last_message
                        }
                      </p>
                      <span className={styles.messageTime}>
                        {formatLastMessageTime(elder.last_message_time)}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className={styles.elderCardFooter}>
                  <button className={styles.chatButton}>
                    💬 Start Conversation
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
      </div>
      </FamilyMemberLayout>
    </div>
  );
};

export default ElderMessages;
