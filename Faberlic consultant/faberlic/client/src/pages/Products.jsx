import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, Info, Sparkles, Filter, ChevronRight, Heart, Home, X } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { categories as categoryData } from '../utils/categories';

const collections = [
  "24K Pure Gold", "8 Element", "Activity", "Aromania", "Alatau", "Blonde Icon",
  "Bon Journey", "Botanica", "Bubble White", "Coco Rituals", "Collagen", "Collagen O2",
  "Deline", "Desirable", "Donna & Uomo Felice", "Dose of Nature", "Eden Garden",
  "Expert", "Expert Hair", "Expert Pharma", "Faberlic", "Faberlic Home", "Faberlic MEN",
  "Faberlic by Valentin Yudashkin", "First Class", "Firm&Lift", "Fortune",
  "Garderica", "Glam Kitty", "Glam Team", "Grand Prix", "Halal",
  "Home Gnome Greenly", "HyaluronCa", "Hyaluronic Makeup", "I Love Winter",
  "Incognito", "iDeo", "iSeul", "It's Clear", "It's Collagen", "Just Bloom",
  "Kaori", "Kid's Health", "Kurquma", "L.OVE", "La Crème", "Lancelot",
  "Lavender", "Le Carrousel Magique", "Leto", "Love Me Tender", "Lovely Moments",
  "Matrigenic", "Melissa", "Monimasks", "Molecular Force", "Monomasks",
  "Mur Mur", "Nail Care", "Nail Restore", "Nuki", "O Feerique",
  "Oceanum", "Omega", "OmegaHit", "Omegahit", "One Week Miracle",
  "Oriental Soul", "Oxiology", "Oxy Hair", "Peak", "PETTI TAILS",
  "Phyto", "Power of Clean", "Premium", "Prism", "Primo Bacio",
  "Pour Toujours", "Queenship", "Renovage", "RETINOL 24/7", "SA:CURE",
  "Safe Childhood", "Salon Care", "Samba del Rio", "Signum", "Smart",
  "SOS", "Soo-Yun", "Spring Beauty", "Spring Vibes", "Storie d'Amore",
  "Sunzania", "Tavarua", "TeenSkin", "The Best Bro's", "Triple Action with Oxygen",
  "Umooo 0+", "Umooo 3+", "Vent d'Aventures", "Viking & Valkyrie", "Vitamania",
  "Volume & Style", "Wedding Weekend", "Wellness", "Zima", "Zodiac",
  "Legendary Oxygen", "Bee Royal", "Herbal Tea", "Car Care", "Classic",
  "Soft Comfort", "Lace Intimates", "Faberlic Sport", "Bears", "Aromio",
  "Beauty Cafe", "Beauty Cafe Fragrances", "Şərqin ruhu", "Əfsanəvi oksigen"
];

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
  "Nəm salfetlər", "Ot yığımları", "Patçlar", "Pilinq-disklər",
  "Qaş və kipriklər üçün zərdab", "Qulluqedici vasitələr", "Quru şampun",
  "Salfetlər", "Sarğılar üçün krem", "Saç balzamı", "Saç köpüyü",
  "Saç lakı", "Saç maskası", "Saç misti", "Saç spreyi", "Saç zərdabı",
  "Saçlar üçün ampullu konsentrat", "Saçlar üçün aromatik su", "Sprey",
  "Stik", "Sərt sabun", "Trimmer", "Təmizləyici zolaqlar", "Təraş köpüyü",
  "Təraş sonrası balzam", "Təraş sonrası losyon", "Uşaqlar üçün bez altı krem",
  "Vanna duzu", "Vanna köpüyü", "Yaxalayıcı", "Yağ", "Yuyunma geli",
  "Yuyunma köpüyü", "Yuyunma üçün süd", "Ülgüc", "Üz maskası",
  "Üz üçün balzam", "Üz üçün gel-cilalama", "Üz üçün losyon", "Üz üçün mist",
  "Üz üçün pilinq", "Üz üçün pilinq-cilalama", "Üz üçün skrab", "Üz üçün toner",
  "Üz üçün tonik", "Üz üçün zərdab", "Şampun", "Əllər üçün krem",
  "Əllər üçün skrab", "Спрей для полости рта", "СС-krem"
];

