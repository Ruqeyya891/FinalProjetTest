import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../utils/axios';
import { Heart, Loader, Plus, Search, Filter, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';

const productTypes = [
  "2-si 1-də şampun-balzam", "2-si 1-də şampun-duş geli", "Akne əleyhinə lokal krem",
  "Antiperspirantlar", "Ayaqlar üçün balzam", "Ayaqlar üçün gel",
  "Ayaqlar üçün keratolitik gel", "Ayaqlar üçün krem", "BB-krem",
  "Bezlər", "Boya", "Büst üçün krem", "Bədən skrabı", "Bədən südü",
  "Bədən üçün aromatik su", "Bədən üçün balzam", "Bədən üçün gel",
  "Bədən üçün krem", "Bədən üçün krem-mum", "Bədən üçün mist",
  "Bəyazladıcı qələm", "Bəyazladıcı zolaqlar", "Depilyasiya kremi",
  "Depliyasiya üçün mum zolaqlar", "Dezodorant", "Dezodorant-antiperspirant",
  "Diş fırçası", "Diş məcunu", "Diş sapı", "Diş çöpü",
  "Dişlərin ağardılması üçün gel", "Dodaq balzamı", "Dodaq parıltısı",
  "Duş gel-skrabı", "Duş geli", "Enzimli kirşan", "Filler", "Gecə kremi",
  "Gel/maye", "Göz qapaqları üçün gel", "Göz qapaqları üçün krem",
  "Gündüz geli", "Gündüz kremi", "Hidrofil gel-yağ", "Hidrofil yağ",
  "İksir", "İntim gigiyena geli", "Kisə", "Krem-sprey",
  "Makiyajı silmək üçün iki fazalı vasitə", "Maye sabun", "Misellyar su",
  "Nəmləndirici salfetlər", "Ot yığımları", "Patçlar", "Pilinq-disklər",
  "Qaş və kipriklər üçün zərdab", "Qulluqedici vasitələr", "Quru şampun",
  "Salfetlər", "Sarğılar üçün krem", "Saç balzamı", "Saç köpüyü",
  "Saç lakı", "Saç maskası", "Saç misti", "Saç spreyi", "Saç zərdabı",
  "Saçlar üçün ampullu konsentrat", "Saçlar üçün aromatik su", "Sprey",
  "Stik", "Sərt sabun", "Trimmer", "Təmizləyici zolaqlar", "Təraş köpüyü",
  "Təraş sonrası balzam", "Təraş sonrası losyon", "Uşaqlara üçün bez altı krem",
  "Vanna duzu", "Vanna köpüyü", "Yumşaldıcı", "Yağ", "Yuyunma geli",
  "Yuyunma köpüyü", "Yuyunma üçün süd", "Ülçü", "Üz maskası",
  "Üz üçün balzam", "Üz üçün gel-cilalama", "Üz üçün losyon", "Üz üçün mist",
  "Üz üçün pilinq", "Üz üçün pilinq-cilalama", "Üz üçün skrab", "Üz üçün toner",
  "Üz üçün tonik", "Üz üçün zərdab", "Şampun", "Əllər üçün krem",
  "Əllər üçün skrab", "Спрей для полости рта", "СС-krem"
];

const formatPrice = (price) => {
  return `${parseFloat(price).toFixed(2)} ₼`;
};

const SeriesDetail = () => {
  const { seriesSlug } = useParams();
  const [series, setSeries] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [loadingProductIds, setLoadingProductIds] = useState(new Set());
  const [successProductIds, setSuccessProductIds] = useState(new Set());
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const navigate = useNavigate();
  const { showSuccess, showError, showInfo } = useNotification();

  // Filters state
  const [activeFilters, setActiveFilters] = useState({
    isInStock: false,
    isSuperPrice: false,
    isHit: false,
    productType: '',
    minPrice: '',
    maxPrice: ''
  });

  useEffect(() => {
    fetchSeries();
    fetchProducts();
    fetchFavorites();
    fetchCart();
  }, [seriesSlug]);

  const fetchSeries = async () => {
    try {
      const response = await apiClient.get(`/api/series/${seriesSlug}`);
      setSeries(response.data);
    } catch (error) {
      console.error('Series fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const params = { series: seriesSlug };
      const response = await apiClient.get('/api/products', { params });
      setProducts(response.data);
    } catch (error) {
      console.error('Products fetch error:', error);
    }
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
    setLoadingProductIds(prev => new Set(prev).add(productId));
    try {
      const payload = { 
        productId, 
        quantity: 1,
        ...(variantSku && { variantSku })
      };
      const response = await apiClient.post('/api/users/cart/add', 
        payload,
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

  const filteredProducts = products.filter(product => {
    if (product.status === 'passive') return false;

    if (activeFilters.isInStock && product.status === 'out_of_stock') return false;
    if (activeFilters.isSuperPrice && !product.isDiscount && !product.isPromotion && product.discountPercent <= 0) return false;
    if (activeFilters.isHit && !product.isHit) return false;
    if (activeFilters.productType && product.productType !== activeFilters.productType) return false;

    const minPrice = activeFilters.minPrice ? parseFloat(activeFilters.minPrice) : 0;
    const maxPrice = activeFilters.maxPrice ? parseFloat(activeFilters.maxPrice) : Infinity;
    const productPrice = parseFloat(product.price_sale);
    if (productPrice < minPrice || productPrice > maxPrice) return false;

    return true;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center">
        <Loader size={40} className="animate-spin text-pink-600" />
      </div>
    );
  }

  if (!series) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Seriya tapılmadı</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 min-h-screen">
      <div className="max-w-[1280px] mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-8">
          <Link to="/" className="hover:text-pink-600 transition-colors">Baş</Link>
          <span className="mx-2">/</span>
          <Link to="/products" className="hover:text-pink-600 transition-colors">Seriyalar</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 dark:text-gray-100 font-medium">{series.name}</span>
        </nav>

        {/* Hero Section - Premium Layout */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_400px] gap-6 mb-12">
          {/* Banner */}
          <div className="h-[420px] md:h-[420px] rounded-[16px] overflow-hidden">
            {series.bannerImage ? (
              <img 
                src={series.bannerImage} 
                alt={series.name}
                className="w-full h-full object-cover object-center"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-pink-200 to-purple-200 dark:from-pink-900/30 dark:to-purple-900/30 flex items-center justify-center">
                {series.logo && <img src={series.logo} alt={series.name} className="h-32 object-contain" />}
              </div>
            )}
          </div>

          {/* Right Info Card */}
          <div className="h-[420px] md:h-[420px] bg-[#f8fafc] dark:bg-slate-800 rounded-[16px] p-8 flex flex-col justify-center">
            <h1 className="text-[28px] font-bold text-gray-900 dark:text-gray-100 mb-4">{series.name}</h1>
            {series.description && (
              <p className="text-[15px] text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                {series.description}
              </p>
            )}
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-500 dark:text-gray-400">
                {filteredProducts.length} məhsul
              </span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                series.status === 'active' 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
              }`}>
                {series.status === 'active' ? 'Aktiv' : 'Passiv'}
              </span>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div>
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <Link 
                  to={`/product/${product._id}`}
                  key={product._id} 
                  className="block bg-white dark:bg-slate-800 rounded-[16px] border border-gray-100 dark:border-slate-700 overflow-hidden hover:border-pink-200 dark:hover:border-pink-900/50 transition-all group"
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
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {product.discountPercent > 0 || product.isDiscount || product.isPromotion ? (
                      <div className="absolute top-3 left-3 bg-pink-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                        {product.discountPercent > 0 ? `-${product.discountPercent}%` : (product.isDiscount ? 'Endirim' : 'Aksiya')}
                      </div>
                    ) : null}
                    {product.isHit && (
                      <div className="absolute top-3 left-3 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                        HIT
                      </div>
                    )}
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleFavorite(product._id);
                      }} 
                      className={`absolute top-3 right-3 p-1.5 rounded-full transition-all ${
                        favorites.includes(product._id.toString()) 
                          ? 'bg-pink-600 text-white' 
                          : 'bg-white dark:bg-slate-700 text-gray-400 dark:text-gray-500 hover:text-pink-600'
                      }`}
                    >
                      <Heart 
                        size={16} 
                        fill={favorites.includes(product._id.toString()) ? "currentColor" : "none"} 
                      />
                    </button>
                  </div>
                  
                  <div className="p-5">
                    <div className="text-[10px] text-pink-600 font-semibold mb-1.5 uppercase tracking-wider">
                      {product.sku}
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-2.5 line-clamp-2 group-hover:text-pink-600 transition-colors">{product.name}</h3>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-pink-50 dark:border-slate-700">
                      <div>
                        {product.price_catalog !== product.price_sale && product.price_catalog > 0 && (
                          <div className="text-gray-400 text-[10px] line-through">{formatPrice(product.price_catalog)}</div>
                        )}
                        <div className="text-lg font-extrabold text-pink-600">{formatPrice(product.price_sale)}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4">
                      {product.status === 'out_of_stock' ? (
                        <button 
                          disabled
                          className="px-3 py-2 bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400 font-bold text-xs rounded-lg cursor-not-allowed transition-all"
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
                          className="px-3 py-2 bg-pink-50 dark:bg-pink-900/30 text-pink-600 font-bold text-xs rounded-lg hover:bg-pink-600 hover:text-white transition-all flex items-center justify-center gap-1"
                        >
                          {loadingProductIds.has(product._id) ? (
                            <Loader size={14} className="animate-spin" />
                          ) : successProductIds.has(product._id) ? (
                            <Plus size={14} />
                          ) : isProductInCart(product._id) ? (
                            <><Plus size={14} /> Daha çox</>
                          ) : (
                            'Səbətə'
                          )}
                        </button>
                      )}
                      <button
                        className="text-xs text-gray-500 dark:text-gray-400 hover:text-pink-600 font-medium transition-colors"
                      >
                        Ətraflı
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center bg-[#f8fafc] dark:bg-slate-800 rounded-[16px] border border-gray-100 dark:border-slate-700">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-600 mb-4">
                <Search size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Bu seriyada məhsul tapılmadı</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SeriesDetail;
