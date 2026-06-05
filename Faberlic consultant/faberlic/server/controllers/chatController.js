const mongoose = require('mongoose');
const Chat = require('../models/Chat');
const Product = require('../models/Product');
const User = require('../models/User');
const { generateAIResponse } = require('../services/geminiService');

const handleChatMessage = async (req, res) => {
    try {
        const { userId, message, image } = req.body;

        // 1. Get user context (Handle optional/anonymous user)
        let user = null;
        if (userId && mongoose.Types.ObjectId.isValid(userId)) {
            user = await User.findById(userId);
        }
        
        // 2. Call Gemini AI
        const aiText = await generateAIResponse(message || "Dəri analizi edin.");

        // 3. Find recommended products in DB based on AI text
        const recommendedProducts = await Product.find({
            $or: [
                { category: { $regex: aiText.substring(0, 50), $options: 'i' } },
                { description: { $regex: aiText.substring(0, 50), $options: 'i' } }
            ]
        }).limit(3);

        // 4. Save chat history (Only if valid user ID or for anonymous session tracking)
        let chat = null;
        if (userId && mongoose.Types.ObjectId.isValid(userId)) {
            chat = await Chat.findOneAndUpdate(
                { user: userId, isActive: true },
                { 
                    $push: { 
                        messages: [
                            { sender: 'user', text: message, image: image },
                            { sender: 'ai', text: aiText }
                        ] 
                    } 
                },
                { upsert: true, new: true }
            );
        }

        res.status(200).json({
            success: true,
            reply: aiText,
            recommendations: recommendedProducts,
            chatId: chat ? chat._id : null
        });

    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ success: false, error: 'AI ilə əlaqə qurarkən xəta baş verdi.' });
    }
};

const adminJoinChat = async (req, res) => {
    try {
        const { chatId } = req.body;
        const chat = await Chat.findByIdAndUpdate(chatId, {
            adminIntervened: true,
            $push: {
                messages: {
                    sender: 'admin',
                    text: 'Admin söhbətə qoşuldu.',
                    timestamp: new Date()
                }
            }
        }, { new: true });

        res.status(200).json({ success: true, chat });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const adminSendMessage = async (req, res) => {
    try {
        const { chatId, message } = req.body;
        const chat = await Chat.findByIdAndUpdate(chatId, {
            $push: {
                messages: {
                    sender: 'admin',
                    text: message,
                    timestamp: new Date()
                }
            }
        }, { new: true });

        res.status(200).json({ success: true, chat });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const getActiveChats = async (req, res) => {
    try {
        const chats = await Chat.find({ isActive: true }).populate('user', 'name surname username email');
        res.status(200).json({ success: true, chats });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = { handleChatMessage, adminJoinChat, adminSendMessage, getActiveChats };
