const express = require('express');
const router = express.Router();
const { handleChatMessage, adminJoinChat, adminSendMessage, getActiveChats } = require('../controllers/chatController');
const upload = require('../middleware/upload');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/message', upload.single('image'), handleChatMessage);
router.post('/admin/join', protect, adminOnly, adminJoinChat);
router.post('/admin/message', protect, adminOnly, adminSendMessage);
router.get('/active-chats', protect, adminOnly, getActiveChats);

module.exports = router;