const productEffects = [
  "0+ kateqoriyası", "Akneyə qarşı", "Aromatizasiya",
  "Arzuolunmaz tüklərin götürülməsi", "Ağız boşluğunun təmizlənməsi",
  "Bütün ailə üçün", "Bədənə və saçlara qulluq", "bərpa", "Bərpaetmə",
  "Canlandırma", "Cilalama", "Depilyasiya/təraş",
  "Diş ərpi və diş daşı əleyhinə", "Diş ətinə qulluq", "Dişlərin ağardılması",
  "Dolğunlaşdırma", "Dərindən təmizləmə", "Dərinin möhkəmlənməsi üçün",
  "Elastiklik üçün", "Günəşdən qoruma", "Həcm", "Həsass dişlərə qulluq üçün",
  "İntim zonaların bəyazladılması", "Kariyesdən qoruma",
  "Kariyesin profilaktikası", "Kompleksli qulluq", "Konsionerləşdirmə",
  "Kəpəyə qarşı", "Liftinq", "Makiyajın çıxarılması",
  "Mikrofloranın normallaşdırılması", "Minanın möhkəmləndirilməsi və bərpası",
  "Möhkəmləndirmə", "Möhkəmləndirmə və diş əti sağlamlığı", "Nəfəs təravəti",
  "Nəmləndirmə", "Parıltı", "Pilinq", "Piqmentasiyaya qarşı",
  "Qara nöqtələrə qarşı", "Qaş və kirpiklərin böyüməsi üçün",
  "Qıcıqlanmaya qarşı", "Qidalandırma", "Qırışlar", "Qoxuların götürülməsi",
  "Rəngin qorunması", "Sarılığın neytrallaşdırılması", "Saçlara intensiv qulluq",
  "Saçların böyüməsi", "Saçların tökülməsinə qarşı", "Sellülit əleyhinə",
  "Staylinq", "Sürtünmədən qoruma", "Tualet üçün", "Tünd dairələrə qarşı",
  "Təmizləmə", "Tər qoxusundan qoruma", "Tər qoxusunun neytrallaşdırılması",
  "Tərləmənin bloklanması", "Vanna və duş vasitələri", "Vanna üçün",
  "Varikoza qarşı", "Yağlılığa qarşı", "Yaşlanma əleyhinə qulluq",
  "Yumşaldıcı effekt", "Çaların bərabərləşməsi", "Çat və döyənəklərə qarşı",
  "Çatlara qarşı", "Şaxtadan qoruma", "Əzələlər və oynaqlar üçün"
];

const skinTypes = [
  "Bütün tiplər", "Həssas", "Normal", "Problemli",
  "Qarışıq", "Quru", "Susuzlaşdırılmış", "Yağlılıq", "Yetkin"
];

const hairTypes = [
  "Boyanmış", "Bütün tiplər", "Nazik", "Normal", "Zədəlilər"
];

// Helper function to format price
const formatPrice = (price) => {
  return `${parseFloat(price).toFixed(2)} ₼`;
};

const normalize = (str) => 
  str?.toLowerCase() 
    .replaceAll("ə", "e") 
    .replaceAll("ü", "u") 
    .replaceAll("ö", "o") 
    .replaceAll("ğ", "g") 
    .replaceAll("ı", "i") 
    .replaceAll("ş", "s") 
    .replaceAll("ç", "c") 
    .replace(/\s+/g, "-");

