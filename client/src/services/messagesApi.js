import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/messages';

export const messagesApi = {
  // Send a new message
  sendMessage: async (senderId, receiverId, senderType, receiverType, messageText) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/send`, {
        sender_id: senderId,
        receiver_id: receiverId,
        sender_type: senderType,
        receiver_type: receiverType,
        message_text: messageText
      });
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Get conversation between two users
  getConversation: async (userId1, userId2) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/conversation/${userId1}/${userId2}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching conversation:', error);
      throw error;
    }
  },

  // Mark messages as read
  markAsRead: async (senderId, receiverId) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/mark-read`, {
        sender_id: senderId,
        receiver_id: receiverId
      });
      return response.data;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  },

  // Get unread message count
  getUnreadCount: async (userId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/unread-count/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw error;
    }
  }
};
