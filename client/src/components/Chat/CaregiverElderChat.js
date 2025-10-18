import React, { useState, useEffect, useRef } from 'react';
import { caregiverElderMessageApi } from '../../services/caregiverElderMessageApi';
import styles from '../css/caregiverElder/CaregiverElderChat.module.css';

const CaregiverElderChat = ({ 
  caregiverId, 
  elderUserId, 
  currentUserRole, 
  currentUserId,
  onBack 
}) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assignmentDetails, setAssignmentDetails] = useState(null);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchMessages();
    fetchAssignmentDetails();
    
    // Set up polling for new messages
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [caregiverId, elderUserId]);

  const fetchMessages = async () => {
    try {
      const response = await caregiverElderMessageApi.getMessages(caregiverId, elderUserId);
      if (response.success) {
        setMessages(response.messages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignmentDetails = async () => {
    try {
      const response = await caregiverElderMessageApi.getCareAssignmentDetails(caregiverId, elderUserId);
      if (response.success) {
        setAssignmentDetails(response.assignments[0] || null);
      }
    } catch (error) {
      console.error('Error fetching assignment details:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const messageData = {
        message: newMessage.trim(),
        senderType: currentUserRole // 'caregiver' or 'elder'
      };

      const response = await caregiverElderMessageApi.sendMessage(caregiverId, elderUserId, messageData);
      
      if (response.success) {
        setNewMessage('');
        fetchMessages(); // Refresh messages
      } else {
        setError('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleString([], { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  const isCurrentUserMessage = (message) => {
    if (currentUserRole === 'caregiver') {
      return message.sender_type === 'caregiver';
    } else {
      return message.sender_type === 'elder';
    }
  };

  if (loading) {
    return (
      <div className={styles.chatContainer}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatHeader}>
        <button onClick={onBack} className={styles.backButton}>
          ← Back
        </button>
        <div className={styles.chatHeaderInfo}>
          <h3>
            {currentUserRole === 'caregiver' 
              ? `Chat with ${assignmentDetails?.elder_name_user || 'Elder'}`
              : `Chat with ${assignmentDetails?.caregiver_name || 'Caregiver'}`
            }
          </h3>
          {assignmentDetails && (
            <p className={styles.assignmentInfo}>
              Care Assignment: {assignmentDetails.assignment_status} 
              {assignmentDetails.start_date && (
                <span> • Started {new Date(assignmentDetails.start_date).toLocaleDateString()}</span>
              )}
            </p>
          )}
        </div>
      </div>

      <div className={styles.messagesContainer}>
        {messages.length === 0 ? (
          <div className={styles.noMessages}>
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={message.message_id || index}
              className={`${styles.messageWrapper} ${
                isCurrentUserMessage(message) ? styles.sent : styles.received
              }`}
            >
              <div className={styles.message}>
                <div className={styles.messageContent}>
                  {message.message}
                </div>
                <div className={styles.messageInfo}>
                  <span className={styles.senderName}>
                    {isCurrentUserMessage(message) ? 'You' : 
                      (message.sender_type === 'caregiver' ? message.caregiver_name : message.elder_name)}
                  </span>
                  <span className={styles.timestamp}>
                    {formatTimestamp(message.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className={styles.messageForm}>
        <div className={styles.messageInputContainer}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className={styles.messageInput}
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className={styles.sendButton}
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>

      {error && (
        <div className={styles.errorMessage}>
          {error}
          <button onClick={() => setError(null)} className={styles.closeError}>×</button>
        </div>
      )}
    </div>
  );
};

export default CaregiverElderChat;