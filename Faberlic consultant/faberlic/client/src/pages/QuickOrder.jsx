import React, { useState, useEffect } from 'react';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, ShoppingBag, Search, Info, Heart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const QuickOrder = () => {
  const [cartItems, setCartItems] = useState([]);
  const [promoProducts, setPromoProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [articleSearch, setArticleSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
    fetchPromoProducts();
  }, []);

  const fetchCart = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await axios.get('http://127.0.0.1:5000/api/users/cart', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCartItems(response.data.cart);
      } catch (error) {
        console.error('Cart fetch error:', error);
      }
    }
  };

  const fetchPromoProducts = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/api/products', {
        params: { isDiscount: true, isPromotion: true }
      });
      setPromoProducts(response.data);
    } catch (error) {
      console.error('Promo products fetch error:', error);
      setPromoProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.info('Bu əməliyyat üçün daxil olmalısınız.');
      navigate('/login');
      return;
    }

    try {
      const payload = { productId: product._id || product.id, quantity: 1 };
      await axios.post('http://127.0.0.1:5000/api/users/cart/add', 
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Məhsul səbətə əlavə edildi!');
      fetchCart();
    } catch (error) {
      toast.error('Xəta baş verdi');
    }
  };

  return (
    <div className="bg-white min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Sürətli Sifariş Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Sürətli sifariş</h1>
            <div className="w-6 h-6 rounded-full border-2 border-blue-500 flex items-center justify-center">
              <span className="text-blue-500 text-xs font-bold">?</span>
            </div>
          </div>
          
          {/* Article Search */}
          <div className="relative mb-8 flex gap-4 items-center">
            <div className="relative flex-grow">
              <input 
                type="text" 
                placeholder="Məhsulun artikul ilə əlavə edilməsi"
                value={articleSearch}
                onChange={(e) => setArticleSearch(e.target.value)}
                className="w-full pl-4 pr-12 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2">
                <Search className="text-gray-500" size={20} />
              </button>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <button className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-all flex items-center justify-center gap-2">
              <Heart size={20} />
              Seçilmişlərdən əlavə etmək
            </button>
            <button className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-all flex items-center justify-center gap-2">
              <ShoppingBag size={20} />
              Promokod və ya sertifikat
            </button>
            <button className="px-6 py-3 bg-pink-600 text-white font-semibold rounded-lg hover:bg-pink-700 transition-all flex items-center justify-center gap-2">
              <Info size={20} />
              Şəxsi aksiyalar
            </button>
          </div>
        </div>

        {/* Promotional Products Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Səbətə əlavə et! Əla - qiymət!
          </h2>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-10 h-10 border-4 border-pink-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : promoProducts.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
              <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Heç bir endirimli/aksiya məhsulu yoxdur</p>
            </div>
          ) : (
            <div className="space-y-3">
              {promoProducts.map(product => (
                <div key={product._id} className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-center gap-4">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-20 h-20 object-contain"
                  />
                  <div className="flex-grow">
                    <h3 className="font-semibold text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-600">Artikul: <span className="font-bold">{product.sku}</span></p>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-400 text-sm line-through">{product.price_catalog} ₼</div>
                    <div className="text-lg font-bold text-gray-900">{product.price_sale} ₼</div>
                  </div>
                  <div className="text-gray-700 text-sm font-bold">
                    {(product.price_catalog - product.price_sale).toFixed(2)}
                  </div>
                  <div className="flex items-center gap-2 bg-white border border-gray-300 p-1 rounded">
                    <button className="p-1 text-gray-500 hover:text-blue-600">
                      <Minus size={18} />
                    </button>
                    <span className="font-bold w-10 text-center">1</span>
                    <button className="p-1 text-gray-500 hover:text-blue-600">
                      <Plus size={18} />
                    </button>
                  </div>
                  <button 
                    onClick={() => addToCart(product)} 
                    className="px-6 py-3 bg-gray-800 text-white font-bold rounded hover:bg-gray-900 transition-all"
                  >
                    Səbətə
                  </button>
                  <button className="p-2 text-gray-600 hover:text-pink-600">
                    <Heart size={20} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickOrder;
