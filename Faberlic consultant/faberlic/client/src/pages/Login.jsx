import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://127.0.0.1:5000/api/users/login', formData);
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        console.log('Login successful. Token saved.');
        
        // Decode token to check role
        const decoded = jwtDecode(response.data.token);
        console.log('Decoded token role:', decoded.role);
        
        if (decoded.role === 'admin') {
          console.log('Navigating to admin...');
          navigate('/admin');
        } else {
          console.log('Navigating to dashboard...');
          navigate('/dashboard');
        }
        
        // Trigger storage event for App.js to update isAdmin state
        window.dispatchEvent(new Event('storage'));
        toast.success('Giriş uğurla tamamlandı!');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Giriş zamanı xəta baş verdi');
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-pink-50/30 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-pink-100 overflow-hidden">
        <div className="bg-pink-600 p-10 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-48 h-48 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="relative z-10">
            <h2 className="text-3xl font-black mb-3">Xoş Gəldiniz!</h2>
            <p className="text-pink-100 text-sm font-medium tracking-wide">Faberlic Consultant Hesabınıza Giriş Edin</p>
          </div>
        </div>
        
        <div className="p-10">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">E-poçt Ünvanı</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-pink-600 transition-colors" size={20} />
                <input 
                  type="email" 
                  placeholder="nümunə@mail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent focus:border-pink-200 focus:bg-white rounded-2xl outline-none transition-all text-gray-700 font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between px-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Şifrə</label>
                <button type="button" className="text-xs font-bold text-pink-600 hover:underline">Şifrəni unutmusunuz?</button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-pink-600 transition-colors" size={20} />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full pl-14 pr-14 py-4 bg-gray-50 border-2 border-transparent focus:border-pink-200 focus:bg-white rounded-2xl outline-none transition-all text-gray-700 font-medium"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pink-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button className="w-full py-5 bg-pink-600 text-white font-black text-lg rounded-2xl hover:bg-pink-700 transition-all shadow-xl shadow-pink-100 flex items-center justify-center gap-3 active:scale-95">
              Daxil Ol
              <ArrowRight size={22} />
            </button>
          </form>

          <div className="mt-12 text-center space-y-6">
            <div className="flex items-center gap-4 text-gray-300">
              <div className="h-[1px] bg-gray-200 flex-grow"></div>
              <span className="text-xs font-bold uppercase tracking-widest">və ya</span>
              <div className="h-[1px] bg-gray-200 flex-grow"></div>
            </div>
            <p className="text-gray-500 font-medium">
              Hesabınız yoxdur? {' '}
              <Link to="/register" className="text-pink-600 font-black hover:underline ml-1">Qeydiyyatdan Keçin</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
