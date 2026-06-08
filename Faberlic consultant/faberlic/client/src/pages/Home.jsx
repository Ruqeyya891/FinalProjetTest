import { ArrowRight, Bot, ShoppingBag, UserPlus, Sparkles, MessageCircle, ChevronLeft, ChevronRight, Heart, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

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

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const navigate = useNavigate();
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
    fetchFavorites();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/api/products');
      setProducts(response.data.slice(0, 8)); // Show first 8 products
    } catch (error) {
      console.error('Product fetch error:', error);
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
      toast.info('Bu əməliyyat üçün daxil olmalısınız.');
      navigate('/login');
      return;
    }

    try {
      const response = await axios.post('http://127.0.0.1:5000/api/users/favorites/toggle', 
        { productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update favorites state - now we get string ids directly
      const newFavorites = response.data.favorites;
      setFavorites(newFavorites);
      
      const isNowFavorite = newFavorites.includes(productId.toString());
      toast.success(isNowFavorite ? 'Məhsul seçilmişlərə əlavə edildi!' : 'Məhsul seçilmişlərdən silindi!');
    } catch (error) {
      toast.error('Xəta baş verdi');
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
      console.log('Adding to cart (Home):', payload);
      const response = await axios.post('http://127.0.0.1:5000/api/users/cart/add', 
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Add to cart response:', response.data);
      toast.success('Məhsul səbətə əlavə edildi!');
    } catch (error) {
      console.error('Add to cart error:', error.response?.data || error.message);
      toast.error(error.response?.data?.error || 'Xəta baş verdi');
    }
  };

  const filteredProducts = products.filter((product) => {
    const q = searchTerm?.toLowerCase().trim();
    if (!q) return true;

    return (
      product.name?.toLowerCase().includes(q) ||
      product.sku?.toString().toLowerCase().includes(q) ||
      product.article?.toString().toLowerCase().includes(q) ||
      product.artikul?.toString().toLowerCase().includes(q)
    );
  });

  console.log("searchTerm:", searchTerm);
  console.log("filteredProducts:", filteredProducts);

  return (
    <div className="bg-pink-50 min-h-screen">
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
                <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
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
          className="absolute top-1/2 left-4 -translate-y-1/2 bg-white text-gray-800 p-2 rounded-full shadow-lg hover:bg-pink-50 transition-all z-10"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={nextSlide}
          className="absolute top-1/2 right-4 -translate-y-1/2 bg-white text-gray-800 p-2 rounded-full shadow-lg hover:bg-pink-50 transition-all z-10"
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
          <h2 className="text-3xl font-bold text-gray-900">Məhsullar</h2>
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
                className="block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all group"
              >
                <div className="relative aspect-square overflow-hidden bg-pink-50">
                  <img 
                    src={product.images?.[0] || product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {product.isDiscount || product.isPromotion ? (
                    <div className="absolute top-2 left-2 md:top-4 md:left-4 bg-pink-600 text-white px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-bold">
                      {product.isDiscount ? 'Endirim' : 'Aksiya'}
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
                        : 'bg-white text-gray-400 hover:text-pink-600'
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
                  <h3 className="text-sm md:text-lg font-bold text-gray-900 mb-2 md:mb-3 line-clamp-2 group-hover:text-pink-600 transition-colors">{product.name}</h3>
                  
                  <div className="flex items-center justify-between pt-2 md:pt-4 border-t border-pink-50">
                    <div>
                      {product.price_catalog !== product.price_sale && (
                        <div className="text-gray-400 text-[10px] md:text-xs line-through">{product.price_catalog} AZN</div>
                      )}
                      <div className="text-lg md:text-xl font-extrabold text-pink-600">{product.price_sale} AZN</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3">
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        addToCart(product);
                      }} 
                      className="px-3 md:px-5 py-1.5 md:py-2.5 bg-pink-50 text-pink-600 font-bold text-xs md:text-sm rounded-xl hover:bg-pink-600 hover:text-white transition-all"
                    >
                      Səbətə
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      className="text-xs md:text-sm text-gray-500 hover:text-pink-600 font-medium transition-colors"
                    >
                      Ətraflı
                    </button>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-100 text-pink-600 mb-4">
                <Search size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Məhsul tapılmadı</h3>
              <p className="text-gray-500">Axtardığınız meyarlara uyğun məhsul yoxdur.</p>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Niyə Bizi Seçməlisiniz?</h2>
          <p className="mt-4 text-gray-500 max-w-2xl mx-auto">Biz sizə sadəcə kosmetika deyil, fərdi qulluq təcrübəsi təqdim edirik.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-pink-100 hover:shadow-md transition-all">
            <div className="w-14 h-14 bg-pink-100 text-pink-600 rounded-xl flex items-center justify-center mb-6">
              <Bot size={28} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Ağıllı AI Məsləhətçi</h3>
            <p className="text-gray-500 leading-relaxed">Dərinizin fotosunu yükləyin, AI onu analiz etsin və sizə ən uyğun məhsulları seçsin.</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-pink-100 hover:shadow-md transition-all">
            <div className="w-14 h-14 bg-pink-100 text-pink-600 rounded-xl flex items-center justify-center mb-6">
              <Sparkles size={28} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Eksklüziv Endirimlər</h3>
            <p className="text-gray-500 leading-relaxed">Kataloq qiymətindən daha ucuz! Qeydiyyatdan keçərək 20% endirim əldə edin.</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-pink-100 hover:shadow-md transition-all">
            <div className="w-14 h-14 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-6">
              <UserPlus size={28} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Xanımlar Üçün Qeydiyyat</h3>
            <p className="text-gray-500 leading-relaxed">Komandama qoşulun, Faberlikin rəsmi saytında qeydiyyatdan keçin və qazanın.</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-pink-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-8">İndi Hərəkətə Keçin!</h2>
          <div className="flex flex-wrap justify-center gap-6">
            <a href="https://wa.me/994519848659" target="_blank" className="px-8 py-4 bg-white text-pink-600 font-bold rounded-xl hover:bg-pink-50 transition-all shadow-xl flex items-center gap-2">
              <MessageCircle size="24" className="text-green-600" />
              WhatsApp ilə Yazın
            </a>
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
