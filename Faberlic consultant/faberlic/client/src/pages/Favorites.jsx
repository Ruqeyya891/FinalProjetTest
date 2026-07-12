import { useState, useEffect } from 'react';
import { Heart, ShoppingCart, Trash2, ArrowRight, Info, Loader, Plus, Check } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../utils/axios';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  DialogContentText
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import { useNotification } from '../contexts/NotificationContext';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { showSuccess, showError, showConfirm } = useNotification();
  
  // Cart & button states
  const [cartItems, setCartItems] = useState([]);
  const [loadingProductIds, setLoadingProductIds] = useState(new Set());
  const [successProductIds, setSuccessProductIds] = useState(new Set());

  useEffect(() => {
    fetchFavorites();
    fetchCart();
  }, []);

  const fetchFavorites = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const response = await apiClient.get('/api/users/favorites', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFavorites(response.data.favorites);
    } catch (error) {
      showError('Seçilmişləri yükləyərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const fetchCart = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await apiClient.get('/api/users/cart', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCartItems(response.data.cart);
    } catch (error) {
      console.error('Fetch cart error:', error);
    }
  };

  const isProductInCart = (productId, variantSku = null) => {
    return cartItems.some(item => {
      const itemProductId = item.product?._id || item.productId;
      const matchesProduct = itemProductId === productId;
      const matchesVariant = !variantSku || item.variantSku === variantSku;
      return matchesProduct && matchesVariant;
    });
  };

  const removeFavorite = async (productId) => {
    const confirmed = await showConfirm();
    if (!confirmed) return;
    
    const token = localStorage.getItem('token');
    try {
      const response = await apiClient.post('/api/users/favorites/toggle', 
        { productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFavorites(favorites.filter(item => item._id !== productId));
      showSuccess('Məhsul seçilmişlərdən silindi');
    } catch (error) {
      showError('Xəta baş verdi');
    }
  };

  const addToCart = async (product) => {
    const productId = product._id;
    
    const token = localStorage.getItem('token');
    if (!token) {
      showInfo('Bu əməliyyat üçün daxil olmalısınız.');
      navigate('/login');
      return;
    }

    setLoadingProductIds(prev => new Set(prev).add(productId));
    
    try {
      await apiClient.post('/api/users/cart/add', 
        { productId, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSuccessProductIds(prev => new Set(prev).add(productId));
      fetchCart();
      
      setTimeout(() => {
        setSuccessProductIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
      }, 1000);
    } catch (error) {
      showError('Xəta baş verdi');
    } finally {
      setLoadingProductIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-pink-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
          <Heart className="text-pink-600 fill-pink-600" />
          Seçilmişlərim
        </h1>

        {favorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {favorites.map((product) => (
              <div key={product._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-xl transition-all">
                <div className="relative aspect-square">
                  <img 
                    src={
                      product.variants?.[0]?.variantImage ||
                      product.variants?.[0]?.image ||
                      product.commonImages?.[0] ||
                      product.images?.[0] ||
                      product.image
                    } 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <button 
                    onClick={() => removeFavorite(product._id)}
                    className="absolute top-4 right-4 p-2 bg-white text-pink-600 rounded-full shadow-md hover:bg-pink-600 hover:text-white transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <div className="p-6">
                  <div className="text-xs text-pink-600 font-bold mb-2">{product.mainCategory}</div>
                  <h3 className="font-bold text-gray-900 mb-4 line-clamp-1">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-extrabold text-pink-600">{product.price_sale} AZN</span>
                    <div className="flex gap-2">
                      <Link to={`/product/${product._id}`} className="p-2 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100">
                        <Info size={20} />
                      </Link>
                      <button 
                        onClick={() => addToCart(product)} 
                        disabled={loadingProductIds.has(product._id)}
                        className="p-2 bg-pink-50 text-pink-600 rounded-xl hover:bg-pink-600 hover:text-white flex items-center justify-center"
                      >
                        {loadingProductIds.has(product._id) ? (
                          <Loader size={20} className="animate-spin" />
                        ) : successProductIds.has(product._id) ? (
                          <Check size={20} />
                        ) : isProductInCart(product._id) ? (
                          <Plus size={20} />
                        ) : (
                          <ShoppingCart size={20} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-20 text-center border-2 border-dashed border-gray-200">
            <Heart size={64} className="mx-auto text-gray-200 mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Seçilmiş məhsulunuz yoxdur</h3>
            <p className="text-gray-500 mb-8">Bəyəndiyiniz məhsulları bura əlavə edə bilərsiniz.</p>
            <Link to="/products" className="inline-flex items-center gap-2 px-8 py-4 bg-pink-600 text-white font-bold rounded-2xl hover:bg-pink-700 transition-all shadow-lg">
              Məhsullara bax
              <ArrowRight size={20} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
