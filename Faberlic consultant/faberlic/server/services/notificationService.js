const twilio = require('twilio');
require('dotenv').config();

// Function to format phone number to E.164 (required by WhatsApp/Twilio)
const formatPhoneNumber = (phone) => {
    // Remove all non-digit characters
    let digits = phone.replace(/\D/g, '');
    
    // If it starts with 0, assume local number (Azerbaijan)
    if (digits.startsWith('0')) {
        digits = '994' + digits.slice(1);
    }
    
    // If it doesn't start with country code, add Azerbaijan (+994)
    if (!digits.startsWith('994') && digits.length === 9) {
        digits = '994' + digits;
    }
    
    return '+' + digits;
};

// Function to send via WhatsApp (temporary solution)
const sendWhatsAppNotification = (phone, customerCode, accessKey) => {
    const formattedPhone = formatPhoneNumber(phone);
    const message = `Müştəri kodunuz: ${customerCode}\nGiriş açarınız: ${accessKey}`;
    const encodedMessage = encodeURIComponent(message);
    const waLink = `https://wa.me/${formattedPhone.slice(1)}?text=${encodedMessage}`; // Remove '+' for wa.me
    
    return waLink;
};

// Function to send via Twilio SMS (for future use)
const sendTwilioSMS = async (phone, customerCode, accessKey) => {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
        console.warn('Twilio not configured, skipping SMS');
        return null;
    }
    
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    const formattedPhone = formatPhoneNumber(phone);
    
    try {
        const message = await client.messages.create({
            body: `Müştəri kodunuz: ${customerCode}\nGiriş açarınız: ${accessKey}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: formattedPhone
        });
        console.log('Twilio SMS sent:', message.sid);
        return message;
    } catch (error) {
        console.error('Twilio error:', error);
        throw error;
    }
};

module.exports = {
    sendWhatsAppNotification,
    sendTwilioSMS,
    formatPhoneNumber
};