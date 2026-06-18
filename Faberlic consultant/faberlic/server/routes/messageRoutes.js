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
  getMyChat
} = require("../controllers/messageController");

router.post("/", protect, sendMessage);
router.get("/my-chat", protect, getMyChat);
router.post("/admin-join", protect, adminJoinChat);
router.put("/read", protect, adminOnly, markMessagesAsRead);
router.get("/chat-list", protect, adminOnly, getChatList);
router.get("/:chatId", protect, getMessages);
router.get("/chat/:chatId", protect, adminOnly, getChat);
router.post("/admin-reply", protect, adminOnly, adminReply);
router.post("/hide", protect, adminOnly, hideChat);

module.exports = router;
