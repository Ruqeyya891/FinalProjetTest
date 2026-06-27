import React, { useState, useRef, useEffect } from 'react';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, ShoppingBag, Heart, CheckCircle, ExternalLink } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  DialogContentText
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNotification } from '../contexts/NotificationContext';

const MIN_ORDER_AMOUNT = 32;

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('whatsapp_confirmation');
  const [user, setUser] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [activeCatalog, setActiveCatalog] = useState(null);
  const navigate = useNavigate();
  const { showSuccess, showError, showInfo, showConfirm } = useNotification();

  useEffect(() => {
    fetchCart();
    fetchFavorites();
    fetchUser();
    fetchActiveCatalog();
  }, []);

  const fetchActiveCatalog = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/api/catalog-cycles/active');
      setActiveCatalog(response.data.activeCatalog);
    } catch (error) {
      console.error('Error fetching active catalog:', error);
    }
  };

  const fetchUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await axios.get('http://127.0.0.1:5000/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data.user);
    } catch (error) {
      console.error('User fetch error:', error);
    }
  };

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
      showError('Səbəti yükləyərkən xəta baş verdi');
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
      showInfo('Bu əməliyyat üçün daxil olmalısınız.');
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
      showSuccess(isNowFavorite ? 'Məhsul seçilmişlərə əlavə edildi!' : 'Məhsul seçilmişlərdən silindi!');
    } catch (error) {
      showError('Xəta baş verdi');
    }
  };

  const updateQuantity = async (productId, newQuantity, variantSku = null) => {
    if (newQuantity < 1) return;
    const token = localStorage.getItem('token');
    try {
      const response = await axios.post('http://127.0.0.1:5000/api/users/cart/update', 
        { productId, quantity: newQuantity, variantSku },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCart();
    } catch (error) {
      showError('Miqdar yenilənərkən xəta baş verdi');
    }
  };

  const removeItem = async (productId, variantSku = null) => {
    const confirmed = await showConfirm();
    if (!confirmed) return;
    
    const token = localStorage.getItem('token');
    try {
      const url = variantSku 
        ? `http://127.0.0.1:5000/api/users/cart/${productId}?variantSku=${encodeURIComponent(variantSku)}`
        : `http://127.0.0.1:5000/api/users/cart/${productId}`;
      await axios.delete(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCart();
      showSuccess('Məhsul səbətdən silindi');
    } catch (error) {
      showError('Məhsul silinərkən xəta baş verdi');
    }
  };

  // Filter out invalid items with null product
  const validCartItems = cartItems.filter(item => item.product || item.productId);

  const subtotal = validCartItems.reduce((acc, item) => {
    if (item.product && item.product.price_sale) {
      return acc + (item.product.price_sale * item.quantity);
    }
    return acc;
  }, 0);
  const total = subtotal;
  const isBelowMinOrder = total < MIN_ORDER_AMOUNT;

  const generateWhatsAppLink = (order) => {
    if (!order) return '';
    const orderNumber = order._id?.slice(-6) || '';
    const customerName = `${user?.name || ''} ${user?.surname || ''}`.trim();
    const phone = user?.phone || '';
    // Filter invalid items in order too for safety
    const validItems = (order.items || []).filter(item => item.name);
    const productsList = validItems.map(item => `${item.name} x ${item.quantity} - ${item.total} AZN`).join('%0A');
    const message = `Sifariş #${orderNumber}%0A%0AAd: ${customerName}%0ATelefon: ${phone}%0A%0AMəhsullar:%0A${productsList}%0A%0ACəmi: ${order.totalAmount} AZN`;
    return `https://wa.me/?text=${encodeURIComponent(message)}`;
  };

  const handleCheckout = async () => {
    const token = localStorage.getItem('token');
    try {
      const orderData = {
        products: validCartItems.map(item => ({
          product: item.product?._id || item.productId,
          quantity: item.quantity,
          price: item.product?.price_sale || 0
        })),
        totalAmount: total,
        contactMethod: 'whatsapp',
        paymentMethod
      };

      const response = await axios.post('http://127.0.0.1:5000/api/orders', orderData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setCreatedOrder(response.data.order);
      setShowSuccessModal(true);
      setCartItems([]);
    } catch (error) {
      showError(error.response?.data?.message || 'Sifariş zamanı xəta baş verdi');
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    navigate('/dashboard');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-pink-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
          <ShoppingCart className="text-pink-600" />
          Səbətim
        </h2>

        {validCartItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-4">
              {validCartItems.map((item) => {
                // If product is null/undefined, show "Məhsul tapılmadı"
                if (!item.product) {
                  return (
                    <div key={item._id || item.productId} className="bg-white p-6 rounded-2xl shadow-sm border border-red-100 flex items-center gap-6">
                      <div className="w-24 h-24 bg-red-50 rounded-xl flex items-center justify-center">
                        <Trash2 className="text-red-400" />
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-bold text-red-600">Məhsul tapılmadı</h3>
                        <p className="text-sm text-gray-500">Bu məhsul artıq mövcud deyil</p>
                      </div>
                      <button 
                        onClick={() => removeItem(item.productId, item.variantSku)} 
                        className="p-3 text-red-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  );
                }

                // Otherwise render normal product item
                const productId = item.product._id;
                const productName = item.product.name || 'Məhsul';

                return (
                  <div key={productId} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6">
                    <img 
                      src={
                        item.product.variants?.[0]?.variantImage || 
                        item.product.variants?.[0]?.image || 
                        item.product.commonImages?.[0] || 
                        item.product.images?.[0] || 
                        item.product.image
                      } 
                      alt={productName} 
                      className="w-24 h-24 object-contain bg-pink-50 rounded-xl" 
                    />
                    <div className="flex-grow">
                      <h3 className="font-bold text-gray-900">{productName}</h3>
                      <p className="text-sm text-gray-500">{item.product.mainCategory || ''}</p>
                      <div className="mt-2 text-pink-600 font-bold">{item.product.price_sale} AZN</div>
                    </div>
                    <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-xl">
                      <button onClick={() => updateQuantity(productId, item.quantity - 1, item.variantSku)} className="p-1 hover:text-pink-600 transition-colors">
                        <Minus size={18} />
                      </button>
                      <span className="font-bold w-8 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(productId, item.quantity + 1, item.variantSku)} className="p-1 hover:text-pink-600 transition-colors">
                        <Plus size={18} />
                      </button>
                    </div>
                    <button 
                      onClick={() => toggleFavorite(productId)} 
                      className="p-3 text-gray-400 hover:text-pink-600 transition-colors"
                    >
                      <Heart 
                        size={20} 
                        fill={favorites.includes(productId) ? "currentColor" : "none"} 
                      />
                    </button>
                    <button 
                      onClick={() => removeItem(productId, item.variantSku)} 
                      className="p-3 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                );
              })}
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

                {/* Minimum order warning */}
                {isBelowMinOrder && (
                  <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                    <p className="text-yellow-800 text-sm font-medium">
                      Minimum sifariş məbləği 32 AZN-dir. Sifarişi tamamlamaq üçün səbətə əlavə məhsul əlavə edin.
                    </p>
                  </div>
                )}

                {/* Payment method selection */}
                <div className="mb-6">
                  <h4 className="font-bold text-gray-900 mb-3">Ödəniş metodu</h4>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-4 border rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value="admin_confirmation" 
                        checked={true} 
                        disabled
                        className="w-4 h-4 text-pink-600"
                      />
                      <span className="font-medium text-gray-900">Admin təsdiqi</span>
                    </label>
                  </div>
                </div>

                {/* Catalog info */}
                {activeCatalog ? (
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <p className="text-blue-800 text-sm font-medium">
                      Kataloq {activeCatalog.catalogNumber} üzrə qiymətlər keçərlidir.
                    </p>
                    <p className="text-blue-800 text-sm font-medium mt-1">
                      Ödəniş üçün son tarix: {new Date(activeCatalog.endDate).toLocaleDateString()}
                    </p>
                  </div>
                ) : (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-800 text-sm font-medium">
                      Aktiv kataloq tapılmadı. Qiymətlər müvəqqəti göstərilmir.
                    </p>
                  </div>
                )}

                <button 
                  onClick={handleCheckout}
                  disabled={isBelowMinOrder}
                  className={`w-full py-4 font-bold rounded-2xl transition-all shadow-xl flex items-center justify-center gap-3 ${
                    isBelowMinOrder 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-pink-600 text-white hover:bg-pink-700 shadow-pink-100'
                  }`}
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

      {/* Material UI Success Modal */}
      <Dialog
        open={showSuccessModal && !!createdOrder}
        onClose={handleSuccessModalClose}
        aria-labelledby="success-dialog-title"
        aria-describedby="success-dialog-description"
      >
        <DialogTitle id="success-dialog-title" sx={{ textAlign: 'center' }}>
          Sifarişiniz qəbul edildi!
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center' }}>
          <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          <DialogContentText id="success-dialog-description">
            Sifarişiniz qeydə alındı. Məhsullar ödəniş təsdiqləndikdən sonra hazırlanacaq.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ flexDirection: 'column', gap: 1, p: 3 }}>
          {paymentMethod === 'whatsapp_confirmation' && (
            <Button 
              href={generateWhatsAppLink(createdOrder)} 
              target="_blank" 
              rel="noopener noreferrer"
              variant="contained"
              color="success"
              fullWidth
              startIcon={<ExternalLink size={20} />}
            >
              WhatsApp-a mesaj göndər
            </Button>
          )}
          <Button 
            onClick={handleSuccessModalClose} 
            color="inherit"
            fullWidth
          >
            Sifarişlərimə bax
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Cart;