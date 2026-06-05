import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, Bot, User, Sparkles, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AIAdvisor = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    { _id: '1', senderType: 'ai', text: 'Salam! Mən sizin Faberlik AI məsləhətçinizəm. Sizə necə kömək edə bilərəm? Dəriniz haqqında məlumat verə bilərsiniz və ya problemin şəklini yükləyə bilərsiniz.', createdAt: new Date() }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatId, setChatId] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Generate or get chat ID
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const storedChatId = localStorage.getItem(`chatId_${decoded.id}`);
        if (storedChatId) {
          setChatId(storedChatId);
          // Load existing messages
          loadExistingMessages(storedChatId, token);
        } else {
          setChatId(`chat_${decoded.id}_${Date.now()}`);
        }
      } catch (error) {
        console.error('Token decode error:', error);
      }
    }
  }, []);

  const loadExistingMessages = async (existingChatId, token) => {
    try {
      const response = await axios.get(`http://127.0.0.1:5000/api/messages/${existingChatId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data && response.data.length > 0) {
        setMessages(response.data);
      }
    } catch (error) {
      console.error('Load messages error:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const token = localStorage.getItem('token');
    if (!token) {
      toast.info('AI məsləhətçi ilə söhbət etmək üçün daxil olmalısınız.');
      navigate('/login');
      return;
    }

    const currentChatId = chatId || `chat_${jwtDecode(token).id}_${Date.now()}`;
    if (!chatId) setChatId(currentChatId);
    localStorage.setItem(`chatId_${jwtDecode(token).id}`, currentChatId);

    const userMessage = { _id: Date.now().toString(), senderType: 'user', text: inputText, createdAt: new Date() };
    setMessages([...messages, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await axios.post('http://127.0.0.1:5000/api/messages', {
        chatId: currentChatId,
        text: inputText
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessages(prev => [...prev, response.data.aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMsg = { _id: Date.now().toString(), senderType: 'ai', text: 'Üzr istəyirik, AI ilə əlaqə qurarkən xəta baş verdi. Zəhmət olmasa bir az sonra yenidən cəhd edin.', createdAt: new Date() };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleImageUpload = async (e) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.info('Şəkil yükləmək üçün daxil olmalısınız.');
      navigate('/login');
      return;
    }
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const currentChatId = chatId || `chat_${jwtDecode(token).id}_${Date.now()}`;
        if (!chatId) setChatId(currentChatId);
        localStorage.setItem(`chatId_${jwtDecode(token).id}`, currentChatId);

        const userMessage = { 
          _id: Date.now().toString(), 
          senderType: 'user', 
          text: 'Şəkil yükləndi. Dəri analizi xahiş edirəm.', 
          createdAt: new Date() 
        };
        setMessages([...messages, userMessage]);
        setIsTyping(true);

        try {
          const response = await axios.post('http://127.0.0.1:5000/api/messages', {
            chatId: currentChatId,
            text: 'Şəkil yükləndi. Dəri analizi xahiş edirəm.'
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });

          setMessages(prev => [...prev, response.data.aiMessage]);
        } catch (error) {
          console.error('Chat error:', error);
        } finally {
          setIsTyping(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 h-[calc(100vh-140px)] flex flex-col">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col flex-grow border border-pink-100">
        {/* Chat Header */}
        <div className="bg-pink-600 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
              <Bot size={28} />
            </div>
            <div>
              <h2 className="text-xl font-bold">AI Gözəllik Məsləhətçisi</h2>
              <p className="text-pink-100 text-sm flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Onlayn
              </p>
            </div>
          </div>
          <div className="hidden md:flex flex-col items-end text-xs text-pink-100">
            <p>Dəri Analizi | Məhsul Tövsiyəsi</p>
            <p>İstifadə qaydaları | Tərkib analizi</p>
            <p className="mt-1 opacity-70 italic text-[10px]">Bu söhbətlər xidmət keyfiyyətinin artırılması üçün administrator tərəfindən nəzərdən keçirilə bilər.</p>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-grow overflow-y-auto p-6 space-y-6 bg-pink-50/30">
          {messages.map((msg, index) => (
            <div 
              key={msg._id || msg.id || `msg-${index}`} 
              className={`flex ${msg.senderType === 'user' || msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[80%] ${msg.senderType === 'user' || msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${
                  msg.senderType === 'user' || msg.sender === 'user' ? 'bg-pink-600 text-white' : 
                  msg.senderType === 'admin' || msg.sender === 'admin' ? 'bg-purple-600 text-white' : 
                  'bg-white border border-pink-200 text-pink-600'
                }`}>
                  {msg.senderType === 'user' || msg.sender === 'user' ? <User size={20} /> : 
                   msg.senderType === 'admin' || msg.sender === 'admin' ? <User size={20} /> : 
                   <Bot size={20} />}
                </div>
                <div className={`p-4 rounded-2xl shadow-sm ${
                  msg.senderType === 'user' || msg.sender === 'user' ? 'bg-pink-600 text-white rounded-tr-none' : 
                  msg.senderType === 'admin' || msg.sender === 'admin' ? 'bg-purple-600 text-white rounded-tl-none' : 
                  'bg-white text-gray-800 rounded-tl-none border border-pink-100'
                }`}>
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                  {(msg.createdAt || msg.timestamp) && (
                    <span className={`text-[10px] block mt-2 ${
                      msg.senderType === 'user' || msg.sender === 'user' || msg.senderType === 'admin' || msg.sender === 'admin' ? 'text-white/70' : 'text-gray-400'
                    }`}>
                      {new Date(msg.createdAt || msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex gap-3 items-center bg-white p-4 rounded-2xl rounded-tl-none border border-pink-100 shadow-sm">
                <Bot size={20} className="text-pink-600 animate-bounce" />
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-pink-300 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <form onSubmit={handleSendMessage} className="p-6 bg-white border-t border-pink-100">
          <div className="flex items-center gap-4 bg-pink-50 p-2 rounded-2xl border border-pink-200">
            <button 
              type="button" 
              onClick={() => fileInputRef.current.click()}
              className="p-3 text-pink-600 hover:bg-white rounded-xl transition-all shadow-sm"
              title="Şəkil yüklə"
            >
              <ImageIcon size={24} />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleImageUpload}
            />
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Sualınızı buraya yazın..."
              className="flex-grow bg-transparent border-none focus:ring-0 text-gray-700 py-3 px-2"
            />
            <button 
              type="submit" 
              className="p-3 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition-all shadow-lg"
              disabled={!inputText.trim()}
            >
              <Send size={24} />
            </button>
          </div>
          <div className="mt-3 flex items-center justify-center gap-2 text-gray-400 text-xs">
            <AlertCircle size={14} />
            AI məsləhətləri tövsiyə xarakterlidir. Real diaqnoz üçün mütəxəssisə müraciət edin.
          </div>
        </form>
      </div>
    </div>
  );
};

export default AIAdvisor;
