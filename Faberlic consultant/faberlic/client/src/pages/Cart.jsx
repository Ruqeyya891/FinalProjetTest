import React, { useState, useEffect } from 'react';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, ShoppingBag, Heart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
    fetchFavorites();
  }, []);

  const fetchCart = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const response = await axios.get('http://127.0.0.1:5000/api/users/cart', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCartItems(response.data.cart);
    } catch (error) {
      toast.error('Səbəti yükləyərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await axios.get('http://127.0.0.1:5000/api/users/favorites', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const favoriteIds = response.data.favorites.map(fav => 
        typeof fav === 'object' ? fav._id : fav
      );
      setFavorites(favoriteIds);
    } catch (error) {
      console.error('Favorites fetch error:', error);
    }
  };

  const toggleFavorite = async (productId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.info('Bu əməliyyat üçün daxil olmalısınız.');
      navigate('/login');
      return;
    }

    try {
      const response = await axios.post('http://127.0.0.1:5000/api/users/favorites/toggle', 
        { productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update favorites state
      const newFavorites = response.data.favorites.map(fav => 
        typeof fav === 'object' ? fav._id : fav
      );
      setFavorites(newFavorites);
      
      const isNowFavorite = newFavorites.includes(productId);
      toast.success(isNowFavorite ? 'Məhsul seçilmişlərə əlavə edildi!' : 'Məhsul seçilmişlərdən silindi!');
    } catch (error) {
      toast.error('Xəta baş verdi');
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    const token = localStorage.getItem('token');
    try {
      const response = await axios.post('http://127.0.0.1:5000/api/users/cart/update', 
        { productId, quantity: newQuantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCart();
    } catch (error) {
      toast.error('Miqdar yenilənərkən xəta baş verdi');
    }
  };

  const removeItem = async (productId) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://127.0.0.1:5000/api/users/cart/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCartItems(cartItems.filter(item => (item.product._id || item.product) !== productId));
      toast.success('Məhsul səbətdən silindi');
    } catch (error) {
      toast.error('Məhsul silinərkən xəta baş verdi');
    }
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (item.product.price_sale * item.quantity), 0);
  const total = subtotal;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-pink-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const handleCheckout = async () => {
    const token = localStorage.getItem('token');
    try {
      const orderData = {
        products: cartItems.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
          price: item.product.price_sale
        })),
        totalAmount: total,
        contactMethod: 'whatsapp'
      };

      await axios.post('http://127.0.0.1:5000/api/orders', orderData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Sifarişiniz uğurla qəbul edildi!');
      setCartItems([]);
      navigate('/dashboard');
    } catch (error) {
      toast.error('Sifariş zamanı xəta baş verdi');
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
          <ShoppingCart className="text-pink-600" />
          Səbətim
        </h2>

        {cartItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item.product._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6">
                  <img src={item.product.image} alt={item.product.name} className="w-24 h-24 object-cover rounded-xl" />
                  <div className="flex-grow">
                    <h3 className="font-bold text-gray-900">{item.product.name}</h3>
                    <p className="text-sm text-gray-500">{item.product.mainCategory}</p>
                    <div className="mt-2 text-pink-600 font-bold">{item.product.price_sale} AZN</div>
                  </div>
                  <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-xl">
                    <button onClick={() => updateQuantity(item.product._id, item.quantity - 1)} className="p-1 hover:text-pink-600 transition-colors">
                      <Minus size={18} />
                    </button>
                    <span className="font-bold w-8 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product._id, item.quantity + 1)} className="p-1 hover:text-pink-600 transition-colors">
                      <Plus size={18} />
                    </button>
                  </div>
                  <button 
                    onClick={() => toggleFavorite(item.product._id)} 
                    className="p-3 text-gray-400 hover:text-pink-600 transition-colors"
                  >
                    <Heart 
                      size={20} 
                      fill={favorites.includes(item.product._id) ? "currentColor" : "none"} 
                    />
                  </button>
                  <button onClick={() => removeItem(item.product._id)} className="p-3 text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 sticky top-24">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Sifarişin xülasəsi</h3>
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-gray-600">
                    <span>Məhsulun qiyməti</span>
                    <span>{subtotal.toFixed(2)} AZN</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Çatdırılma</span>
                    <span className="text-green-600 font-bold">Pulsuz</span>
                  </div>
                  <div className="border-t border-gray-100 pt-4 flex justify-between text-xl font-bold text-gray-900">
                    <span>Cəmi</span>
                    <span className="text-pink-600">{total.toFixed(2)} AZN</span>
                  </div>
                </div>
                <button 
                  onClick={handleCheckout}
                  className="w-full py-4 bg-pink-600 text-white font-bold rounded-2xl hover:bg-pink-700 transition-all shadow-xl shadow-pink-100 flex items-center justify-center gap-3"
                >
                  Sifarişi rəsmiləşdir
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-20 text-center border-2 border-dashed border-gray-200">
            <ShoppingBag size={64} className="mx-auto text-gray-200 mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Səbətiniz boşdur</h3>
            <p className="text-gray-500 mb-8">Hələ heç bir məhsul əlavə etməmisiniz.</p>
            <Link to="/products" className="inline-flex items-center gap-2 px-8 py-4 bg-pink-600 text-white font-bold rounded-2xl hover:bg-pink-700 transition-all shadow-lg">
              Məhsullara Bax
              <ArrowRight size={20} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
