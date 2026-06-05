const Message = require("../models/Message"); 
const { generateAIResponse } = require("../services/geminiService"); 
const User = require("../models/User");

const sendMessage = async (req, res) => { 
    try { 
      const { chatId, text } = req.body; 

      const message = await Message.create({ 
        chatId, 
        user: req.user._id, 
        senderType: "user", 
        sender: req.user._id, 
        text 
      }); 
      const aiText = await generateAIResponse(text); 
      const aiMessage = await Message.create({ 
        chatId, 
        user: req.user._id, 
        senderType: "ai", 
        text: aiText, 
        isRead: true 
      }); 

      res.status(201).json({ 
        userMessage: message, 
        aiMessage 
      }); 

    } catch (error) { 
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

    res.status(201).json(message); 
  } catch (error) { 
    res.status(500).json({ 
      message: error.message 
    }); 
  } 
}; 


const markMessagesAsRead = async (req, res) =>{ 
    try { 
      const { chatId } = req.body; 
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
      res.status(200).json({ 
        message:"Mesajlar oxundu" 
      }); 
    } catch (error) { 
      res.status(500).json({ 
        message:error.message 
      }); 
    } 
}; 


const getUnreadChats = async (req, res) =>{ 
try { 
    const unreadChats = await Message.aggregate([ 
      { 
        $match:{ 
          senderType:"user", 
          isRead:false 
        } 
      }, 
      { 
        $group:{ 
          _id:"$chatId", 
          unreadCount:{$sum:1}    
        } 
      } 
    ]); 
    res.status(200).json(unreadChats); 
} catch(error) { 
    res.status(500).json({ 
      message:error.message 
    }); 
} 
}; 


const getChatList = async (req, res) => { 
  try { 
    const chats = await Message.aggregate([ 
      { 
        $sort: { createdAt: -1 } 
      }, 
      { 
        $group: { 
          _id: "$chatId", 

          lastMessage: { 
            $first: "$text" 
          }, 

          lastSenderType: { 
            $first: "$senderType" 
          }, 

          lastMessageDate: { 
            $first: "$createdAt" 
          }, 

          user: { 
            $first: "$user" 
          }, 

          unreadCount: { 
            $sum: { 
              $cond: [ 
                { 
                  $and: [ 
                    { $eq: ["$senderType", "user"] }, 
                    { $ne: ["$isRead", true] } 
                  ] 
                }, 
                1, 
                0 
              ] 
            } 
          } 
        } 
      }, 
      { 
        $sort: { 
          lastMessageDate: -1 
        } 
      } 
    ]); 

    // Populate user info 
    const populatedChats = await Promise.all(chats.map(async (chat) => {
      if (chat.user) {
        chat.user = await User.findById(chat.user).select('name surname username email');
      }
      return chat;
    }));

    res.status(200).json(populatedChats); 
  } catch (error) { 
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
        isRead:true 
      }); 
      res.status(201).json(message); 
    } catch (error) { 
      res.status(500).json({ 
        message:error.message 
      }); 
    } 
  }; 
  


module.exports = { 
  sendMessage, 
  getMessages, 
  adminJoinChat, 
  markMessagesAsRead, 
  getUnreadChats, 
  getChatList, 
  adminReply 
};