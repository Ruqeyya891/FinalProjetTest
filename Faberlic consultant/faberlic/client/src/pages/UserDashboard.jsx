import React, { useState, useEffect } from 'react';
import { User as UserIcon, Package, Settings, Heart, Bell, ShoppingBag, LogOut, ChevronRight, Star, Clock, MapPin, Phone, Mail, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('orders');
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const userRes = await axios.get('http://127.0.0.1:5000/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(userRes.data.user);

      const ordersRes = await axios.get('http://127.0.0.1:5000/api/orders/my-orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(ordersRes.data.orders);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Məlumatları yükləyərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success('Çıxış edildi');
    navigate('/login');
    window.dispatchEvent(new Event('storage'));
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-pink-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!user) return null;

  return (
    <div className="bg-pink-50/30 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white p-8 rounded-[40px] shadow-xl border border-pink-100 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-24 bg-pink-600"></div>
              <div className="relative z-10 pt-8">
                <div className="w-24 h-24 bg-white text-pink-600 rounded-3xl flex items-center justify-center font-black text-3xl shadow-xl mx-auto mb-6 border-4 border-pink-50">
                  {user.name?.[0]}{user.surname?.[0]}
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-1">{user.name} {user.surname}</h2>
                <p className="text-pink-600 font-bold text-sm uppercase tracking-widest mb-6">Xanım Consultant</p>
                
                <div className="space-y-3 pt-6 border-t border-pink-50">
                  {[
                    { id: 'orders', label: 'Sifarişlərim', icon: <Package size={20} /> },
                    { id: 'favorites', label: 'Favoritlər', icon: <Heart size={20} /> },
                    { id: 'notifications', label: 'Bildirişlər', icon: <Bell size={20} /> },
                    { id: 'settings', label: 'Ayarlar', icon: <Settings size={20} /> },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all ${
                        activeTab === tab.id 
                          ? 'bg-pink-600 text-white shadow-lg shadow-pink-100' 
                          : 'text-gray-500 hover:bg-pink-50 hover:text-pink-600'
                      }`}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  ))}
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-red-500 hover:bg-red-50 transition-all mt-8"
                  >
                    <LogOut size={20} />
                    Çıxış
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'orders' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-3xl font-black text-gray-900 flex items-center gap-4">
                    <Package className="text-pink-600" size={32} />
                    Sifarişlərim
                  </h3>
                  <Link to="/products" className="px-6 py-3 bg-white text-pink-600 font-black rounded-2xl border-2 border-pink-600 hover:bg-pink-50 transition-all shadow-md flex items-center gap-2">
                    Yeni Sifariş
                    <ChevronRight size={18} />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {orders.length > 0 ? orders.map(order => (
                    <div key={order._id} className="bg-white p-8 rounded-[32px] shadow-xl border border-pink-100 hover:shadow-2xl transition-all group">
                      <div className="flex justify-between items-start mb-6">
                        <div className="p-4 bg-pink-50 text-pink-600 rounded-2xl group-hover:bg-pink-600 group-hover:text-white transition-all">
                          <ShoppingBag size={24} />
                        </div>
                        <span className={`px-4 py-1.5 rounded-full text-xs font-black tracking-wide ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                        }`}>
                          {order.status === 'pending' ? 'Gözləmədə' : 
                           order.status === 'processing' ? 'Hazırlanır' :
                           order.status === 'shipped' ? 'Yolda' :
                           order.status === 'delivered' ? 'Çatdırıldı' : 'Ləğv edildi'}
                        </span>
                      </div>
                      <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-2">#{order._id.slice(-6)}</p>
                      <h4 className="text-2xl font-black text-gray-900 mb-6">{order.totalAmount} AZN</h4>
                      <div className="space-y-3 pt-6 border-t border-pink-50">
                        <div className="flex items-center gap-2 text-sm text-gray-500 font-bold">
                          <Clock size={16} className="text-pink-600" />
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="col-span-full bg-white p-12 rounded-[40px] shadow-xl border border-pink-100 text-center">
                      <div className="w-20 h-20 bg-pink-50 text-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <Package size={40} />
                      </div>
                      <h4 className="text-2xl font-black text-gray-900 mb-2">Hələ sifarişiniz yoxdur</h4>
                      <p className="text-gray-500 mb-8 font-medium">İlk sifarişinizi etmək üçün məhsullarımıza göz atın.</p>
                      <Link to="/products" className="inline-flex items-center gap-2 px-8 py-4 bg-pink-600 text-white font-black rounded-2xl hover:bg-pink-700 transition-all shadow-lg shadow-pink-100">
                        Alış-verişə Başla
                        <ArrowRight size={20} />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="bg-white p-12 rounded-[40px] shadow-xl border border-pink-100">
                <h3 className="text-3xl font-black text-gray-900 mb-10 flex items-center gap-4">
                  <Settings className="text-pink-600" size={32} />
                  Hesab Ayarları
                </h3>
                
                <form className="space-y-8 max-w-2xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">Tam Adınız</label>
                      <input type="text" defaultValue={user.fullName} className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-pink-200 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-700" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">E-poçt</label>
                      <input type="email" defaultValue={user.email} className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-pink-200 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-700" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">Telefon</label>
                    <input type="tel" defaultValue={user.phone} className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-pink-200 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-700" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">Ünvan</label>
                    <textarea className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-pink-200 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-700 min-h-[120px]" placeholder="Çatdırılma üçün ünvanınızı daxil edin..."></textarea>
                  </div>

                  <button className="px-12 py-5 bg-pink-600 text-white font-black text-lg rounded-2xl hover:bg-pink-700 transition-all shadow-xl shadow-pink-100">
                    Yadda Saxla
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;