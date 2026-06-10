import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, ArrowLeft, Sparkles, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';

// Helper function to format price
const formatPrice = (price) => {
  return `${parseFloat(price).toFixed(2)} ₼`;
};

// Helper component for expandable text with max-height
const ExpandableText = ({ text, maxHeight = 220 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [needsExpansion, setNeedsExpansion] = useState(false);
  const contentRef = useState(null); // We'll use a ref to check height

  if (!text) return <p className="text-gray-500 italic">Məlumat əlavə edilməyib</p>;

  // Split text into lines
  const lines = text.split('\n').filter(line => line.trim() !== '');

  // We'll use a ref and useEffect to check if content exceeds max height
  const containerRef = React.useRef(null);

  useEffect(() => {
    const checkHeight = () => {
      if (containerRef.current) {
        // Temporarily set overflow to visible to check full height
        containerRef.current.style.maxHeight = 'none';
        const actualHeight = containerRef.current.scrollHeight;
        containerRef.current.style.maxHeight = isExpanded ? 'none' : `${maxHeight}px`;
        setNeedsExpansion(actualHeight > maxHeight);
      }
    };

    checkHeight();
    // Also check on window resize for responsiveness
    window.addEventListener('resize', checkHeight);
    return () => window.removeEventListener('resize', checkHeight);
  }, [text, maxHeight, isExpanded]);

  return (
    <div className="space-y-3">
      <div
        ref={containerRef}
        className={`text-gray-700 leading-relaxed transition-all duration-300 ${
          isExpanded ? '' : `product-description-content`
        }`}
        style={!isExpanded ? { maxHeight: `${maxHeight}px`, overflow: 'hidden', position: 'relative' } : {}}
      >
        {lines.map((line, index) => (
          <p key={index} className="mb-2 last:mb-0">{line}</p>
        ))}
        {!isExpanded && needsExpansion && (
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent" />
        )}
      </div>
      {needsExpansion && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-pink-600 font-semibold text-sm hover:text-pink-700 transition-colors"
        >
          {isExpanded ? 'Daha az göstər' : 'Daha çox göstər'}
        </button>
      )}
    </div>
  );
};

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  const [relatedProducts, setRelatedProducts] = useState([]);

  const images = product?.images?.length > 0 ? product.images : [product?.image];

  useEffect(() => {
    fetchProduct();
    checkIfFavorite();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:5000/api/products/${id}`);
      const productData = response.data;
      setProduct(productData);
      fetchRelatedProducts(productData);
    } catch (error) {
      toast.error('Məhsul tapılmadı');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async (currentProduct) => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/api/products');
      let products = response.data.filter(p => p._id !== currentProduct._id);
      
      // First try to find products from same series
      const seriesProducts = products.filter(p => 
        (p.seriesSlug && currentProduct.seriesSlug && p.seriesSlug === currentProduct.seriesSlug) ||
        (p.collection && currentProduct.collection && p.collection === currentProduct.collection)
      );
      
      if (seriesProducts.length > 0) {
        setRelatedProducts(seriesProducts.slice(0, 8));
      } else {
        // If no series products, try same category or subcategory
        const categoryProducts = products.filter(p => 
          (p.categorySlug && currentProduct.categorySlug && p.categorySlug === currentProduct.categorySlug) ||
          (p.subCategorySlug && currentProduct.subCategorySlug && p.subCategorySlug === currentProduct.subCategorySlug)
        );
        setRelatedProducts(categoryProducts.slice(0, 8));
      }
    } catch (error) {
      console.error('Fetch related products error:', error);
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
      console.error('Cart add error:', error.response?.data || error.message);
      const errorMsg = error.response?.data?.error || 'Xəta baş verdi';
      toast.error(errorMsg);
    }
  };

  const calculateDiscount = () => {
    if (!product) return 0;
    if (product.price_catalog <= 0 || product.price_catalog <= product.price_sale) return 0;
    const diff = product.price_catalog - product.price_sale;
    return Math.round((diff / product.price_catalog) * 100);
  };

  const discountPercent = calculateDiscount();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-12 h-12 border-4 border-pink-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center text-xs sm:text-sm mb-6">
          <Link to="/" className="text-gray-600 hover:text-pink-600 transition-colors">Baş</Link>
          <ChevronRight size={14} className="mx-2 text-gray-300" />
          <Link to="/products" className="text-gray-600 hover:text-pink-600 transition-colors">Məhsullar</Link>
          {product.categorySlug && (
            <>
              <ChevronRight size={14} className="mx-2 text-gray-300" />
              <span className="text-gray-600 hover:text-pink-600 transition-colors">
                {product.categoryName}
              </span>
            </>
          )}
          <ChevronRight size={14} className="mx-2 text-gray-300" />
          <span className="text-gray-900 font-medium truncate">{product.name}</span>
        </nav>

        {/* Main Content - 3 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[80px_1fr_360px] gap-4 lg:gap-8 items-start">
          {/* Left Column: Thumbnail Gallery */}
          {images.length > 1 && (
            <div className="order-2 lg:order-1 flex lg:flex-col gap-2 lg:gap-3 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`flex-shrink-0 w-16 h-16 lg:w-20 lg:h-20 rounded-xl border-2 transition-all overflow-hidden bg-gray-50 hover:border-pink-300 ${
                    activeImage === idx ? 'border-pink-600 ring-2 ring-pink-100' : 'border-gray-100'
                  }`}
                >
                  <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-contain p-1.5" />
                </button>
              ))}
            </div>
          )}

          {/* Center Column: Main Image */}
          <div className="order-1 lg:order-2">
            <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-center" style={{ minHeight: '500px' }}>
              <img
                src={images[activeImage]}
                alt={product.name}
                className="object-contain max-h-[480px] max-w-full select-none"
                draggable={false}
              />
            </div>
          </div>

          {/* Right Column: Product Info */}
          <div className="order-3">
            <div className="space-y-5">
              {/* Product Title */}
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-snug mb-2">{product.name}</h1>
              </div>

              {/* Product Meta Info */}
              <div className="space-y-2 text-sm">
                {(product.seriesName || product.collection) && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 font-medium w-16">Seriya:</span>
                    <span className="text-gray-900 font-semibold">{product.seriesName || product.collection}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 font-medium w-16">Artikul:</span>
                  <span className="text-gray-900 font-mono">{product.sku}</span>
                </div>
                {product.weight?.value && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 font-medium w-16">Çəki:</span>
                    <span className="text-gray-900">{product.weight.value} {product.weight.unit}</span>
                  </div>
                )}
                {product.volume?.value && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 font-medium w-16">Həcm:</span>
                    <span className="text-gray-900">{product.volume.value} {product.volume.unit}</span>
                  </div>
                )}
              </div>

              {/* Price Card */}
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                {/* Price Display */}
                <div className="mb-5">
                  <div className="flex items-baseline gap-3 mb-2">
                    {discountPercent > 0 && (
                      <span className="px-3 py-1 bg-red-50 text-red-600 text-sm font-bold rounded-lg">
                        -%{discountPercent}
                      </span>
                    )}
                    <span className="text-3xl font-extrabold text-pink-600">{formatPrice(product.price_sale)}</span>
                    {discountPercent > 0 && (
                      <span className="text-lg text-gray-400 line-through font-medium">{formatPrice(product.price_catalog)}</span>
                    )}
                  </div>
                </div>

                {/* Add to Cart & Favorite */}
                <div className="flex gap-3">
                  <button 
                    onClick={() => handleAction('cart')}
                    className="flex-1 py-4 bg-pink-600 text-white font-bold rounded-xl hover:bg-pink-700 transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <ShoppingCart size={20} />
                    Səbətə Əlavə Et
                  </button>
                  <button 
                    onClick={() => handleAction('favorite')}
                    className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all border ${
                      isFavorite 
                        ? 'bg-pink-600 border-pink-600 text-white' 
                        : 'bg-white border-gray-200 text-gray-400 hover:border-pink-300 hover:text-pink-600'
                    }`}
                  >
                    <Heart size={22} fill={isFavorite ? 'currentColor' : 'none'} />
                  </button>
                </div>
              </div>

              {/* Product Trust Indicators */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                  </div>
                  <span>Stokda var</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  </div>
                  <span>Orijinal məhsul</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Section (Tabs) */}
        <div className="mt-8 lg:mt-10">
          <div className="flex border-b border-gray-100 mb-5 gap-1 overflow-x-auto scrollbar-hide">
            {[
              { id: 'description', label: 'Məhsul haqqında' },
              { id: 'ingredients', label: 'Tərkibi' },
              { id: 'usage', label: 'Tətbiq qaydası' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-0 mr-6 py-3 text-sm font-semibold transition-all whitespace-nowrap relative ${
                  activeTab === tab.id
                    ? 'text-pink-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-pink-600" />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="pb-4">
            {activeTab === 'description' && (
              <div className="max-w-3xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="md:col-span-2">
                    <ExpandableText text={product.description} maxHeight={220} />
                  </div>
                  
                  {/* Product Specifications */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-3">Xüsusiyyətlər</h3>
                    <div className="space-y-2.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Kateqoriya</span>
                        <span className="text-gray-900 font-medium">{product.categoryName}</span>
                      </div>
                      {product.subCategoryName && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Alt Kateqoriya</span>
                          <span className="text-gray-900 font-medium">{product.subCategoryName}</span>
                        </div>
                      )}
                      {(product.seriesName || product.collection) && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Seriya</span>
                          <span className="text-gray-900 font-medium">{product.seriesName || product.collection}</span>
                        </div>
                      )}
                      {product.weight?.value && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Çəki</span>
                          <span className="text-gray-900 font-medium">{product.weight.value} {product.weight.unit}</span>
                        </div>
                      )}
                      {product.volume?.value && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Həcm</span>
                          <span className="text-gray-900 font-medium">{product.volume.value} {product.volume.unit}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'ingredients' && (
              <div className="max-w-3xl">
                <ExpandableText text={product.ingredients} maxHeight={220} />
              </div>
            )}
            {activeTab === 'usage' && (
              <div className="max-w-3xl">
                <ExpandableText text={product.usage} maxHeight={220} />
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-100">
            <h2 className="text-lg lg:text-xl font-bold text-gray-900 mb-5">Bu məhsulla alırlar</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 lg:gap-5">
              {relatedProducts.map((product) => (
                <Link
                  key={product._id}
                  to={`/product/${product._id}`}
                  className="block bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="relative aspect-square overflow-hidden bg-gray-50">
                    <img
                      src={product.images?.[0] || product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-[10px] text-gray-400 font-semibold mb-1 uppercase tracking-wider">
                      {product.sku}
                    </p>
                    <h3 className="text-xs font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-pink-600 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-base font-extrabold text-pink-600">
                      {formatPrice(product.price_sale)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
