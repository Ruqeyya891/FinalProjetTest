const twilio = require('twilio');
require('dotenv').config();

// Function to send via Twilio SMS (for future use)
const sendTwilioSMS = async (phone, customerCode, accessKey) => {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
        console.warn('Twilio not configured, skipping SMS');
        return null;
    }
    
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    // Format phone number to E.164 (required by Twilio)
    let digits = phone.replace(/\D/g, '');
    if (digits.startsWith('0')) {
        digits = '994' + digits.slice(1);
    }
    if (!digits.startsWith('994') && digits.length === 9) {
        digits = '994' + digits;
    }
    const formattedPhone = '+' + digits;
    
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
    sendTwilioSMS
};