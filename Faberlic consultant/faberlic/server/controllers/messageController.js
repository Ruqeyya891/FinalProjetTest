const Message = require("../models/Message"); 
const Chat = require("../models/Chat");
const { generateAIResponse } = require("../services/geminiService"); 
const User = require("../models/User");

// Get user's chat
const getMyChat = async (req, res) => {
  try {
    const chat = await Chat.findOne({ user: req.user._id });
    if (!chat) {
      return res.status(404).json({ message: "Chat tapılmadı" });
    }
    res.status(200).json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const sendMessage = async (req, res) => { 
  try { 
    const { chatId, text } = req.body; 
    const userId = req.user._id;
    
    // Find or create chat with user data
    let chat = await Chat.findOne({ user: userId });
    if (!chat) {
      // Create new chat
      chat = await Chat.create({
        user: userId,
        userSnapshot: {
          fullName: req.user.fullName,
          phone: req.user.phone,
          email: req.user.email
        }
      });
    } else {
      // If chat was deleted by admin, restore it
      if (chat.isDeletedByAdmin) {
        chat.isDeletedByAdmin = false;
      }
      // Update last message date
      chat.lastMessageDate = new Date();
      // Update user snapshot (in case user info changed)
      chat.userSnapshot = {
        fullName: req.user.fullName,
        phone: req.user.phone,
        email: req.user.email
      };
      await chat.save();
    }

    const message = await Message.create({ 
      chatId: chat._id.toString(), // use chat._id as chatId
      user: userId, 
      senderType: "user", 
      sender: userId, 
      text 
    }); 

    // Update chat last message date
    chat.lastMessageDate = new Date();
    await chat.save();

    res.status(201).json({ 
      userMessage: message, 
      chatId: chat._id.toString()
    }); 

  } catch (error) { 
    console.error('Send message error:', error);
    res.status(500).json({ 
      message: error.message 
    }); 
  } 
}; 
  
const getMessages = async (req, res) => { 
  try { 
    let messages; 

    if (req.user.role === "admin") {   
      messages = await Message.find({ 
        chatId: req.params.chatId 
      }).sort({ createdAt: 1 }); 

    } else { 
      messages = await Message.find({ 
        chatId: req.params.chatId, 
        user: req.user._id 
      }).sort({ createdAt: 1 }); 
    } 

    res.status(200).json(messages); 

  } catch (error) { 
    res.status(500).json({ 
      message: error.message 
    }); 
  } 
}; 


const adminJoinChat = async (req, res) => { 
  try { 
    const { chatId } = req.body; 

    const existingMessage = await Message.findOne({ 
      chatId, 
      senderType: "system", 
      text: "Admin söhbətə qoşuldu" 
    }); 

    if (existingMessage) { 
      return res.status(200).json(existingMessage); 
    } 

    const message = await Message.create({ 
      chatId, 
      senderType: "system", 
      sender: req.user._id, 
      text: "Admin söhbətə qoşuldu" 
    }); 

    // Mark chat as admin intervened
    await Chat.findOneAndUpdate({ _id: chatId }, { adminIntervened: true });

    res.status(201).json(message); 
  } catch (error) { 
    res.status(500).json({ 
      message: error.message 
    }); 
  } 
};



const getChatList = async (req, res) => { 
  try { 
    // Get all chats not deleted by admin, sorted by last message date
    const chats = await Chat.find({ isDeletedByAdmin: false }).sort({ lastMessageDate: -1 });

    // For each chat, get last message and unread count
    const chatList = await Promise.all(chats.map(async (chat) => {
      const lastMessage = await Message.findOne({ chatId: chat._id.toString() }).sort({ createdAt: -1 });
      const unreadCount = await Message.countDocuments({ 
        chatId: chat._id.toString(), 
        senderType: "user", 
        isRead: false 
      });

      return {
        _id: chat._id.toString(),
        user: chat.user,
        userSnapshot: chat.userSnapshot,
        lastMessage: lastMessage ? lastMessage.text : '',
        lastMessageDate: chat.lastMessageDate,
        unreadCount: unreadCount,
        adminIntervened: chat.adminIntervened
      };
    }));

    res.status(200).json(chatList); 
  } catch (error) { 
    console.error('Get chat list error:', error);
    res.status(500).json({ 
      message: error.message 
    }); 
  } 
};


const adminReply = async (req, res) =>{ 
    try { 
      const { chatId, text } = req.body; 
      const existing = await Message.findOne({ chatId }); 
      if (!existing) { 
        return res.status(404).json({ 
          message: "Chat tapılmadı" 
        }); 
      } 

      const message = await Message.create({ 
        chatId, 
        user: existing.user, 
        senderType:"admin", 
        sender: req.user._id, 
        text, 
        isRead:false // Changed from true to false, since user hasn't read it yet
      }); 
      
      // Update chat last message date
      await Chat.findOneAndUpdate({ _id: chatId }, { lastMessageDate: new Date() });
      
      res.status(201).json(message); 
    } catch (error) { 
      res.status(500).json({ 
        message:error.message 
      }); 
    } 
  };
  
// New function: get unread count for user
const getUserUnreadCount = async (req, res) => {
    try {
        const userId = req.user._id;
        const chat = await Chat.findOne({ user: userId });
        if (!chat) {
            return res.status(200).json({ count: 0 });
        }
        
        const unreadCount = await Message.countDocuments({
            chatId: chat._id.toString(),
            senderType: "admin",
            isRead: false
        });
        
        res.status(200).json({ count: unreadCount });
    } catch (error) {
        console.error('Get user unread count error:', error);
        res.status(500).json({ message: error.message });
    }
};

// New function: mark user's messages as read
const markUserMessagesAsRead = async (req, res) => {
    try {
        const userId = req.user._id;
        const chat = await Chat.findOne({ user: userId });
        if (!chat) {
            return res.status(200).json({ message: "Chat tapılmadı" });
        }
        
        await Message.updateMany(
            {
                chatId: chat._id.toString(),
                senderType: "admin",
                isRead: false
            },
            {
                isRead: true
            }
        );
        
        res.status(200).json({ message: "Mesajlar oxundu" });
    } catch (error) {
        console.error('Mark user messages read error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Update markMessagesAsRead to handle both roles
const markMessagesAsRead = async (req, res) =>{ 
    try { 
      const { chatId } = req.body; 
      
      if (req.user.role === "admin") {
          // Admin: mark user's messages as read
          await Message.updateMany( 
            { 
              chatId, 
              senderType:"user", 
              isRead:false 
            }, 
            { 
              isRead:true 
            } 
          ); 
      } else {
          // User: mark admin's messages as read
          await Message.updateMany( 
            { 
              chatId, 
              senderType:"admin", 
              isRead:false 
            }, 
            { 
              isRead:true 
            } 
          ); 
      }
      
      res.status(200).json({ 
        message:"Mesajlar oxundu" 
      }); 
    } catch (error) { 
      res.status(500).json({ 
        message:error.message 
      }); 
    } 
};


// New function: hide chat from admin
const hideChat = async (req, res) => {
  try {
    const { chatId } = req.body;
    await Chat.findOneAndUpdate({ _id: chatId }, { isDeletedByAdmin: true });
    res.status(200).json({ message: "Söhbət gizləndildi" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// New function: get single chat
const getChat = async (req, res) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.chatId });
    res.status(200).json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
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
};
