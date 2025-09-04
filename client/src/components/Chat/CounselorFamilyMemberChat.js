import React, { useState, useEffect, useRef } from 'react';
import { messagesApi } from '../../services/messagesApi';
import styles from './CounselorFamilyMemberChat.module.css';

const CounselorFamilyMemberChat = ({ currentUser, selectedFamilyMember, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async (silent = false) => {
    if (!currentUser?.user_id || !selectedFamilyMember?.user_id) return;
    
    try {
      if (!silent) setLoading(true);
      
      console.log('Fetching messages between counselor and family member:', {
        counselor_user_id: currentUser.user_id,
        family_member_user_id: selectedFamilyMember.user_id
      });
      
      const response = await messagesApi.getConversation(
        currentUser.user_id,
        selectedFamilyMember.user_id
      );

      if (response.success) {
        // Always update messages silently - no comparison needed
        setMessages(response.messages);
        
        // Mark messages as read only if there are new unread messages
        const hasUnreadMessages = response.messages.some(
          msg => msg.receiver_id === currentUser.user_id && !msg.is_read
        );
        
        if (hasUnreadMessages) {
          await messagesApi.markAsRead(currentUser.user_id, selectedFamilyMember.user_id);
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(() => fetchMessages(true), 3000);
    return () => clearInterval(interval);
  }, [currentUser, selectedFamilyMember]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || !selectedFamilyMember) return;

    try {
      console.log('Sending message from counselor to family member:', {
        counselor_user_id: currentUser.user_id,
        family_member_user_id: selectedFamilyMember.user_id,
        message: newMessage.trim()
      });
      
      const response = await messagesApi.sendMessage(
        currentUser.user_id,
        selectedFamilyMember.user_id,
        'counselor',
        'family_member',
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
    }
  };

  const formatMessageTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const groupMessagesByDate = () => {
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
          <div className={styles.chatHeaderInfo}>
            <h3>Loading...</h3>
          </div>
          <button onClick={onClose} className={styles.closeButton}>✕</button>
        </div>
        <div className={styles.loadingContainer}>
          <div className={styles.loading}>Loading messages...</div>
        </div>
      </div>
    );
  }

  const groupedMessages = groupMessagesByDate();

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatHeader}>
        <div className={styles.chatHeaderInfo}>
          <h3>Chat with {selectedFamilyMember.family_member_name}</h3>
          <p className={styles.familyMemberInfo}>
            Fixed Phone: {selectedFamilyMember.phone_fixed || 'Not provided'} | 
            Email: {selectedFamilyMember.family_member_email}
          </p>
        </div>
        <button onClick={onClose} className={styles.closeButton}>✕</button>
      </div>

      <div className={styles.messagesContainer}>
        {groupedMessages.length === 0 ? (
          <div className={styles.noMessages}>
            <p>No messages yet. Start a conversation with {selectedFamilyMember.family_member_name}!</p>
          </div>
        ) : (
          groupedMessages.map((item, index) => {
            if (item.type === 'date') {
              return (
                <div key={`date-${index}`} className={styles.dateHeader}>
                  <span className={styles.dateText}>{item.displayDate}</span>
                </div>
              );
            }

            const isFromCounselor = item.sender_id === currentUser.user_id;
            
            return (
              <div
                key={item.message_id}
                className={`${styles.messageItem} ${
                  isFromCounselor ? styles.sentMessage : styles.receivedMessage
                }`}
              >
                <div className={styles.messageContent}>
                  <div className={styles.messageText}>{item.message_text}</div>
                  <div className={styles.messageTime}>
                    {formatMessageTime(item.sent_at)}
                    {isFromCounselor && (
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

      <form onSubmit={sendMessage} className={styles.messageForm}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={`Type a message to ${selectedFamilyMember.family_member_name}...`}
          className={styles.messageInput}
          maxLength={1000}
        />
        <button type="submit" className={styles.sendButton} disabled={!newMessage.trim()}>
          Send
        </button>
      </form>
    </div>
  );
};

export default CounselorFamilyMemberChat;
