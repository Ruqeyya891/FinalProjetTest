const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/auth");
const {
  sendMessage,
  getMessages,
  adminJoinChat,
  markMessagesAsRead,
  getUnreadChats,
  getChatList,
  adminReply,
} = require("../controllers/messageController");

router.post("/", protect, sendMessage);
router.post("/admin-join", protect, adminJoinChat);
router.put("/read", protect, adminOnly, markMessagesAsRead);
router.get("/unread/chats", protect, adminOnly, getUnreadChats);
router.get("/chat-list", protect, adminOnly, getChatList);
router.get("/:chatId", protect, getMessages);
router.post("/admin-reply", protect, adminOnly, adminReply);

module.exports = router;
