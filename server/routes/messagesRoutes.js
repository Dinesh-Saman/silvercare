const express = require('express');
const router = express.Router();
const messagesController = require('../controllers/messagesController');

// Send a new message
router.post('/send', messagesController.sendMessage);

// Get conversation between two users
router.get('/conversation/:userId1/:userId2', messagesController.getConversation);

// Mark messages as read
router.put('/mark-read', messagesController.markAsRead);

// Get unread message count
router.get('/unread-count/:userId', messagesController.getUnreadCount);

module.exports = router;