const Products = ({ searchTerm }) => {
  // ALL HOOKS MUST BE AT THE TOP - NO CONDITIONAL BEFORE THEM!
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Filters state
  const [activeFilters, setActiveFilters] = useState({
    isInStock: false,
    isSuperPrice: false,
    isNew: false,
    isDiscount: false,
    isPromotion: false,
    isHit: false,
    collection: '',
    productType: '',
    productEffect: '',
    skinType: '',
    hairType: '',
    minPrice: '',
    maxPrice: ''
  });

  const mainCategorySlug = searchParams.get('category');
  const subCategorySlug = searchParams.get('subcategory');
  const childCategorySlug = searchParams.get('childCategory');

  // Find current category objects
  const currentMainCategory = categoryData.find(c => c.slug === mainCategorySlug);
  const currentSubCategory = currentMainCategory?.subCategories.find(sc => sc.slug === subCategorySlug);

  useEffect(() => {
    fetchProducts();
    fetchFavorites();
  }, [mainCategorySlug, subCategorySlug, childCategorySlug, activeFilters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {};
      
      // Use slugs for filtering
      if (childCategorySlug) params.childCategory = childCategorySlug;
      else if (subCategorySlug) params.subcategory = subCategorySlug;
      else if (mainCategorySlug) params.category = mainCategorySlug;

      // Add all other filters
      if (activeFilters.isInStock) params.isInStock = true;
      if (activeFilters.isSuperPrice) params.isSuperPrice = true;
      if (activeFilters.isNew) params.isNew = true;
      if (activeFilters.isDiscount) params.isDiscount = true;
      if (activeFilters.isPromotion) params.isPromotion = true;
      if (activeFilters.isHit) params.isHit = true;
      if (activeFilters.collection) params.collection = activeFilters.collection;
      if (activeFilters.productType) params.productType = activeFilters.productType;
      if (activeFilters.productEffect) params.productEffect = activeFilters.productEffect;
      if (activeFilters.skinType) params.skinType = activeFilters.skinType;
      if (activeFilters.hairType) params.hairType = activeFilters.hairType;
      if (activeFilters.minPrice) params.minPrice = activeFilters.minPrice;
      if (activeFilters.maxPrice) params.maxPrice = activeFilters.maxPrice;

      const response = await axios.get('http://127.0.0.1:5000/api/products', { params });
      setProducts(response.data);
    } catch (error) {
      console.error('Fetch products error:', error);
      toast.error('Məhsulları yükləyərkən xəta baş verdi');
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
      setFavorites(response.data.favorites.map(f => (f._id || f).toString()));
    } catch (error) {
      console.error('Fetch favorites error:', error);
    }
  };

  const handleAction = async (e, action, product) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      toast.info('Bu əməliyyat üçün daxil olmalısınız.');
      navigate('/login');
      return;
    }

    try {
      if (action === 'cart') {
        const payload = { productId: product._id || product.id, quantity: 1 };
        console.log('Adding to cart payload:', payload);
        const response = await axios.post('http://127.0.0.1:5000/api/users/cart/add', 
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('Add to cart response:', response.data);
        toast.success('Məhsul səbətə əlavə edildi!');
      } else if (action === 'favorite') {
        const response = await axios.post('http://127.0.0.1:5000/api/users/favorites/toggle', 
          { productId: product._id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setFavorites(response.data.favorites);
        const isLiked = response.data.favorites.includes(product._id.toString());
        toast.success(isLiked ? 'Seçilmişlərə əlavə edildi' : 'Seçilmişlərdən silindi');
      } else if (action === 'order') {
        // Redirect to a quick order or cart page
        navigate('/cart');
      }
    } catch (error) {
      console.error(error.response?.data || error.message);
      const errorMsg = error.response?.data?.error || 'Xəta baş verdi';
      toast.error(errorMsg);
    }
  };

  const filteredProducts = products.filter(product => {
    // 1. Search term filter
    const q = searchTerm?.toLowerCase().trim();
    const matchesSearch = !q || (
      product.name?.toLowerCase().includes(q) || 
      product.sku?.toString().toLowerCase().includes(q) || 
      product.article?.toString().toLowerCase().includes(q) ||
      product.artikul?.toString().toLowerCase().includes(q)
    );

    // 2. Category/Subcategory/ChildCategory filter
    const productCategory = product.categorySlug || normalize(product.category);
    const productSubCategory = product.subCategorySlug || normalize(product.subcategory || product.subCategory);
    const productChildCategory = product.childCategorySlug || normalize(product.childCategory);

    if (mainCategorySlug && productCategory !== mainCategorySlug) return false;
    if (subCategorySlug && productSubCategory !== subCategorySlug) return false;
    if (childCategorySlug && productChildCategory !== childCategorySlug) return false;

    return matchesSearch;
  });

  useEffect(() => {
    if (products.length > 0) {
      console.log("--- FILTER DEBUG START ---");
      console.table(products.map(p => ({ 
        name: p.name, 
        sku: p.sku, 
        categorySlug: p.categorySlug, 
        subCategorySlug: p.subCategorySlug, 
        childCategorySlug: p.childCategorySlug, 
        category: p.category, 
        subcategory: p.subcategory || p.subCategory, 
        childCategory: p.childCategory 
      })));

      const shampoo = products.find(p => 
        p.name?.toLowerCase().includes("şampun") || 
        p.name?.toLowerCase().includes("sampun") || 
        p.sku?.toString() === "10319" 
      );
      console.log("SHAMPOO PRODUCT FOUND:", shampoo);
      
      console.log("URL SLUGS:", { mainCategorySlug, subCategorySlug, childCategorySlug });
      console.log("FILTERED COUNT:", filteredProducts.length);
      console.log("--- FILTER DEBUG END ---");
    }
  }, [mainCategorySlug, subCategorySlug, childCategorySlug, products, filteredProducts, searchTerm]);



  if (loading) return (
    <div className="bg-pink-50/30 min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-pink-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="bg-pink-50/30 min-h-screen pb-20 lg:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        {/* Breadcrumb and Header */}
        <div className="mb-8">
          <nav className="flex items-center text-sm text-gray-500 mb-4">
            <Link to="/" className="flex items-center gap-1 hover:text-pink-600 transition-colors">
              <Home size={14} />
              <span>Baş</span>
            </Link>
            <ChevronRight size={14} className="mx-2" />
            {currentMainCategory && (
              <>
                <span className="text-gray-900 font-medium">{currentMainCategory.name}</span>
                {currentSubCategory && (
                  <>
                    <ChevronRight size={14} className="mx-2" />
                    <span className="text-gray-900 font-medium">{currentSubCategory.name}</span>
                  </>
                )}
              </>
            )}
          </nav>
        </div>

        {/* Main Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="text-pink-600" />
              {currentSubCategory?.name || currentMainCategory?.name || 'Bütün Məhsullar'}
            </h1>
            <p className="text-gray-500 mt-2 text-sm md:text-base">
              {currentMainCategory ? `${currentMainCategory.name} kateqoriyası üzrə məhsullar` : 'Ən keyfiyyətli Faberlik məhsulları sizin üçün seçilib.'}
            </p>
          </div>
          <div className="relative max-w-md w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Məhsul axtar..."
              value={searchTerm}
              onChange={(e) => {
                // We are already using global searchTerm from props
                // If this page's input is used, it should also update the global state
                // Since App.jsx passes setSearchTerm to Navbar, we can't directly call it here
                // but Navbar is always visible. However, for better UX:
                window.dispatchEvent(new CustomEvent('globalSearch', { detail: e.target.value }));
              }}
              className="w-full pl-12 pr-4 py-3 md:py-4 bg-white border border-pink-100 rounded-2xl focus:ring-2 focus:ring-pink-500 focus:border-transparent shadow-sm outline-none transition-all text-sm"
            />
          </div>
        </div>

        {/* Subcategory Buttons (if main category selected) */}
        {currentMainCategory?.subCategories.length > 0 && (
          <div className="mb-8 md:mb-12">
            <div className="flex flex-wrap gap-2 md:gap-3 overflow-x-auto pb-2">
              <button
                onClick={() => {
                  navigate(`/products?category=${mainCategorySlug}`);
                }}
                className={`px-4 md:px-5 py-2 md:py-2.5 rounded-xl font-semibold text-sm transition-all flex-shrink-0 ${
                  !subCategorySlug 
                    ? 'bg-pink-600 text-white shadow-md' 
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-pink-50 hover:text-pink-600'
                }`}
              >
                Hamısı
              </button>
              {currentMainCategory.subCategories.map(subCat => (
                <button
                  key={subCat.slug}
                  onClick={() => {
                    navigate(`/products?category=${mainCategorySlug}&subcategory=${subCat.slug}`);
                  }}
                  className={`px-4 md:px-5 py-2 md:py-2.5 rounded-xl font-semibold text-sm transition-all flex-shrink-0 ${
                    subCategorySlug === subCat.slug
                      ? 'bg-pink-600 text-white shadow-md' 
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-pink-50 hover:text-pink-600'
                  }`}
                >
                  {subCat.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Child Category Buttons (if subcategory selected) */}
        {currentSubCategory?.childCategories.length > 0 && (
          <div className="mb-8 md:mb-12">
            <div className="flex flex-wrap gap-2 md:gap-3 overflow-x-auto pb-2">
              <button
                onClick={() => {
                  navigate(`/products?category=${mainCategorySlug}&subcategory=${subCategorySlug}`);
                }}
                className={`px-3 md:px-4 py-1.5 md:py-2 rounded-xl font-medium text-xs md:text-sm transition-all flex-shrink-0 ${
                  !childCategorySlug 
                    ? 'bg-pink-600 text-white shadow-md' 
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-pink-50 hover:text-pink-600'
                }`}
              >
                Hamısı
              </button>
              {currentSubCategory.childCategories.map(childCat => (
                <button
                  key={childCat.slug}
                  onClick={() => {
                    navigate(`/products?category=${mainCategorySlug}&subcategory=${subCategorySlug}&childCategory=${childCat.slug}`);
                  }}
                  className={`px-3 md:px-4 py-1.5 md:py-2 rounded-xl font-medium text-xs md:text-sm transition-all flex-shrink-0 ${
                    childCategorySlug === childCat.slug
                      ? 'bg-pink-600 text-white shadow-md' 
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-pink-50 hover:text-pink-600'
                  }`}
                >
                  {childCat.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Mobile Filter Button */}
        <div className="lg:hidden flex items-center justify-between mb-6">
          <span className="text-gray-600 text-sm">
            {filteredProducts.length} məhsul tapıldı
          </span>
          <button 
            onClick={() => setMobileFiltersOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 font-semibold shadow-sm"
          >
            <Filter size={18} />
            Filtrlər
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
          {/* Sidebar Filters - Desktop Only */}
          <div className="hidden lg:block w-full lg:w-64 space-y-6">
            {/* Price Range */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-pink-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Qiymət, ₼</h3>
              <div className="grid grid-cols-2 gap-3">
                <input 
                  type="number" 
                  placeholder="0" 
                  value={activeFilters.minPrice} 
                  onChange={(e) => setActiveFilters({...activeFilters, minPrice: e.target.value})} 
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none" 
                />
                <input 
                  type="number" 
                  placeholder="1000" 
                  value={activeFilters.maxPrice} 
                  onChange={(e) => setActiveFilters({...activeFilters, maxPrice: e.target.value})} 
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none" 
                />
              </div>
            </div>

            {/* Seriya */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-pink-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Seriya, Kolleksiya</h3>
              <select 
                value={activeFilters.collection} 
                onChange={(e) => setActiveFilters({...activeFilters, collection: e.target.value})} 
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none text-sm" 
              >
                <option value="">Hamısını seçmək</option>
                {collections.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Məhsul Növü */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-pink-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Məhsulun növü</h3>
              <select 
                value={activeFilters.productType} 
                onChange={(e) => setActiveFilters({...activeFilters, productType: e.target.value})} 
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none text-sm" 
              >
                <option value="">Hamısını seçmək</option>
                {productTypes.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            {/* Məhsul Təsiri */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-pink-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Məhsulun təsiri</h3>
              <select 
                value={activeFilters.productEffect} 
                onChange={(e) => setActiveFilters({...activeFilters, productEffect: e.target.value})} 
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none text-sm" 
              >
                <option value="">Hamısını seçmək</option>
                {productEffects.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            {/* Dərinin Tipi */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-pink-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Dərinin tipi</h3>
              <select 
                value={activeFilters.skinType} 
                onChange={(e) => setActiveFilters({...activeFilters, skinType: e.target.value})} 
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none text-sm" 
              >
                <option value="">Hamısını seçmək</option>
                {skinTypes.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Saçların Tipi */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-pink-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Saçın tipi</h3>
              <select 
                value={activeFilters.hairType} 
                onChange={(e) => setActiveFilters({...activeFilters, hairType: e.target.value})} 
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none text-sm" 
              >
                <option value="">Hamısını seçmək</option>
                {hairTypes.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>

            <div className="bg-gradient-to-br from-pink-600 to-pink-700 p-6 rounded-2xl shadow-lg text-white">
              <h3 className="text-lg font-bold mb-4">20% Endirim Alın!</h3>
              <p className="text-pink-100 text-sm mb-4 leading-relaxed">
                Rəsmi Faberlik qeydiyyatından keçərək bütün məhsullarda 20% endirim əldə edə bilərsiniz.
              </p>
              <button className="w-full py-3 bg-white text-pink-600 font-bold rounded-xl hover:bg-pink-50 transition-all shadow-md">
                İndi Qeydiyyatdan Keç
              </button>
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-8">
                {filteredProducts.map(product => (
                  <Link 
                    to={`/product/${product._id}`}
                    key={product._id} 
                    className="block bg-white rounded-2xl shadow-sm border border-pink-100 overflow-hidden group hover:shadow-xl transition-all duration-300"
                  >
                    <div className="relative aspect-square overflow-hidden bg-pink-50">
                      <img 
                        src={product.images?.[0] || product.image} 
                        alt={product.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      {product.isNewProduct && (
                        <div className="absolute top-2 left-2 md:top-4 md:left-4 bg-pink-600 text-white text-xs font-bold px-2 md:px-3 py-1 md:py-1.5 rounded-full shadow-lg">
                          YENİ
                        </div>
                      )}
                      
                      {/* Favorite Button */}
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleAction(e, 'favorite', product);
                        }}
                        className={`absolute top-2 right-2 md:top-4 md:right-4 p-1.5 md:p-2 rounded-full shadow-md transition-all ${
                          favorites.includes(product._id.toString()) 
                            ? 'bg-pink-600 text-white' 
                            : 'bg-white text-gray-400 hover:text-pink-600'
                        }`}
                      >
                        <Heart size={16} fill={favorites.includes(product._id.toString()) ? "currentColor" : "none"} />
                      </button>
                    </div>
                    <div className="p-3 md:p-6">
                      <div className="text-[10px] md:text-xs text-pink-600 font-semibold mb-1 md:mb-2 uppercase tracking-wider">
                        {product.sku}
                      </div>
                      <h3 className="text-sm md:text-lg font-bold text-gray-900 mb-2 md:mb-3 group-hover:text-pink-600 transition-colors line-clamp-2">{product.name}</h3>
                      
                      <div className="flex items-center justify-between pt-2 md:pt-4 border-t border-pink-50">
                        <div>
                          {product.price_catalog !== product.price_sale && product.price_catalog > 0 && (
                            <div className="text-gray-400 text-[10px] md:text-xs line-through">{formatPrice(product.price_catalog)}</div>
                          )}
                          <div className="text-lg md:text-xl font-extrabold text-pink-600">{formatPrice(product.price_sale)}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3">
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleAction(e, 'cart', product);
                          }}
                          className="px-3 md:px-5 py-1.5 md:py-2.5 bg-pink-50 text-pink-600 font-bold text-xs md:text-sm rounded-xl hover:bg-pink-600 hover:text-white transition-all"
                        >
                          Səbətə
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            // The card is already a link, so no need to navigate here, but we prevent default/propagation
                          }}
                          className="text-xs md:text-sm text-gray-500 hover:text-pink-600 font-medium transition-colors"
                        >
                          Ətraflı
                        </button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-20 text-center border-2 border-dashed border-pink-200">
                <Search size={64} className="mx-auto text-pink-200 mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Məhsul tapılmadı</h3>
                <p className="text-gray-500">Axtardığınız meyarlara uyğun məhsul yoxdur. Zəhmət olmasa başqa axtarış edin.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="relative ml-auto w-full max-w-sm bg-white h-full overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-gray-900">Filtrlər</h3>
                <button 
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Price Range */}
              <div className="mb-8">
                <h4 className="text-lg font-bold text-gray-900 mb-4">Qiymət, ₼</h4>
                <div className="grid grid-cols-2 gap-3">
                  <input 
                    type="number" 
                    placeholder="0" 
                    value={activeFilters.minPrice} 
                    onChange={(e) => setActiveFilters({...activeFilters, minPrice: e.target.value})} 
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none" 
                  />
                  <input 
                    type="number" 
                    placeholder="1000" 
                    value={activeFilters.maxPrice} 
                    onChange={(e) => setActiveFilters({...activeFilters, maxPrice: e.target.value})} 
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none" 
                  />
                </div>
              </div>

              {/* Seriya */}
              <div className="mb-8">
                <h4 className="text-lg font-bold text-gray-900 mb-4">Seriya, Kolleksiya</h4>
                <select 
                  value={activeFilters.collection} 
                  onChange={(e) => setActiveFilters({...activeFilters, collection: e.target.value})} 
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none" 
                >
                  <option value="">Hamısını seçmək</option>
                  {collections.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Məhsul Növü */}
              <div className="mb-8">
                <h4 className="text-lg font-bold text-gray-900 mb-4">Məhsulun növü</h4>
                <select 
                  value={activeFilters.productType} 
                  onChange={(e) => setActiveFilters({...activeFilters, productType: e.target.value})} 
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none" 
                >
                  <option value="">Hamısını seçmək</option>
                  {productTypes.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              {/* Məhsul Təsiri */}
              <div className="mb-8">
                <h4 className="text-lg font-bold text-gray-900 mb-4">Məhsulun təsiri</h4>
                <select 
                  value={activeFilters.productEffect} 
                  onChange={(e) => setActiveFilters({...activeFilters, productEffect: e.target.value})} 
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none" 
                >
                  <option value="">Hamısını seçmək</option>
                  {productEffects.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              {/* Dərinin Tipi */}
              <div className="mb-8">
                <h4 className="text-lg font-bold text-gray-900 mb-4">Dərinin tipi</h4>
                <select 
                  value={activeFilters.skinType} 
                  onChange={(e) => setActiveFilters({...activeFilters, skinType: e.target.value})} 
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none" 
                >
                  <option value="">Hamısını seçmək</option>
                  {skinTypes.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Saçların Tipi */}
              <div className="mb-8">
                <h4 className="text-lg font-bold text-gray-900 mb-4">Saçın tipi</h4>
                <select 
                  value={activeFilters.hairType} 
                  onChange={(e) => setActiveFilters({...activeFilters, hairType: e.target.value})} 
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none" 
                >
                  <option value="">Hamısını seçmək</option>
                  {hairTypes.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              <button 
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full py-4 bg-pink-600 text-white font-bold rounded-2xl hover:bg-pink-700 transition-all shadow-lg"
              >
                Tətbiq Et
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
