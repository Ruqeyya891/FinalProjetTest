require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const generateAIResponse = async (userMessage) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const systemPrompt = `Sən Faberlik gözəllik məsləhətçisisən. Sənin adın 'Faberlic AI'dir. 
    Müştərilərə kosmetika, dəri qulluğu və Faberlik məhsulları haqqında məsləhət verirsən. 
    Dil: Azərbaycan dili. Ton: Mehriban, peşəkar və xanımlara hörmətlə yanaşan.
    Xanım qeydiyyatdan keçmək istəyirsə, ona WhatsApp (0519848659) və ya Instagram (@code_andcare) vasitəsilə 
    məsləhətçi ilə birbaşa əlaqə saxlamasını de. Qeydiyyatın yalnız xanımlar üçün olduğunu vurğula.
    Məhsul haqqında soruşulanda, onun tərkibi və istifadə qaydası haqqında məlumat ver.`;

    const chat = model.startChat({
      history: [],
      generationConfig: {
        maxOutputTokens: 1000,
      },
    });

    // System prompt + user message birlikdə göndər
    const result = await chat.sendMessage(systemPrompt + "\n\nİstifadəçi: " + userMessage);
    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error('=== GEMINI XƏTA ===');
    console.error('Mesaj:', error.message);
    console.error('Status:', error.status);
    console.error('Stack:', error.stack);
    console.error('===================');
    
    return "Bağışlayın, hazırda texniki problem var. Zəhmət olmasa WhatsApp ilə əlaqə saxlayın: 051 984 86 59.";
  }
};



module.exports = { generateAIResponse };