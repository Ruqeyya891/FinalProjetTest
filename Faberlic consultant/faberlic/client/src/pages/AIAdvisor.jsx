import React, { useState, useRef, useEffect } from 'react';
import { Send, User, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../utils/axios';
import { useNotification } from '../contexts/NotificationContext';

const AIAdvisor = () => {
  const navigate = useNavigate();
  const { showInfo } = useNotification();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [chatId, setChatId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mark messages as read
  const markAsRead = async (currentChatId, token) => {
    try {
      await apiClient.put(
        "/api/messages/user/read",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Error marking messages as read:", err);
    }
  };

  // Check auth and load chat
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      showInfo('Admin ilə söhbət etmək üçün daxil olmalısınız.');
      navigate('/login');
      return;
    }

    const checkExistingChat = async () => {
      try {
        const response = await apiClient.get('/api/messages/my-chat', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data) {
          const id = response.data._id.toString();
          setChatId(id);
          loadExistingMessages(id, token);
          markAsRead(id, token); // Mark as read when chat opens
        }
      } catch (error) {
        console.log('No existing chat found');
      }
    };
    checkExistingChat();
  }, [navigate]);

  const loadExistingMessages = async (existingChatId, token) => {
    try {
      const response = await apiClient.get(`/api/messages/${existingChatId}`, {
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
      showInfo('Admin ilə söhbət etmək üçün daxil olmalısınız.');
      navigate('/login');
      return;
    }

    const userMessage = { _id: Date.now().toString(), senderType: 'user', text: inputText, createdAt: new Date() };
    setMessages([...messages, userMessage]);
    setInputText('');

    try {
      const response = await apiClient.post('/api/messages', {
        chatId: chatId,
        text: inputText
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.chatId) {
        setChatId(response.data.chatId);
        loadExistingMessages(response.data.chatId, token);
      }
    } catch (error) {
      console.error('Chat error:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 h-[calc(100vh-140px)] flex flex-col">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col flex-grow border border-pink-100">
        {/* Chat Header */}
        <div className="bg-pink-600 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
              <User size={28} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Admin ilə Söhbət</h2>
              <p className="text-pink-100 text-sm flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Onlayn
              </p>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-grow overflow-y-auto p-6 space-y-6 bg-pink-50/30">
          {messages.length === 0 ? (
            <div className="flex justify-center">
              <div className="flex flex-col items-center gap-3 bg-white p-6 rounded-2xl shadow-sm border border-pink-100 max-w-md">
                <AlertCircle size={32} className="text-pink-600" />
                <p className="text-sm text-gray-600 text-center">Salam! Admin ilə söhbətə xoş gəlmisiniz. Sualınızı yazın və biz sizə cavab verəcəyik.</p>
              </div>
            </div>
          ) : (
            messages.map((msg, index) => (
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
                     <User size={20} />}
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
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <form onSubmit={handleSendMessage} className="p-6 bg-white border-t border-pink-100">
          <div className="flex items-center gap-4 bg-pink-50 p-2 rounded-2xl border border-pink-200">
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Mesajınızı yazın..."
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
        </form>
      </div>
    </div>
  );
};

export default AIAdvisor;
