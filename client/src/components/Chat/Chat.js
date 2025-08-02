import React, { useState, useEffect, useRef } from 'react';
import { messagesApi } from '../../services/messagesApi';
import styles from './Chat.module.css';

const Chat = ({ currentUser, selectedDoctor, onClose }) => {
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
  const fetchMessages = async () => {
    if (!currentUser?.user_id || !selectedDoctor?.doctor_id) return;

    try {
      setLoading(true);
      const response = await messagesApi.getConversation(
        currentUser.user_id,
        selectedDoctor.doctor_id
      );

      if (response.success) {
        setMessages(response.messages);
        // Mark messages as read
        await messagesApi.markAsRead(selectedDoctor.doctor_id, currentUser.user_id);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  // Send a new message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      const response = await messagesApi.sendMessage(
        currentUser.user_id,
        selectedDoctor.doctor_id,
        'family_member',
        'doctor',
        newMessage.trim()
      );

      if (response.success) {
        setNewMessage('');
        // Refresh messages to show the new one
        await fetchMessages();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format date
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Group messages by date
  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach(message => {
      const date = new Date(message.sent_at).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    return groups;
  };

  // Initial load and polling for new messages
  useEffect(() => {
    fetchMessages();
    
    // Poll for new messages every 3 seconds
    const interval = setInterval(fetchMessages, 3000);
    
    return () => clearInterval(interval);
  }, [currentUser, selectedDoctor]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (loading && messages.length === 0) {
    return (
      <div className={styles.chatContainer}>
        <div className={styles.chatHeader}>
          <h3>💬 Chat with Dr. {selectedDoctor.doctor_name}</h3>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading messages...</p>
        </div>
      </div>
    );
  }

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatHeader}>
        <div className={styles.doctorInfo}>
          <h3>💬 Dr. {selectedDoctor.doctor_name}</h3>
          <span className={styles.specialization}>{selectedDoctor.specialization}</span>
        </div>
        <button className={styles.closeButton} onClick={onClose}>×</button>
      </div>

      <div className={styles.messagesContainer}>
        {Object.keys(groupedMessages).length === 0 ? (
          <div className={styles.noMessages}>
            <div className={styles.noMessagesIcon}>💬</div>
            <h4>Start Your Conversation</h4>
            <p>Send a message to Dr. {selectedDoctor.doctor_name}</p>
          </div>
        ) : (
          Object.entries(groupedMessages).map(([date, dayMessages]) => (
            <div key={date}>
              <div className={styles.dateHeader}>
                <span>{formatDate(dayMessages[0].sent_at)}</span>
              </div>
              {dayMessages.map((message) => (
                <div
                  key={message.message_id}
                  className={`${styles.messageItem} ${
                    message.sender_id === currentUser.user_id
                      ? styles.sentMessage
                      : styles.receivedMessage
                  }`}
                >
                  <div className={styles.messageContent}>
                    <p>{message.message_text}</p>
                    <span className={styles.messageTime}>
                      {formatTime(message.sent_at)}
                      {message.sender_id === currentUser.user_id && (
                        <span className={styles.readStatus}>
                          {message.is_read ? '✓✓' : '✓'}
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className={styles.messageForm} onSubmit={sendMessage}>
        <div className={styles.inputContainer}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={`Message Dr. ${selectedDoctor.doctor_name}...`}
            className={styles.messageInput}
            disabled={sending}
            maxLength={1000}
          />
          <button
            type="submit"
            className={styles.sendButton}
            disabled={!newMessage.trim() || sending}
          >
            {sending ? '⏳' : '➤'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;
