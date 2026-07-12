import React, { useState } from 'react';
import { User, Mail, Phone, Eye, EyeOff, ShieldCheck, Heart, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../utils/axios';
import { useNotification } from '../contexts/NotificationContext';

const Register = () => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [accessKey, setAccessKey] = useState('');
  const [customerCode, setCustomerCode] = useState('');
  const navigate = useNavigate();
  const { showSuccess: notifySuccess, showError } = useNotification();
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.post('/api/users/register', formData);
      if (response.data.success) {
        setCustomerCode(response.data.user.customerCode);
        setAccessKey(response.data.accessKey);
        setShowSuccess(true);
        notifySuccess('Qeydiyyat uğurla tamamlandı!');
      }
    } catch (error) {
      showError(error.response?.data?.error || 'Qeydiyyat zamanı xəta baş verdi');
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-pink-50/30 flex items-center justify-center p-6 py-12 md:py-24">
        <div className="max-w-md w-full bg-white rounded-[40px] shadow-2xl border border-pink-100 overflow-hidden p-10 md:p-14 text-center">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="text-green-600" size={48} />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-4">Qeydiyyat Uğurlu!</h2>
          <p className="text-gray-500 font-medium mb-8">
            Müştəri kodunuzu və giriş açarınızı yadda saxlamağı unutmayın!
          </p>

          <div className="space-y-6 mb-10">
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] mb-2">Müştəri Kodu</p>
              <p className="text-2xl font-black text-pink-600">{customerCode}</p>
            </div>
            <div className="p-6 bg-pink-50 rounded-2xl border border-pink-100">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] mb-2">Giriş Açarı</p>
              <p className="text-2xl font-black text-pink-700">{accessKey}</p>
            </div>
          </div>

          <button 
            onClick={() => navigate('/login')}
            className="w-full py-5 bg-pink-600 text-white font-black text-lg rounded-2xl hover:bg-pink-700 transition-all shadow-xl shadow-pink-100 flex items-center justify-center gap-3 active:scale-95"
          >
            Giriş Səhifəsinə Qayıt
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-pink-50/30 flex items-center justify-center p-6 py-12 md:py-24">
      <div className="max-w-2xl w-full bg-white rounded-[40px] shadow-2xl border border-pink-100 overflow-hidden flex flex-col md:flex-row">
        {/* Left Side - Info */}
        <div className="md:w-5/12 bg-pink-600 p-10 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-10 -left-10 w-48 h-48 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-700"></div>
          
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-md">
              <Heart className="text-pink-200" size={32} />
            </div>
            <h2 className="text-3xl font-black mb-6 leading-tight">Yalnız Xanımlar Üçün!</h2>
            <p className="text-pink-100 text-lg font-medium leading-relaxed opacity-90">
              Faberlik dünyasına qoşulun, 20% endirim qazanın və gözəllik komandamızın bir parçası olun.
            </p>
          </div>

          <div className="relative z-10 mt-12 space-y-6">
            <div className="flex items-center gap-4 group">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white/20 transition-all">
                <ShieldCheck size={20} className="text-pink-100" />
              </div>
              <p className="text-sm font-bold tracking-wide">Təhlükəsiz Qeydiyyat</p>
            </div>
            <div className="flex items-center gap-4 group">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white/20 transition-all">
                <Heart size={20} className="text-pink-200" />
              </div>
              <p className="text-sm font-bold tracking-wide">Eksklüziv Fürsətlər</p>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="md:w-7/12 p-10 md:p-14">
          <div className="mb-10">
            <h3 className="text-2xl font-black text-gray-900 mb-2">Qeydiyyat Formu</h3>
            <p className="text-gray-400 font-medium text-sm">Zəhmət olmasa məlumatlarınızı daxil edin</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] px-2">Ad Soyad</label>
              <div className="relative group">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-pink-600 transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="Məs: Aygün Məmmədova"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  className="w-full pl-14 pr-6 py-3.5 bg-gray-50 border-2 border-transparent focus:border-pink-200 focus:bg-white rounded-2xl outline-none transition-all text-gray-700 font-medium text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] px-2">Telefon Nömrəsi</label>
              <div className="relative group">
                <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-pink-600 transition-colors" size={18} />
                <input 
                  type="tel" 
                  placeholder="+994 XX XXX XX XX"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full pl-14 pr-6 py-3.5 bg-gray-50 border-2 border-transparent focus:border-pink-200 focus:bg-white rounded-2xl outline-none transition-all text-gray-700 font-medium text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] px-2">E-poçt</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-pink-600 transition-colors" size={18} />
                <input 
                  type="email" 
                  placeholder="mail@misal.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full pl-14 pr-6 py-3.5 bg-gray-50 border-2 border-transparent focus:border-pink-200 focus:bg-white rounded-2xl outline-none transition-all text-gray-700 font-medium text-sm"
                  required
                />
              </div>
            </div>

            <button className="w-full py-5 bg-pink-600 text-white font-black text-lg rounded-2xl hover:bg-pink-700 transition-all shadow-xl shadow-pink-100 flex items-center justify-center gap-3 active:scale-95 group">
              Qeydiyyatı Tamamla
              <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-gray-500 font-medium text-sm">
              Artıq hesabınız var? {' '}
              <Link to="/login" className="text-pink-600 font-black hover:underline ml-1">Daxil Olun</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
