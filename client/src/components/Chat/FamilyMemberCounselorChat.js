import React, { useState, useEffect, useRef } from 'react';
import { messagesApi } from '../../services/messagesApi';
import styles from './FamilyMemberCounselorChat.module.css';

const FamilyMemberCounselorChat = ({ currentUser, selectedCounselor, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch conversation messages
  const fetchMessages = async (isBackgroundRefresh = false) => {
    if (!currentUser?.user_id || !selectedCounselor?.user_id) {
      console.log('Missing user IDs:', {
        family_user_id: currentUser?.user_id,
        counselor_user_id: selectedCounselor?.user_id,
        selectedCounselorObject: selectedCounselor
      });
      return;
    }

    try {
      // Only show loading spinner on initial load, not on background refreshes
      if (!isBackgroundRefresh) {
        setLoading(true);
      }
      
      console.log('Fetching messages between:', {
        family: currentUser.user_id,
        counselor: selectedCounselor.user_id
      });
      
      const response = await messagesApi.getConversation(
        currentUser.user_id,
        selectedCounselor.user_id
      );

      if (response.success) {
        // Always update messages silently - no comparison needed
        setMessages(response.messages);
        
        // Mark messages as read only if there are new unread messages
        const hasUnreadMessages = response.messages.some(
          msg => msg.receiver_id === currentUser.user_id && !msg.is_read
        );

        if (hasUnreadMessages) {
          // Mark messages as read
          await messagesApi.markAsRead(currentUser.user_id, selectedCounselor.user_id);
        }
        
        // Scroll to bottom if not a background refresh
        if (!isBackgroundRefresh) {
          setTimeout(scrollToBottom, 100);
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      if (!isBackgroundRefresh) {
        setLoading(false);
      }
    }
  };

  // Send a new message
  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      
      console.log('Sending message from family to counselor:', {
        family_user_id: currentUser.user_id,
        counselor_user_id: selectedCounselor.user_id,
        message: newMessage.trim()
      });
      
      const response = await messagesApi.sendMessage(
        currentUser.user_id,
        selectedCounselor.user_id,
        'family_member',
        'counselor',
        newMessage.trim()
      );

      if (response.success) {
        setNewMessage('');
        // Refresh messages to show the new message
        await fetchMessages(true);
        scrollToBottom();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  // Initial load and periodic refresh
  useEffect(() => {
    if (currentUser?.user_id && selectedCounselor?.user_id) {
      fetchMessages();
      
      // Set up periodic refresh every 3 seconds
      const interval = setInterval(() => {
        fetchMessages(true);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [currentUser?.user_id, selectedCounselor?.user_id]);

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Format date for display
  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  // Group messages by date
  const groupMessagesByDate = (messages) => {
    const groups = [];
    let currentDate = null;
    
    messages.forEach(message => {
      const messageDate = new Date(message.sent_at).toDateString();
      
      if (messageDate !== currentDate) {
        groups.push({
          type: 'date',
          date: messageDate,
          displayDate: new Date(message.sent_at).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        });
        currentDate = messageDate;
      }
      
      groups.push({
        type: 'message',
        ...message
      });
    });
    
    return groups;
  };

  if (loading) {
    return (
      <div className={styles.chatContainer}>
        <div className={styles.chatHeader}>
          <div className={styles.counselorInfo}>
            <div className={styles.counselorDetails}>
              <h3 className={styles.counselorName}>{selectedCounselor.counselor_name}</h3>
              <div className={styles.counselorMeta}>
                <span className={styles.specialization}>{selectedCounselor.specialization}</span>
                <span className={styles.experience}>{selectedCounselor.years_of_experience} years</span>
                <span className={styles.district}>{selectedCounselor.counselor_district}</span>
              </div>
            </div>
          </div>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading conversation...</p>
        </div>
      </div>
    );
  }

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatHeader}>
        <div className={styles.counselorInfo}>
          <div className={styles.counselorDetails}>
            <h3 className={styles.counselorName}>{selectedCounselor.counselor_name}</h3>
            <div className={styles.counselorMeta}>
              <span className={styles.specialization}>{selectedCounselor.specialization}</span>
              <span className={styles.experience}>{selectedCounselor.years_of_experience} years</span>
              <span className={styles.district}>{selectedCounselor.counselor_district}</span>
            </div>
            <div className={styles.counselorContact}>
              <span className={styles.institution}>{selectedCounselor.current_institution}</span>
            </div>
          </div>
        </div>
        <button className={styles.closeButton} onClick={onClose}>×</button>
      </div>

      <div className={styles.messagesContainer}>
        <div className={styles.messagesList}>
          {groupedMessages.length === 0 ? (
            <div className={styles.noMessages}>
              <div className={styles.noMessagesIcon}>💬</div>
              <h4>No messages yet</h4>
              <p>Start the conversation with {selectedCounselor.counselor_name}</p>
            </div>
          ) : (
            groupedMessages.map((item, index) => {
              if (item.type === 'date') {
                return (
                  <div key={`date-${index}`} className={styles.dateHeader}>
                    {item.displayDate}
                  </div>
                );
              }

              const isFromFamily = item.sender_id === currentUser.user_id;
              
              return (
                <div
                  key={item.message_id}
                  className={`${styles.messageItem} ${
                    isFromFamily ? styles.sentMessage : styles.receivedMessage
                  }`}
                >
                  <div className={styles.messageContent}>
                    <div className={styles.messageText}>{item.message_text}</div>
                    <div className={styles.messageTime}>
                      {formatMessageTime(item.sent_at)}
                      {isFromFamily && (
                        <span className={styles.readStatus}>
                          {item.is_read ? '✓✓' : '✓'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <form onSubmit={sendMessage} className={styles.messageForm}>
        <div className={styles.messageInputContainer}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={`Message ${selectedCounselor.counselor_name}...`}
            className={styles.messageInput}
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className={styles.sendButton}
          >
            {sending ? '⏳' : '➤'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FamilyMemberCounselorChat;
