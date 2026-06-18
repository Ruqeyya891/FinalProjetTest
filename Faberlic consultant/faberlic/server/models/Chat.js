const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    userSnapshot: {
        fullName: { type: String, required: true },
        phone: { type: String, required: true },
        email: { type: String, required: true }
    },
    isDeletedByAdmin: { type: Boolean, default: false },
    adminIntervened: { type: Boolean, default: false },
    lastMessageDate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Chat', ChatSchema);
