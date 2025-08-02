const db = require('../db');

const messagesController = {
  // Send a new message
  sendMessage: async (req, res) => {
    try {
      const { sender_id, receiver_id, sender_type, receiver_type, message_text } = req.body;

      if (!sender_id || !receiver_id || !sender_type || !receiver_type || !message_text) {
        return res.status(400).json({
          success: false,
          message: 'All fields are required'
        });
      }

      const query = `
        INSERT INTO messages (sender_id, receiver_id, sender_type, receiver_type, message_text)
        VALUES ($1, $2, $3, $4, $5) RETURNING message_id
      `;

      const result = await db.query(query, [
        sender_id, receiver_id, sender_type, receiver_type, message_text
      ]);

      res.json({
        success: true,
        message: 'Message sent successfully',
        message_id: result.rows[0].message_id
      });

    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send message'
      });
    }
  },

  // Get conversation between two users
  getConversation: async (req, res) => {
    try {
      const { userId1, userId2 } = req.params;

      const query = `
        SELECT 
          m.*,
          sender.name as sender_name,
          receiver.name as receiver_name
        FROM messages m
        JOIN "User" sender ON m.sender_id = sender.user_id
        JOIN "User" receiver ON m.receiver_id = receiver.user_id
        WHERE 
          (m.sender_id = $1 AND m.receiver_id = $2) OR 
          (m.sender_id = $2 AND m.receiver_id = $1)
        ORDER BY m.sent_at ASC
      `;

      const result = await db.query(query, [userId1, userId2]);

      res.json({
        success: true,
        messages: result.rows
      });

    } catch (error) {
      console.error('Error fetching conversation:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch conversation'
      });
    }
  },

  // Mark messages as read
  markAsRead: async (req, res) => {
    try {
      const { sender_id, receiver_id } = req.body;

      const query = `
        UPDATE messages 
        SET is_read = TRUE, read_at = CURRENT_TIMESTAMP
        WHERE sender_id = $1 AND receiver_id = $2 AND is_read = FALSE
      `;

      await db.query(query, [sender_id, receiver_id]);

      res.json({
        success: true,
        message: 'Messages marked as read'
      });

    } catch (error) {
      console.error('Error marking messages as read:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark messages as read'
      });
    }
  },

  // Get unread message count
  getUnreadCount: async (req, res) => {
    try {
      const { userId } = req.params;

      const query = `
        SELECT COUNT(*) as unread_count
        FROM messages
        WHERE receiver_id = $1 AND is_read = FALSE
      `;

      const result = await db.query(query, [userId]);

      res.json({
        success: true,
        unread_count: result.rows[0].unread_count
      });

    } catch (error) {
      console.error('Error fetching unread count:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch unread count'
      });
    }
  }
};

module.exports = messagesController;
