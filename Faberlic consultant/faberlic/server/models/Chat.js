const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    messages: [{
        sender: { type: String, enum: ['user', 'ai', 'admin'] },
        text: { type: String },
        image: { type: String }, // For skin analysis
        timestamp: { type: Date, default: Date.now }
    }],
    isActive: { type: Boolean, default: true },
    adminIntervened: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Chat', ChatSchema);
