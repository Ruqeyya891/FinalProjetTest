import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, ShieldCheck, Truck, ArrowLeft, Star, MessageCircle, Instagram } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    fetchProduct();
    checkIfFavorite();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:5000/api/products/${id}`);
      setProduct(response.data);
    } catch (error) {
      toast.error('Məhsul tapılmadı');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const checkIfFavorite = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await axios.get('http://127.0.0.1:5000/api/users/favorites', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsFavorite(response.data.favorites.some(f => (f._id || f) === id));
    } catch (error) {
      console.error('Check favorite error:', error);
    }
  };

  const handleAction = async (action) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.info('Bu əməliyyat üçün daxil olmalısınız.');
      navigate('/login');
      return;
    }

    try {
      if (action === 'cart') {
        await axios.post('http://127.0.0.1:5000/api/users/cart/add', 
          { productId: id, quantity: 1 },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Məhsul səbətə əlavə edildi!');
      } else if (action === 'favorite') {
        const response = await axios.post('http://127.0.0.1:5000/api/users/favorites/toggle', 
          { productId: id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const liked = response.data.favorites.includes(id);
        setIsFavorite(liked);
        toast.success(liked ? 'Seçilmişlərə əlavə edildi' : 'Seçilmişlərdən silindi');
      }
    } catch (error) {
      toast.error('Xəta baş verdi');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-pink-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="bg-pink-50/30 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/products" className="flex items-center text-pink-600 font-bold mb-8 hover:gap-2 transition-all">
          <ArrowLeft size={20} className="mr-2" />
          Məhsullara Qayıt
        </Link>

        <div className="bg-white rounded-[40px] shadow-xl overflow-hidden border border-pink-100">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 p-8 md:p-16">
            {/* Image Section */}
            <div className="space-y-6">
              <div className="aspect-square rounded-3xl overflow-hidden bg-pink-50 border border-pink-100">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              </div>
              <div className="grid grid-cols-4 gap-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="aspect-square rounded-xl bg-pink-50 border border-pink-100 cursor-pointer hover:border-pink-300 transition-all overflow-hidden">
                    <img src={product.image} className="w-full h-full object-cover opacity-50 hover:opacity-100" />
                  </div>
                ))}
              </div>
            </div>

            {/* Info Section */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-pink-100 text-pink-600 text-xs font-black rounded-full uppercase tracking-widest">
                    {product.category}
                  </span>
                </div>
                <button 
                  onClick={() => handleAction('favorite')}
                  className={`p-3 rounded-full shadow-md transition-all ${isFavorite ? 'bg-pink-600 text-white' : 'bg-gray-50 text-gray-400 hover:text-pink-600'}`}
                >
                  <Heart size={24} fill={isFavorite ? 'currentColor' : 'none'} />
                </button>
              </div>
              
              <h1 className="text-4xl font-black text-gray-900 mb-4">{product.name}</h1>
              
              <div className="flex items-center gap-4 mb-8">
                <div className="flex items-center text-yellow-400">
                  <Star size={18} fill="currentColor" />
                  <Star size={18} fill="currentColor" />
                  <Star size={18} fill="currentColor" />
                  <Star size={18} fill="currentColor" />
                  <Star size={18} fill="currentColor" />
                </div>
                <span className="text-gray-400 text-sm font-bold">(124 rəy)</span>
              </div>

              <div className="flex items-center gap-2 mb-6">
                <span className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-bold rounded-full uppercase tracking-widest">
                  Art. {product.sku}
                </span>
              </div>
              
              <div className="flex items-end gap-4 mb-10">
                <span className="text-4xl font-black text-pink-600">{product.price_sale} AZN</span>
                <span className="text-xl text-gray-300 line-through font-bold mb-1">{product.price_catalog} AZN</span>
              </div>

              <div className="space-y-4 mb-10">
                <div className="flex items-center gap-3 text-gray-600">
                  <ShieldCheck className="text-pink-600" size={24} />
                  <span className="font-bold">100% Orijinal Faberlik Məhsulu</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Truck className="text-pink-600" size={24} />
                  <span className="font-bold">Sürətli Çatdırılma</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-auto">
                <button 
                  onClick={() => handleAction('cart')}
                  className="flex-grow py-5 bg-pink-600 text-white font-black text-lg rounded-2xl hover:bg-pink-700 transition-all shadow-xl shadow-pink-100 flex items-center justify-center gap-3"
                >
                  <ShoppingCart size={24} />
                  Səbətə Əlavə Et
                </button>
                <a href="https://wa.me/994519848659" target="_blank" className="flex-grow py-5 bg-green-600 text-white font-black text-lg rounded-2xl hover:bg-green-700 transition-all shadow-xl shadow-green-100 flex items-center justify-center gap-3">
                  <MessageCircle size={24} />
                  Sifariş Ver
                </a>
              </div>
            </div>
          </div>

          {/* Details Tabs */}
          <div className="border-t border-pink-50 p-8 md:p-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div>
                <h3 className="text-2xl font-black text-gray-900 mb-6">Məhsul Haqqında</h3>
                <p className="text-gray-500 leading-relaxed">{product.description}</p>
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900 mb-6">Tərkibi</h3>
                <p className="text-gray-500 leading-relaxed">{product.ingredients}</p>
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900 mb-6">İstifadə Qaydası</h3>
                <p className="text-gray-500 leading-relaxed">{product.usage}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;