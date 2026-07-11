const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/auth");
const {
  sendMessage,
  getMessages,
  adminJoinChat,
  markMessagesAsRead,
  getChatList,
  adminReply,
  hideChat,
  getChat,
  getMyChat,
  getUserUnreadCount,
  markUserMessagesAsRead
} = require("../controllers/messageController");

router.post("/", protect, sendMessage);
router.get("/my-chat", protect, getMyChat);
router.post("/admin-join", protect, adminJoinChat);
router.put("/read", protect, markMessagesAsRead); // Remove adminOnly to allow users to use this too
router.get("/chat-list", protect, adminOnly, getChatList);
router.get("/:chatId", protect, getMessages);
router.get("/chat/:chatId", protect, adminOnly, getChat);
router.post("/admin-reply", protect, adminOnly, adminReply);
router.post("/hide", protect, adminOnly, hideChat);

// New user-specific routes
router.get("/unread/count", protect, getUserUnreadCount);
router.put("/user/read", protect, markUserMessagesAsRead);

module.exports = router;
