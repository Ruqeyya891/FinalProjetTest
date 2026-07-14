import { ArrowRight, Bot, ShoppingBag, UserPlus, Sparkles, MessageCircle, ChevronLeft, ChevronRight, Heart, Search, Sparkles as SparklesIcon, Palette, User, Baby, Droplets, Scissors, Star, Loader, Plus, Check } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Autoplay, Navigation, FreeMode } from 'swiper/modules';
import { Link } from 'react-router-dom';
import { useState, useEffect, useCallback, useRef } from 'react';
import apiClient from '../utils/axios';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';

const Home = ({ searchTerm = "" }) => {
  // All images from public/images folder
  const slides = [
    { 
      id: 1, 
      image: '/images/heroimage.png', 
      alt: 'Faberlic Hero'
    },
    { 
      id: 2, 
      image: '/images/hairimage.png', 
      alt: 'Faberlic Hair Products'
    },
    { 
      id: 3, 
      image: '/images/parfum.png', 
      alt: 'Faberlic Perfume'
    },
    { 
      id: 4, 
      image: '/images/umooglam.png', 
      title: 'Umoo Glam', 
      alt: 'Umoo Glam',
      link: '/products' 
    },
  ];

  // Cart & button states
  const [cartItems, setCartItems] = useState([]);
  const [loadingProductIds, setLoadingProductIds] = useState(new Set());
  const [successProductIds, setSuccessProductIds] = useState(new Set());

  // Category data
  const categories = [
    { 
      id: 1, 
      name: 'Üz Qulluğu', 
      mainCategorySlug: 'qulluq',
      subCategorySlug: 'uze-qulluq',
      icon: <Palette size={32} />, 
      color: 'bg-pink-100 text-pink-600' 
    },
    { 
      id: 2, 
      name: 'Makiyaj', 
      mainCategorySlug: 'makiyaj',
      subCategorySlug: null,
      icon: <SparklesIcon size={32} />, 
      color: 'bg-purple-100 text-purple-600' 
    },
    { 
      id: 3, 
      name: 'Parfümeriya', 
      mainCategorySlug: 'parfümeriya',
      subCategorySlug: null,
      icon: <Star size={32} />, 
      color: 'bg-yellow-100 text-yellow-600' 
    },
    { 
      id: 4, 
      name: 'Saç Qulluğu', 
      mainCategorySlug: 'qulluq',
      subCategorySlug: 'saclar',
      icon: <Scissors size={32} />, 
      color: 'bg-blue-100 text-blue-600' 
    },
    { 
      id: 5, 
      name: 'Bədən Qulluğu', 
      mainCategorySlug: 'qulluq',
      subCategorySlug: 'badene-qulluq',
      icon: <Droplets size={32} />, 
      color: 'bg-green-100 text-green-600' 
    },
    { 
      id: 6, 
      name: 'Uşaqlar üçün', 
      mainCategorySlug: 'usaqlara',
      subCategorySlug: null,
      icon: <Baby size={32} />, 
      color: 'bg-orange-100 text-orange-600' 
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [allProducts, setAllProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [popularSeries, setPopularSeries] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const navigate = useNavigate();
  const { showSuccess, showError, showInfo } = useNotification();
  const imgRefs = useRef([]);

  // Auto-slide every 3 seconds
  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000); // Change slide every 5 seconds
    return () => clearInterval(interval);
  }, [nextSlide]);

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  useEffect(() => {
    fetchProducts();
    fetchPopularSeries();
    fetchFavorites();
    fetchCart();
  }, []);

  const shuffleArray = (array) => {
    return [...array].sort(() => Math.random() - 0.5);
  };

  const fetchProducts = async () => {
    try {
      const response = await apiClient.get('/api/products');
      const allProds = response.data;
      setAllProducts(allProds);
      
      // Filter active products and shuffle
      const activeProducts = allProds.filter(p => p.status !== 'passive');
      const shuffledProducts = shuffleArray(activeProducts);
      setProducts(shuffledProducts.slice(0, 8));
    } catch (error) {
      console.error('Product fetch error:', error);
    }
  };

  const fetchPopularSeries = async () => {
    try {
      const response = await apiClient.get('/api/series/popular');
      setPopularSeries(response.data);
    } catch (error) {
      console.error('Popular series fetch error:', error);
    }
  };

  // Calculate product count for each category
  const getProductCount = (mainCategorySlug, subCategorySlug) => {
    return allProducts.filter(product => {
      // Check if product has categories array with matching slugs
      if (product.categories && Array.isArray(product.categories)) {
        return product.categories.some(cat => {
          const matchesMain = cat.categorySlug === mainCategorySlug;
          const matchesSub = !subCategorySlug || cat.subCategorySlug === subCategorySlug;
          return matchesMain && matchesSub;
        });
      }
      // Fallback to old single category fields
      const matchesMain = product.categorySlug === mainCategorySlug;
      const matchesSub = !subCategorySlug || product.subCategorySlug === subCategorySlug;
      return matchesMain && matchesSub;
    }).length;
  };

  const fetchFavorites = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await apiClient.get('/api/users/favorites', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const favoriteIds = response.data.favorites.map(fav => 
        (typeof fav === 'object' ? fav._id : fav).toString()
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
      const response = await apiClient.post('/api/users/favorites/toggle', 
        { productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update favorites state - now we get string ids directly
      const newFavorites = response.data.favorites;
      setFavorites(newFavorites);
      
      const isNowFavorite = newFavorites.includes(productId.toString());
      showSuccess(isNowFavorite ? 'Məhsul seçilmişlərə əlavə edildi!' : 'Məhsul seçilmişlərdən silindi!');
    } catch (error) {
      showError('Xəta baş verdi');
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

  const addToCart = async (product, variantSku = null) => {
    const productId = product._id || product.id;
    
    if (product.status === 'passive' || product.status === 'out_of_stock') {
      showError('Bu məhsul artıq mövcud deyil');
      return;
    }
    
    const token = localStorage.getItem('token');
    if (!token) {
      showInfo('Bu əməliyyat üçün daxil olmalısınız.');
      navigate('/login');
      return;
    }

    // Set loading state
    setLoadingProductIds(prev => new Set(prev).add(productId));
    
    try {
      const payload = { 
        productId, 
        quantity: 1,
        ...(variantSku && { variantSku })
      };
      console.log('Adding to cart (Home):', payload);
      const response = await apiClient.post('/api/users/cart/add', 
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Add to cart response:', response.data);
      
      // Update success state and refetch cart
      setSuccessProductIds(prev => new Set(prev).add(productId));
      fetchCart();
      
      // Remove success state after 1 second
      setTimeout(() => {
        setSuccessProductIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
      }, 1000);
    } catch (error) {
      console.error('Add to cart error:', error.response?.data || error.message);
      showError(error.response?.data?.error || 'Xəta baş verdi');
    } finally {
      setLoadingProductIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  // Filter out passive products on Home page
  const filteredProducts = products.filter(product => product.status !== 'passive');


  return (
    <div className="bg-pink-50 dark:bg-slate-900 min-h-screen">
      {/* Hero Slider Section */}
      <div className="max-w-[1200px] h-[200px] sm:h-[300px] md:h-[390px] mx-auto my-4 mb-8 relative overflow-hidden rounded-[12px]">
        {/* Slides */}
        <div 
          className="flex transition-transform duration-700 ease-out h-full"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <div key={slide.id} className="min-w-full h-full relative">
              {/* Skeleton Loader */}
              {isLoading && (
                <div className="absolute inset-0 bg-gray-200 dark:bg-slate-700 animate-pulse"></div>
              )}
              
              {/* Slide Image */}
              {slide.link ? (
                <Link to={slide.link}>
                  <img 
                    ref={(el) => (imgRefs.current[index] = el)}
                    src={slide.image} 
                    alt={slide.alt || slide.title} 
                    className="w-full h-full object-cover object-center cursor-pointer"
                    loading="lazy"
                    onLoad={handleImageLoad}
                  />
                  {slide.title && (
                    <div className="absolute bottom-10 left-10 z-20 hidden md:block">
                      <h2 className="text-3xl font-bold text-white bg-black/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                        {slide.title}
                      </h2>
                    </div>
                  )}
                </Link>
              ) : (
                <>
                  <img 
                    ref={(el) => (imgRefs.current[index] = el)}
                    src={slide.image} 
                    alt={slide.alt} 
                    className="w-full h-full object-cover object-center"
                    loading="lazy"
                    onLoad={handleImageLoad}
                  />
                  {slide.title && (
                    <div className="absolute bottom-10 left-10 z-20 hidden md:block">
                      <h2 className="text-3xl font-bold text-white bg-black/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                        {slide.title}
                      </h2>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute top-1/2 left-4 -translate-y-1/2 bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200 p-2 rounded-full shadow-lg hover:bg-pink-50 dark:hover:bg-slate-700 transition-all z-10"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={nextSlide}
          className="absolute top-1/2 right-4 -translate-y-1/2 bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200 p-2 rounded-full shadow-lg hover:bg-pink-50 dark:hover:bg-slate-700 transition-all z-10"
        >
          <ChevronRight size={20} />
        </button>

        {/* Dots Indicator - Bottom Left */}
        <div className="absolute bottom-4 left-4 flex gap-2 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                currentIndex === index ? 'bg-pink-600 w-6' : 'bg-white/70 hover:bg-white'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Products Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Məhsullar</h2>
          <Link to="/products" className="text-pink-600 font-semibold hover:text-pink-700 flex items-center gap-2">
            Hamısına Bax
            <ArrowRight size={18} />
          </Link>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <Link 
                to={`/product/${product._id}`}
                key={product._id} 
                className="block bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-all group"
              >
                <div className="relative aspect-square overflow-hidden bg-pink-50 dark:bg-slate-700">
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
                  {product.discountPercent > 0 || product.isDiscount || product.isPromotion ? (
                    <div className="absolute top-2 left-2 md:top-4 md:left-4 bg-pink-600 text-white px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-bold">
                      {product.discountPercent > 0 ? `-${product.discountPercent}%` : (product.isDiscount ? 'Endirim' : 'Aksiya')}
                    </div>
                  ) : null}
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleFavorite(product._id);
                    }} 
                    className={`absolute top-2 right-2 md:top-4 md:right-4 p-1.5 md:p-2 rounded-full shadow-md transition-all ${
                      favorites.includes(product._id.toString()) 
                        ? 'bg-pink-600 text-white' 
                        : 'bg-white dark:bg-slate-700 text-gray-400 dark:text-gray-500 hover:text-pink-600'
                    }`}
                  >
                    <Heart 
                      size={18} 
                      fill={favorites.includes(product._id.toString()) ? "currentColor" : "none"} 
                    />
                  </button>
                </div>
                
                <div className="p-3 md:p-6">
                  <div className="text-[10px] md:text-xs text-pink-600 font-semibold mb-1 md:mb-2 uppercase tracking-wider">
                    {product.sku}
                  </div>
                  <h3 className="text-sm md:text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 md:mb-3 line-clamp-2 group-hover:text-pink-600 transition-colors">{product.name}</h3>
                  
                  <div className="flex items-center justify-between pt-2 md:pt-4 border-t border-pink-50 dark:border-slate-700">
                    <div>
                      {product.price_catalog !== product.price_sale && (
                        <div className="text-gray-400 dark:text-gray-500 text-[10px] md:text-xs line-through">{product.price_catalog} AZN</div>
                      )}
                      <div className="text-lg md:text-xl font-extrabold text-pink-600">{product.price_sale} AZN</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3">
                    {product.status === 'out_of_stock' ? (
                      <button 
                        disabled
                        className="px-3 md:px-5 py-1.5 md:py-2.5 bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400 font-bold text-xs md:text-sm rounded-xl cursor-not-allowed transition-all flex items-center gap-1"
                      >
                        Stokda yoxdur
                      </button>
                    ) : (
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          addToCart(product);
                        }} 
                        disabled={loadingProductIds.has(product._id)}
                        className="px-3 md:px-5 py-1.5 md:py-2.5 bg-pink-50 dark:bg-pink-900/30 text-pink-600 font-bold text-xs md:text-sm rounded-xl hover:bg-pink-600 hover:text-white transition-all flex items-center justify-center gap-1"
                      >
                        {loadingProductIds.has(product._id) ? (
                          <Loader size={14} className="animate-spin" />
                        ) : successProductIds.has(product._id) ? (
                          <Check size={14} />
                        ) : isProductInCart(product._id) ? (
                          <><Plus size={14} /> Daha çox əlavə et</>
                        ) : (
                          'Səbətə'
                        )}
                      </button>
                    )}
                    <button
                      className="text-xs md:text-sm text-gray-500 dark:text-gray-400 hover:text-pink-600 font-medium transition-colors"
                    >
                      Ətraflı
                    </button>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-600 mb-4">
                <Search size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Məhsul tapılmadı</h3>
              <p className="text-gray-500 dark:text-gray-400">Axtardığınız meyarlara uyğun məhsul yoxdur.</p>
            </div>
          )}
        </div>
      </div>

      {/* Popular Series Section */}
      {popularSeries.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Populyar Seriyalar</h2>
            <Link to="/products" className="text-pink-600 font-semibold hover:text-pink-700 flex items-center gap-2">
              Hamısına Bax
              <ArrowRight size={18} />
            </Link>
          </div>
          
          <Swiper
            modules={[Autoplay, Navigation, FreeMode]}
            spaceBetween={24}
            slidesPerView={2}
            grabCursor={true}
            loop={true}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true
            }}
            freeMode={true}
            navigation={true}
            breakpoints={{
              640: {
                slidesPerView: 3
              },
              768: {
                slidesPerView: 4
              },
              1024: {
                slidesPerView: 6
              }
            }}
          >
            {popularSeries.map((series) => (
              <SwiperSlide key={series._id}>
                <Link
                  to={`/series/${series.slug}`}
                  className="group"
                >
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-lg transition-all text-center group-hover:border-pink-200 dark:group-hover:border-pink-800 flex items-center justify-center min-h-[140px]">
                    {series.logo ? (
                      <img 
                        src={series.logo} 
                        alt={series.name}
                        className="h-16 object-contain"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-pink-600">
                        <Sparkles size={32} />
                      </div>
                    )}
                  </div>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}

      {/* CTA Section */}
      <div className="bg-pink-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-8">İndi Hərəkətə Keçin!</h2>
          <div className="flex flex-wrap justify-center gap-6">
            <Link to="/register" className="px-8 py-4 bg-pink-800 text-white font-bold rounded-xl hover:bg-pink-900 transition-all shadow-xl flex items-center gap-2">
              Qeydiyyatdan Keçin
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
