import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, ArrowLeft, Sparkles, ChevronRight, Loader, Plus, Check } from 'lucide-react';
import apiClient from '../utils/axios';
import { useNotification } from '../contexts/NotificationContext';

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
  const { showSuccess, showError, showInfo } = useNotification();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);

  // Cart & button states
  const [cartItems, setCartItems] = useState([]);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showSuccessIcon, setShowSuccessIcon] = useState(false);

  // Get clean base product name without any variant info
  const getBaseProductName = () => {
    if (!product) return '';
    return product.name.replace(/,\s*tonu\s*".*?"/g, '').trim();
  };

  // Get clean variant name without base product info
  const getCleanVariantName = (variant) => {
    if (!variant) return '';
    const variantName = variant.name;
    
    // Try to extract just the variant name if it includes base product and ", tonu ..."
    // Handle both double quotes " and single quotes '
    const match = variantName.match(/tonu\s*['"](.*?)['"]/);
    if (match && match[1]) {
      return match[1];
    }
    
    // If no match, return as is
    return variantName;
  };

  // Get current images: use variant variantImage + commonImages, with backward compatibility
  const currentImages = product ? (() => {
    const variantImg = selectedVariant?.variantImage || selectedVariant?.image;
    const commonImgs = product.commonImages?.length > 0 ? product.commonImages : product.images;
    
    if (selectedVariant) {
      if (variantImg) {
        return [variantImg, ...commonImgs].filter(Boolean);
      } else {
        return commonImgs.filter(Boolean);
      }
    } else {
      return commonImgs.filter(Boolean);
    }
  })() : [];

  // Get current sku: use variant sku if available, else product sku
  const currentSku = product ? (selectedVariant?.sku || product.sku) : '';

  // Check if current variant/stock is out of stock
  const isOutOfStock = product ? (selectedVariant 
    ? (selectedVariant.stock <= 0 || selectedVariant.status === 'out_of_stock' || selectedVariant.status === 'passive')
    : (product.status === 'out_of_stock' || product.status === 'passive')) : true;

  // Check if product/variant is already in cart
  const isProductInCart = (productId, variantSku = null) => {
    return cartItems.some(item => {
      const itemProductId = item.product?._id || item.productId;
      const matchesProduct = itemProductId === productId;
      const matchesVariant = !variantSku || item.variantSku === variantSku;
      return matchesProduct && matchesVariant;
    });
  };

  // Fetch cart items
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

  useEffect(() => {
    fetchProduct();
    checkIfFavorite();
    fetchCart();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await apiClient.get(`/api/products/${id}`);
      const productData = response.data;
      setProduct(productData);
      // Set initial selected variant to first active variant if available
      if (productData.variants && productData.variants.length > 0) {
        const firstActiveVariant = productData.variants.find(v => v.status === 'active');
        setSelectedVariant(firstActiveVariant || productData.variants[0]);
      } else {
        setSelectedVariant(null);
      }
      fetchRelatedProducts(productData);
    } catch (error) {
      showError('Məhsul tapılmadı');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async (currentProduct) => {
    try {
      const response = await apiClient.get('/api/products');
      let products = response.data.filter(p => p._id !== currentProduct._id && p.status !== 'passive');
      
      // Sort products by priority:
      // 1. Same seriesSlug
      // 2. Same childCategorySlug
      // 3. Same subCategorySlug
      // 4. Same categorySlug
      // 5. Others
      const sortedProducts = [...products].sort((a, b) => {
        const getPriority = (p) => {
          if (p.seriesSlug && currentProduct.seriesSlug && p.seriesSlug === currentProduct.seriesSlug) return 1;
          if (p.childCategorySlug && currentProduct.childCategorySlug && p.childCategorySlug === currentProduct.childCategorySlug) return 2;
          if (p.subCategorySlug && currentProduct.subCategorySlug && p.subCategorySlug === currentProduct.subCategorySlug) return 3;
          if (p.categorySlug && currentProduct.categorySlug && p.categorySlug === currentProduct.categorySlug) return 4;
          return 5;
        };
        return getPriority(a) - getPriority(b);
      });
      
      setRelatedProducts(sortedProducts.slice(0, 8));
    } catch (error) {
      console.error('Fetch related products error:', error);
    }
  };

  const checkIfFavorite = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await apiClient.get('/api/users/favorites', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsFavorite(response.data.favorites.some(f => (f._id || f).toString() === id));
    } catch (error) {
      console.error('Check favorite error:', error);
    }
  };

  const handleAction = async (action) => {
    if (action === 'cart' && isOutOfStock) {
      showError('Bu məhsul artıq mövcud deyil');
      return;
    }
    
    const token = localStorage.getItem('token');
    if (!token) {
      showInfo('Bu əməliyyat üçün daxil olmalısınız.');
      navigate('/login');
      return;
    }

    try {
      if (action === 'cart') {
        setIsAddingToCart(true);
        await apiClient.post('/api/users/cart/add', 
          { 
            productId: id, 
            quantity: 1,
            variantSku: selectedVariant?.sku,
            variantName: selectedVariant?.name
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        // Show success icon and refetch cart
        setShowSuccessIcon(true);
        fetchCart();
        
        // Hide success icon after 1 second
        setTimeout(() => {
          setShowSuccessIcon(false);
        }, 1000);
      } else if (action === 'favorite') {
        const response = await apiClient.post('/api/users/favorites/toggle', 
          { productId: id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const liked = response.data.favorites.includes(id.toString());
        setIsFavorite(liked);
        showSuccess(liked ? 'Seçilmişlərə əlavə edildi' : 'Seçilmişlərdən silindi');
      }
    } catch (error) {
      console.error('Cart add error:', error.response?.data || error.message);
      const errorMsg = error.response?.data?.error || 'Xəta baş verdi';
      showError(errorMsg);
    } finally {
      if (action === 'cart') {
        setIsAddingToCart(false);
      }
    }
  };

  const calculateDiscount = () => {
    if (!product) return 0;
    if (product.discountPercent > 0) return product.discountPercent;
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
        <div className="grid grid-cols-1 lg:grid-cols-[90px_560px_1fr] gap-[32px] items-start max-w-[1400px] mx-auto">
          {/* Left Column: Thumbnail Gallery */}
          <div className="order-2 lg:order-1 flex lg:flex-col gap-[12px] overflow-x-auto lg:overflow-y-auto lg:max-h-[520px] pb-2 lg:pb-0">
            {currentImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(idx)}
                className={`flex-shrink-0 w-[78px] h-[78px] rounded-[10px] border-2 transition-all overflow-hidden bg-gray-50 hover:border-pink-300 ${
                  activeImage === idx ? 'border-pink-600' : 'border-gray-200'
                }`}
              >
                <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-contain p-1" />
              </button>
            ))}
          </div>

          {/* Center Column: Main Image */}
          <div className="order-1 lg:order-2 w-full overflow-hidden product-main-image-container" style={{ height: '380px', maxHeight: '380px' }}>
            <img
              src={currentImages[activeImage]}
              alt={product.name}
              className="product-main-image w-full h-full object-contain object-center select-none"
              style={{ width: '100%', height: '380px', objectFit: 'contain', objectPosition: 'center' }}
              draggable={false}
            />
          </div>

          {/* Desktop Styles */}
          <style>{`
            @media (min-width: 1024px) {
              .product-main-image-container {
                width: 520px !important;
                height: 520px !important;
                max-height: 520px !important;
              }
              .product-main-image-container img {
                width: 520px !important;
                height: 520px !important;
              }
            }
          `}</style>

          {/* Right Column: Product Info */}
          <div className="order-3 space-y-6">
            {/* Product Title */}
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-snug mb-2">
                {selectedVariant ? `${getBaseProductName()}, tonu "${getCleanVariantName(selectedVariant)}"` : getBaseProductName()}
              </h1>
            </div>

            {/* Product Meta Info */}
      <div className="space-y-3 text-sm">
        {(product.seriesName || product.collection) && (
          <div className="flex items-center gap-2">
            <span className="text-gray-500 font-medium w-20">Seriya:</span>
            <Link 
              to={`/products?series=${product.seriesSlug || ''}`} 
              className="text-pink-600 hover:text-pink-700 font-semibold transition-colors"
            >
              {product.seriesName || product.collection}
            </Link>
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="text-gray-500 font-medium w-20">Artikul:</span>
          <span className="text-gray-900 font-mono">{currentSku}</span>
        </div>
        {selectedVariant && (
          <div className="flex items-center gap-2">
            <span className="text-gray-500 font-medium w-20">Variant:</span>
            <span className="text-gray-900 font-semibold">{getCleanVariantName(selectedVariant)}</span>
          </div>
        )}
        {(selectedVariant?.weight?.value || product.weight?.value) && (
          <div className="flex items-center gap-2">
            <span className="text-gray-500 font-medium w-20">Çəki:</span>
            <span className="text-gray-900">{(selectedVariant?.weight?.value || product.weight?.value)} {(selectedVariant?.weight?.unit || product.weight?.unit)}</span>
          </div>
        )}
        {(selectedVariant?.volume?.value || product.volume?.value) && (
          <div className="flex items-center gap-2">
            <span className="text-gray-500 font-medium w-20">Həcm:</span>
            <span className="text-gray-900">{(selectedVariant?.volume?.value || product.volume?.value)} {(selectedVariant?.volume?.unit || product.volume?.unit)}</span>
          </div>
        )}
      </div>

            {/* Variants Selector */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-gray-900">Çalar seçin</h3>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant, idx) => {
                    const isActive = variant.status === 'active' && variant.stock > 0;
                    const isSelected = selectedVariant?.sku === variant.sku;
                    return (
                      <button
                        key={variant.sku || idx}
                        onClick={() => {
                          setSelectedVariant(variant);
                          setActiveImage(0);
                        }}
                        disabled={!isActive}
                        className={`
                          relative flex items-center justify-center
                          w-14 h-14 rounded-xl border-2 transition-all
                          ${isSelected ? 'border-pink-600 ring-2 ring-pink-200' : 'border-gray-200'}
                          ${!isActive ? 'opacity-40 cursor-not-allowed' : 'hover:border-pink-300 cursor-pointer'}
                        `}
                      >
                        {variant.variantImage || variant.image ? (
                          <img src={variant.variantImage || variant.image} alt={getCleanVariantName(variant)} className="w-full h-full object-contain p-1 rounded-xl" />
                        ) : (
                          <span className="text-xs font-medium text-gray-600">{getCleanVariantName(variant).slice(0, 3)}</span>
                        )}
                        {!isActive && (
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-200/60 rounded-xl">
                            <span className="text-[10px] text-gray-500 font-bold">Tükəndib</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Short Description Preview */}
            {product.description && (
              <div className="text-sm text-gray-700 line-clamp-3">
                {product.description.split('\n').filter(line => line.trim() !== '')[0]}
              </div>
            )}

            {/* Price Card */}
            <div className="bg-white rounded-2xl p-5 border border-gray-200">
              {/* Price Display */}
              <div className="mb-6">
                <div className="flex items-baseline gap-3 mb-3">
                  {discountPercent > 0 && (
                    <span className="px-3 py-1 bg-pink-100 text-pink-600 text-sm font-bold rounded-lg">
                      -%{discountPercent}
                    </span>
                  )}
                  <div className="bg-pink-600 px-4 py-2 rounded-lg">
                    <span className="text-3xl font-extrabold text-white">{formatPrice(product.price_sale)}</span>
                  </div>
                </div>
                {discountPercent > 0 && (
                  <div className="text-xl text-gray-400 line-through font-medium">
                    {formatPrice(product.price_catalog)}
                  </div>
                )}
              </div>

              {/* Add to Cart & Favorite */}
              <div className="flex gap-3">
                {isOutOfStock ? (
                  <button 
                    disabled
                    className="flex-1 py-4 bg-gray-200 text-gray-500 font-bold rounded-xl cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <ShoppingCart size={20} />
                    Stokda yoxdur
                  </button>
                ) : (
                  <button 
                    onClick={() => handleAction('cart')}
                    disabled={isAddingToCart}
                    className="flex-1 py-4 bg-[#0F52BA] text-white font-bold rounded-xl hover:bg-[#0A3D8A] transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    {isAddingToCart ? (
                      <Loader size={20} className="animate-spin" />
                    ) : showSuccessIcon ? (
                      <Check size={20} />
                    ) : isProductInCart(id, selectedVariant?.sku) ? (
                      <><Plus size={20} /> Daha çox əlavə et</>
                    ) : (
                      <><ShoppingCart size={20} /> Səbətə</>
                    )}
                  </button>
                )}
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

              {/* Product Trust Indicators */}
              <div className="mt-6 flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  {!isOutOfStock ? (
                    <>
                      <div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center">
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                      </div>
                      <span>Stokda var</span>
                    </>
                  ) : (
                    <>
                      <div className="w-5 h-5 rounded-full bg-orange-50 flex items-center justify-center">
                        <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                      </div>
                      <span>Stokda yoxdur</span>
                    </>
                  )}
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
                    <ExpandableText text={(selectedVariant?.description?.trim() ? selectedVariant.description : product.description)} maxHeight={220} />
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
                          <Link 
                            to={`/products?series=${product.seriesSlug || ''}`} 
                            className="text-pink-600 hover:text-pink-700 font-medium transition-colors"
                          >
                            {product.seriesName || product.collection}
                          </Link>
                        </div>
                      )}
                      {(selectedVariant?.weight?.value || product.weight?.value) && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Çəki</span>
                          <span className="text-gray-900 font-medium">{(selectedVariant?.weight?.value || product.weight?.value)} {(selectedVariant?.weight?.unit || product.weight?.unit)}</span>
                        </div>
                      )}
                      {(selectedVariant?.volume?.value || product.volume?.value) && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Həcm</span>
                          <span className="text-gray-900 font-medium">{(selectedVariant?.volume?.value || product.volume?.value)} {(selectedVariant?.volume?.unit || product.volume?.unit)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'ingredients' && (
              <div className="max-w-3xl">
                <ExpandableText text={(selectedVariant?.ingredients?.trim() ? selectedVariant.ingredients : product.ingredients)} maxHeight={220} />
              </div>
            )}
            {activeTab === 'usage' && (
              <div className="max-w-3xl">
                <ExpandableText text={(selectedVariant?.usage?.trim() ? selectedVariant.usage : product.usage)} maxHeight={220} />
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
