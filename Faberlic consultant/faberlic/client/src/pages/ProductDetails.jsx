import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, ShieldCheck, Truck, ArrowLeft, Star, MessageCircle, Instagram, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';

// Helper function to format price
const formatPrice = (price) => {
  return `${parseFloat(price).toFixed(2)} ₼`;
};

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState('description');

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
      setIsFavorite(response.data.favorites.some(f => (f._id || f).toString() === id));
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
        const liked = response.data.favorites.includes(id.toString());
        setIsFavorite(liked);
        toast.success(liked ? 'Seçilmişlərə əlavə edildi' : 'Seçilmişlərdən silindi');
      }
    } catch (error) {
      toast.error('Xəta baş verdi');
    }
  };

  const calculateDiscount = () => {
    if (!product) return 0;
    const diff = product.price_catalog - product.price_sale;
    return Math.round((diff / product.price_catalog) * 100);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#fff5fa]">
      <div className="w-12 h-12 border-4 border-[#e6005c] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const images = [product.image, ...(product.images || [])].filter(Boolean);

  return (
    <div className="bg-[#fff5fa] min-h-screen py-6">
      <div className="max-w-[1000px] mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center text-xs mb-6">
          <Link to="/" className="text-[#1f2a56] hover:text-[#e6005c] transition-colors">Baş</Link>
          <ChevronRight size={12} className="mx-1.5 text-gray-400" />
          <Link to="/products" className="text-[#1f2a56] hover:text-[#e6005c] transition-colors">Məhsullar</Link>
          <ChevronRight size={12} className="mx-1.5 text-gray-400" />
          <span className="text-gray-500 truncate">{product.name}</span>
        </nav>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[100px_450px_380px] gap-6 items-start">
          {/* Thumbnails - Left Column */}
          <div className="order-2 lg:order-1 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(idx)}
                className={`flex-shrink-0 w-20 h-20 rounded-xl border-2 transition-all overflow-hidden bg-white ${
                  activeImage === idx ? 'border-[#e6005c]' : 'border-[#f2d6e3] hover:border-[#e6005c]'
                }`}
              >
                <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-contain p-2" />
              </button>
            ))}
          </div>

          {/* Main Image - Center Column */}
          <div className="order-1 lg:order-2">
            <div className="bg-white rounded-2xl border border-[#f2d6e3] p-3 flex items-center justify-center" style={{ height: '450px' }}>
              <img
                src={images[activeImage]}
                alt={product.name}
                className="object-contain max-h-[420px] max-w-full"
              />
            </div>
          </div>

          {/* Right Column - Info */}
          <div className="order-3">
            <div className="bg-white rounded-2xl border border-[#f2d6e3] p-5">
              <div className="flex items-start justify-between mb-4">
                <span className="px-2.5 py-1 bg-pink-100 text-[#e6005c] text-[11px] font-bold rounded-full uppercase tracking-wider">
                  {product.category}
                </span>
                <button 
                  onClick={() => handleAction('favorite')}
                  className={`p-2 rounded-full transition-all ${isFavorite ? 'bg-[#e6005c] text-white' : 'bg-[#fff5fa] text-gray-400 hover:text-[#e6005c]'}`}
                >
                  <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
                </button>
              </div>

              <h1 className="text-xl font-bold text-[#1f2a56] mb-3 leading-snug line-clamp-2">{product.name}</h1>

              {/* Price Section - Right after title */}
              <div className="mb-4">
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-2xl font-black text-[#e6005c]">{formatPrice(product.price_sale)}</span>
                  {product.price_catalog !== product.price_sale && product.price_catalog > 0 && (
                    <>
                      <span className="text-base text-gray-400 line-through font-semibold">{formatPrice(product.price_catalog)}</span>
                      {calculateDiscount() > 0 && (
                        <span className="px-2 py-0.5 bg-[#e6005c] text-white text-[11px] font-bold rounded-full">
                          -%{calculateDiscount()}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Add to Cart - Right after price */}
              <div className="mb-5">
                <button 
                  onClick={() => handleAction('cart')}
                  className="w-full py-3.5 bg-[#e6005c] text-white font-bold rounded-xl hover:bg-[#c5004d] transition-all shadow-lg shadow-[#e6005c]/20 flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={18} />
                  Səbətə Əlavə Et
                </button>
              </div>

              {/* Product Meta */}
              <div className="space-y-2.5 mb-4 pb-4 border-b border-[#f2d6e3]">
                {product.collection && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-gray-500 w-16">Seriya:</span>
                    <span className="font-semibold text-[#1f2a56]">{product.collection}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-500 w-16">Artikul:</span>
                  <span className="font-semibold text-[#1f2a56]">{product.sku}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-500 w-16">Çəki:</span>
                  <span className="font-semibold text-[#1f2a56]">100 gr</span>
                </div>
              </div>

              {/* Bullet List */}
              <div className="mb-4">
                <ul className="space-y-1.5 text-xs text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-[#e6005c] mt-0.5">•</span>
                    <span>100% orijinal Faberlik məhsulu</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#e6005c] mt-0.5">•</span>
                    <span>Dəri ilə uyğunluğu test edilmişdir</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#e6005c] mt-0.5">•</span>
                    <span>Paraben və sulfate tərkibində yoxdur</span>
                  </li>
                </ul>
              </div>

              {/* Reviews & Trust Badges */}
              <div className="flex items-center justify-between pt-4 border-t border-[#f2d6e3]">
                <div className="flex items-center gap-3">
                  <div className="flex items-center text-yellow-400">
                    <Star size={14} fill="currentColor" />
                    <Star size={14} fill="currentColor" />
                    <Star size={14} fill="currentColor" />
                    <Star size={14} fill="currentColor" />
                    <Star size={14} fill="currentColor" />
                  </div>
                  <span className="text-gray-500 text-xs font-semibold">(124 rəy)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <ShieldCheck size={14} className="text-[#e6005c]" />
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <Truck size={14} className="text-[#e6005c]" />
                  </div>
                </div>
              </div>
            </div>

            {/* WhatsApp Button */}
            <a 
              href="https://wa.me/994519848659" 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-3 w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-600/20 flex items-center justify-center gap-2"
            >
              <MessageCircle size={18} />
              Sifariş Ver
            </a>
          </div>
        </div>

        {/* Additional Details with Tabs */}
        <div className="mt-8 bg-white rounded-2xl border border-[#f2d6e3] overflow-hidden">
          {/* Tab Headers */}
          <div className="flex border-b border-[#f2d6e3]">
            <button
              onClick={() => setActiveTab('description')}
              className={`px-6 py-4 text-sm font-semibold transition-all ${
                activeTab === 'description'
                  ? 'text-[#e6005c] border-b-2 border-[#e6005c]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Məhsul Haqqında
            </button>
            <button
              onClick={() => setActiveTab('ingredients')}
              className={`px-6 py-4 text-sm font-semibold transition-all ${
                activeTab === 'ingredients'
                  ? 'text-[#e6005c] border-b-2 border-[#e6005c]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Tərkibi
            </button>
            <button
              onClick={() => setActiveTab('usage')}
              className={`px-6 py-4 text-sm font-semibold transition-all ${
                activeTab === 'usage'
                  ? 'text-[#e6005c] border-b-2 border-[#e6005c]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              İstifadə Qaydası
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'description' && (
              <p className="text-sm text-gray-600 leading-relaxed">
                {product.description || 'Məhsul haqqında məlumat əlavə ediləcək.'}
              </p>
            )}
            {activeTab === 'ingredients' && (
              <p className="text-sm text-gray-600 leading-relaxed">
                {product.ingredients || 'Tərkib məlumatı təqdim ediləcək.'}
              </p>
            )}
            {activeTab === 'usage' && (
              <p className="text-sm text-gray-600 leading-relaxed">
                {product.usage || 'İstifadə qaydası məlumatı təqdim ediləcək.'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
