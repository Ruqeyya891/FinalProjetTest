import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  Package, 
  MessageSquare, 
  Settings, 
  Plus, 
  Edit3, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  Search, 
  Bell, 
  Menu, 
  X, 
  ChevronRight, 
  LayoutGrid, 
  LayoutDashboard,
  Calendar, 
  FileText, 
  ShieldCheck, 
  UserPlus, 
  Filter, 
  MoreVertical, 
  Eye, 
  Trash2,
  Bot,
  Send,
  LogOut,
  BookOpen,
  Sparkles
} from 'lucide-react';
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
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { categories as categoryData, slugify } from '../utils/categories';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  PointElement, 
  LineElement, 
  ArcElement 
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement
);

// CSS to hide number input spinners
const numberInputStyles = `
  input[type="number"]::-webkit-outer-spin-button,
  input[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  input[type="number"] {
    -moz-appearance: textfield;
  }
`;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { showSuccess, showError, showInfo, showWarning, showConfirm } = useNotification();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Category Navigation State
  const [selectedMainCategory, setSelectedMainCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [selectedChildCategory, setSelectedChildCategory] = useState(null);
  const [prefilledCategory, setPrefilledCategory] = useState(null);
  const [activeChats, setActiveChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [adminMessage, setAdminMessage] = useState('');
  const [adminUnreadCount, setAdminUnreadCount] = useState(0);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null); // For order details modal
  const [statsData, setStatsData] = useState({
    totalRevenue: 0,
    totalUsers: 0,
    newOrders: 0,
    aiChats: 0
  });
  
  // Analytics State
  const [revenueAnalytics, setRevenueAnalytics] = useState(null);
  const [bestSellers, setBestSellers] = useState([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState(null);
  
  // Products Management State
  const [products, setProducts] = useState([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [modalSource, setModalSource] = useState("products"); // "products" | "categories"
  
  // Catalog Cycles Management State
  const [catalogCycles, setCatalogCycles] = useState([]);
  const [isCatalogCycleModalOpen, setIsCatalogCycleModalOpen] = useState(false);
  const [editingCatalogCycle, setEditingCatalogCycle] = useState(null);
  const [catalogCycleForm, setCatalogCycleForm] = useState({
    catalogNumber: '',
    title: '',
    startDate: '',
    endDate: '',
    isActive: true
  });


  
  // Series State
  const [series, setSeries] = useState([]);
  const [isSeriesModalOpen, setIsSeriesModalOpen] = useState(false);
  const [editingSeries, setEditingSeries] = useState(null);
  const [seriesForm, setSeriesForm] = useState({
    name: '',
    slug: '',
    logo: '',
    bannerImage: '',
    description: '',
    isPopular: false,
    status: 'active',
    order: 0
  });
  
  // Helper function to open product modal with prefilled category
  const openProductModalWithCategory = (mainCat, subCat, childCat) => {
    const prefill = {
      categoryName: mainCat.name,
      categorySlug: mainCat.slug,
      subCategoryName: subCat ? subCat.name : '',
      subCategorySlug: subCat ? subCat.slug : '',
      childCategoryName: childCat ? childCat.name : '',
      childCategorySlug: childCat ? childCat.slug : '',
      categories: [
        {
          categoryName: mainCat.name,
          categorySlug: mainCat.slug,
          subCategoryName: subCat ? subCat.name : '',
          subCategorySlug: subCat ? subCat.slug : '',
          childCategoryName: childCat ? childCat.name : '',
          childCategorySlug: childCat ? childCat.slug : ''
        }
      ]
    };
    setPrefilledCategory(prefill);
    setEditingProduct(null);
    setModalSource("categories");
    setProductForm({
      name: '',
      description: '',
      price_catalog: '',
      price_anbar: '',
      price_sale: '',
      discountPercent: '',
      ...prefill,
      sku: '',
      stock: '',
      isActive: true,
      status: 'active',
      images: [''],
      commonImages: [''],
      isInStock: true,
      isSuperPrice: false,
      isNew: false,
      isDiscount: false,
      isPromotion: false,
      isHit: false,
      collection: '',
      seriesId: null,
      seriesName: '',
      seriesSlug: '',
      productType: '',
      productEffect: '',
      skinType: '',
      hairType: '',
      ingredients: '',
      usage: '',
      weightValue: '',
      weightUnit: 'q',
      volumeValue: '',
      volumeUnit: 'ml',
      variants: []
    });
    setShowAddVariantForm(false);
    setEditingVariantIndex(null);
    setTempVariant({
      sku: '',
      name: '',
      image: '',
      variantImage: '',
      images: [''],
      stock: '',
      status: 'active',
      description: '',
      ingredients: '',
      usage: '',
      weight: { value: null, unit: 'q' },
      volume: { value: null, unit: 'ml' }
    });
    setIsProductModalOpen(true);
  };

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price_catalog: '',
    price_anbar: '',
    price_sale: '',
    discountPercent: '',
    categoryName: '',
    categorySlug: '',
    subCategoryName: '',
    subCategorySlug: '',
    childCategoryName: '',
    childCategorySlug: '',
    categories: [],
    sku: '',
    stock: '',
    isActive: true,
    status: 'active',
    images: [''],
    commonImages: [''],
    isInStock: true,
    isSuperPrice: false,
    isNew: false,
    isDiscount: false,
    isPromotion: false,
    isHit: false,
    collection: '',
    seriesName: '',
    seriesSlug: '',
    productType: '',
    productEffect: '',
    skinType: '',
    hairType: '',
    ingredients: '',
    usage: '',
    weightValue: '',
    weightUnit: 'q',
    volumeValue: '',
    volumeUnit: 'ml',
    variants: []
  });
  const [showAddVariantForm, setShowAddVariantForm] = useState(false);
  const [editingVariantIndex, setEditingVariantIndex] = useState(null);
  const [isTempAccordionOpen, setIsTempAccordionOpen] = useState(false);
  const [tempVariant, setTempVariant] = useState({
    sku: '',
    name: '',
    image: '',
    variantImage: '',
    images: [''],
    stock: '',
    status: 'active',
    description: '',
    ingredients: '',
    usage: '',
    weight: { value: null, unit: 'q' },
    volume: { value: null, unit: 'ml' }
  });
  const [formErrors, setFormErrors] = useState({});
  const [csvFile, setCsvFile] = useState(null);
  const [importing, setImporting] = useState(false);

  // Catalogs Management State
  const [catalogs, setCatalogs] = useState([]);
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [editingCatalog, setEditingCatalog] = useState(null);
  const [catalogForm, setCatalogForm] = useState({
    name: '',
    image: '',
    link: '',
    isActive: true
  });

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

  useEffect(() => {
    if (activeTab === 'chats') fetchActiveChats();
    if (activeTab === 'products' || activeTab === 'series') {
      fetchProducts();
      fetchSeries();
    }
    if (activeTab === 'catalogs') fetchCatalogs();
    if (activeTab === 'catalog-cycles') fetchCatalogCycles();
    if (activeTab === 'orders') fetchOrders();
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'overview') fetchStats();
  }, [activeTab]);

  // Poll for new unread messages for admin every 5 seconds
  useEffect(() => {
    const pollChats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://127.0.0.1:5000/api/messages/chat-list', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setActiveChats(response.data);
        // Calculate total unread count
        const totalUnread = response.data.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0);
        setAdminUnreadCount(totalUnread);
      } catch (err) {
        console.error("Error polling chats:", err);
      }
    };
    
    pollChats();
    const interval = setInterval(pollChats, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSeriesSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      let response;
      if (editingSeries) {
        response = await axios.put(`http://127.0.0.1:5000/api/series/${editingSeries._id}`, seriesForm, config);
      } else {
        response = await axios.post('http://127.0.0.1:5000/api/series', seriesForm, config);
      }
      
      setIsSeriesModalOpen(false);
      setEditingSeries(null);
      setSeriesForm({
        name: '', slug: '', logo: '', bannerImage: '', description: '',
        isPopular: false, status: 'active', order: 0
      });
      fetchSeries();
      showSuccess('Seriya yadda saxlanıldı');
    } catch (error) {
      console.error('Error submitting series:', error.response?.data || error.message);
      showError(error.response?.data?.error || 'Xəta baş verdi');
    }
  };

  const deleteSeries = async (id) => {
    const confirmed = await showConfirm();
    if (confirmed) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://127.0.0.1:5000/api/series/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchSeries();
        showSuccess('Seriya silindi');
      } catch (error) {
        showError('Xəta baş verdi');
      }
    }
  };

  const fetchCatalogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://127.0.0.1:5000/api/catalogs?isAdmin=true', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCatalogs(response.data);
    } catch (error) {
      console.error('Error fetching catalogs:', error);
    }
  };
  
  const fetchCatalogCycles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://127.0.0.1:5000/api/catalog-cycles', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCatalogCycles(response.data.catalogCycles);
    } catch (error) {
      console.error('Error fetching catalog cycles:', error);
    }
  };
  
  const createCatalogCycle = async (data) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://127.0.0.1:5000/api/catalog-cycles', data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showSuccess('Kataloq dövrü yaradıldı!');
      fetchCatalogCycles();
      setIsCatalogCycleModalOpen(false);
    } catch (error) {
      showError('Kataloq dövrü yaradılarkən xəta baş verdi');
    }
  };
  
  const updateCatalogCycle = async (id, data) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://127.0.0.1:5000/api/catalog-cycles/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showSuccess('Kataloq dövrü yeniləndi!');
      fetchCatalogCycles();
      setIsCatalogCycleModalOpen(false);
    } catch (error) {
      showError('Kataloq dövrü yenilənərkən xəta baş verdi');
    }
  };
  
  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    setAnalyticsError(null);
    try {
      const token = localStorage.getItem('token');
      
      // Fetch revenue analytics
      const revenueRes = await axios.get('http://127.0.0.1:5000/api/admin/analytics/revenue', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRevenueAnalytics(revenueRes.data);
      console.log("Revenue analytics:", revenueRes.data);
      
      // Fetch best sellers
      const bestSellersRes = await axios.get('http://127.0.0.1:5000/api/admin/analytics/best-sellers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBestSellers(bestSellersRes.data);
      console.log("Best sellers:", bestSellersRes.data);
      
      // Fetch users for totalUsers stat
      const usersRes = await axios.get('http://127.0.0.1:5000/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update statsData
      setStatsData({
        totalRevenue: revenueRes.data.totalRevenue.toFixed(2),
        totalUsers: usersRes.data.users?.length || 0,
        newOrders: revenueRes.data.completedOrdersCount || 0,
        aiChats: 0 // Still 0 since no real AI chat count yet
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setAnalyticsError(error.response?.data?.error || 'Analiz məlumatları alınarkən xəta baş verdi');
      // Set default stats
      setStatsData({
        totalRevenue: "0.00",
        totalUsers: 0,
        newOrders: 0,
        aiChats: 0
      });
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchStats = async () => {
    await fetchAnalytics();
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://127.0.0.1:5000/api/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data.orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://127.0.0.1:5000/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const updateOrderStatus = async (orderId, orderStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://127.0.0.1:5000/api/orders/${orderId}/status`, { orderStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchOrders();
      showSuccess('Sifariş statusu yeniləndi');
    } catch (error) {
      showError(error.response?.data?.error || 'Xəta baş verdi');
    }
  };

  const confirmPayment = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://127.0.0.1:5000/api/orders/${orderId}/confirm-payment`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchOrders();
      showSuccess('Ödəniş təsdiqləndi');
    } catch (error) {
      showError('Xəta baş verdi');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    showSuccess('Çıxış edildi');
    navigate('/login');
    window.dispatchEvent(new Event('storage'));
  };

  const fetchSeries = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/api/series');
      setSeries(response.data);
    } catch (error) {
      console.error('Error fetching series:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://127.0.0.1:5000/api/products?isAdmin=true', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };



  // State for temporary new category being added
  const [tempCategory, setTempCategory] = useState({
    categoryName: '',
    categorySlug: '',
    subCategoryName: '',
    subCategorySlug: '',
    childCategoryName: '',
    childCategorySlug: ''
  });
  const [showAddCategoryMode, setShowAddCategoryMode] = useState(false);

  // Category helper functions
  const addCategory = () => {
    console.log('Add Category clicked!');
    // Reset temp category
    setTempCategory({
      categoryName: '',
      categorySlug: '',
      subCategoryName: '',
      subCategorySlug: '',
      childCategoryName: '',
      childCategorySlug: ''
    });
    setShowAddCategoryMode(true);
  };

  const saveTempCategory = () => {
    console.log('Save temp category:', tempCategory);
    if (!tempCategory.categoryName || !tempCategory.subCategoryName) {
      showError('Əsas və Alt Kateqoriya mütləqdir!');
      return;
    }
    setProductForm(prev => ({
      ...prev,
      categories: [...(prev.categories || []), { ...tempCategory }]
    }));
    setShowAddCategoryMode(false);
    // Reset temp category
    setTempCategory({
      categoryName: '',
      categorySlug: '',
      subCategoryName: '',
      subCategorySlug: '',
      childCategoryName: '',
      childCategorySlug: ''
    });
  };

  const removeCategory = (index) => {
    console.log('Remove Category clicked for index:', index);
    setProductForm(prev => ({
      ...prev,
      categories: (prev.categories || []).filter((_, i) => i !== index)
    }));
  };

  const handleAddVariantClick = () => {
    setTempVariant({
      sku: '',
      name: '',
      image: '',
      variantImage: '',
      images: [''],
      stock: '',
      status: 'active',
      description: '',
      ingredients: '',
      usage: '',
      weight: { value: null, unit: 'q' },
      volume: { value: null, unit: 'ml' }
    });
    setEditingVariantIndex(null);
    setShowAddVariantForm(true);
  };

  const handleEditVariantClick = (index) => {
    setTempVariant({ ...productForm.variants[index] });
    setEditingVariantIndex(index);
    setShowAddVariantForm(true);
  };

  const saveVariant = () => {
    if (!tempVariant.sku || !tempVariant.name) {
      showError('SKU və Variant Adı mütləqdir!');
      return;
    }
    setProductForm(prev => {
      let newVariants = [...(prev.variants || [])];
      if (editingVariantIndex !== null) {
        newVariants[editingVariantIndex] = tempVariant;
      } else {
        newVariants.push(tempVariant);
      }
      return { ...prev, variants: newVariants };
    });
    setShowAddVariantForm(false);
    setEditingVariantIndex(null);
    setTempVariant({
      sku: '',
      name: '',
      image: '',
      variantImage: '',
      images: [''],
      stock: '',
      status: 'active',
      description: '',
      ingredients: '',
      usage: '',
      weight: { value: null, unit: 'q' },
      volume: { value: null, unit: 'ml' }
    });
  };

  const removeVariant = (index) => {
    setProductForm(prev => ({
      ...prev,
      variants: (prev.variants || []).filter((_, i) => i !== index)
    }));
  };

  const updateVariant = (index, field, value) => {
    setProductForm(prev => ({
      ...prev,
      variants: (prev.variants || []).map((v, i) => 
        i === index ? { ...v, [field]: value } : v
      )
    }));
  };

  const addVariantImage = (index) => {
    setProductForm(prev => ({
      ...prev,
      variants: (prev.variants || []).map((v, i) => 
        i === index ? { ...v, images: [...(v.images || []), ''] } : v
      )
    }));
  };

  const handleImportCSV = async (e) => {
    e.preventDefault();
    console.log('🔍 Step 1: Selected file:', csvFile); // Debug log 1
    
    if (!csvFile) {
      showError('Zəhmət olmasa bir CSV faylı seçin');
      return;
    }

    setImporting(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('csvFile', csvFile);
      
      console.log('🔍 Step 2: FormData file:', formData.get('csvFile')); // Debug log 2

      const response = await axios.post('http://127.0.0.1:5000/api/products/import', formData, {
        headers: { 
          Authorization: `Bearer ${token}`
          // DO NOT set Content-Type manually! Axios handles this for FormData!
        }
      });
      
      console.log('🔍 Step 3: Import successful:', response.data); // Debug log 3

      showSuccess(`${response.data.imported} məhsul uğurla import edildi!`);
      setCsvFile(null);
      fetchProducts();
    } catch (error) {
      console.error('❌ Import error:', error);
      console.error('❌ Error details:', error.response?.data);
      showError(error.response?.data?.error || 'Import edərkən xəta baş verdi');
    } finally {
      setImporting(false);
    }
  };

  const handleProductSubmit = async () => {
    // Validate Form
    const errors = {};
    if (!productForm.name.trim()) errors.name = 'Məhsul adı mütləqdir';
    if (!productForm.sku.trim()) errors.sku = 'SKU mütləqdir';
    if (!productForm.price_sale) errors.price_sale = 'Satış qiyməti mütləqdir';
    if (parseFloat(productForm.price_sale) < 0) errors.price_sale = 'Qiymət mənfi ola bilməz';
    if (productForm.price_catalog && parseFloat(productForm.price_catalog) < 0) errors.price_catalog = 'Qiymət mənfi ola bilməz';
    if (productForm.price_anbar && parseFloat(productForm.price_anbar) < 0) errors.price_anbar = 'Qiymət mənfi ola bilməz';
    
    // Validate categories
    if ((productForm.categories || []).length === 0) {
      errors.categories = 'Ən azı 1 kateqoriya əlavə edin';
    } else {
      (productForm.categories || []).forEach((cat, index) => {
        if (!cat.categoryName.trim()) {
          errors[`category-${index}`] = `Kateqoriya ${index + 1}: Əsas kateqoriya mütləqdir`;
        }
        if (!cat.subCategoryName.trim()) {
          errors[`subcategory-${index}`] = `Kateqoriya ${index + 1}: Alt kateqoriya mütləqdir`;
        }
      });
    }

    // Validate images
    const validCommonImages = (productForm.commonImages || []).filter(img => img.trim() !== '');
    const validImages = (productForm.images || []).filter(img => img.trim() !== '');
    if (validCommonImages.length === 0 && validImages.length === 0) {
      errors.images = 'Ən azı 1 şəkil mütləqdir';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});

    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      // Convert prices and stock to numbers
      const productData = {
        ...productForm,
        price_sale: parseFloat(productForm.price_sale) || 0,
        price_catalog: productForm.price_catalog ? parseFloat(productForm.price_catalog) : 0,
        price_anbar: productForm.price_anbar ? parseFloat(productForm.price_anbar) : 0,
        stock: productForm.stock !== '' ? parseInt(productForm.stock, 10) : 0, // Convert stock to integer
        weight: {
          value: productForm.weightValue !== '' ? parseFloat(productForm.weightValue) : null,
          unit: productForm.weightUnit
        },
        volume: {
          value: productForm.volumeValue !== '' ? parseFloat(productForm.volumeValue) : null,
          unit: productForm.volumeUnit
        },
        // Filter out empty strings from images and commonImages
        images: (productForm.images || []).filter(img => img.trim() !== ''),
        commonImages: (productForm.commonImages || []).filter(img => img.trim() !== '')
      };
      
      console.log('🛒 Product Data to Send:', productData);
      
      let response;
      if (editingProduct) {
        response = await axios.put(`http://127.0.0.1:5000/api/products/${editingProduct._id}`, productData, config);
      } else {
        response = await axios.post('http://127.0.0.1:5000/api/products', productData, config);
      }
      
      console.log('✅ Server Response:', response.data);
      setIsProductModalOpen(false);
      setEditingProduct(null);
      setPrefilledCategory(null);
      setProductForm({
        name: '', description: '', price_catalog: '', price_anbar: '', price_sale: '', discountPercent: '',
        categoryName: '', categorySlug: '', subCategoryName: '', subCategorySlug: '',
        childCategoryName: '', childCategorySlug: '', categories: [],
        sku: '', stock: '', isActive: true,
        status: 'active',
        images: [''], commonImages: [''], isInStock: true, isSuperPrice: false, isNew: false, isDiscount: false,
        isPromotion: false, isHit: false, collection: '', seriesId: null, seriesName: '', seriesSlug: '', productType: '', productEffect: '',
        skinType: '', hairType: '', ingredients: '', usage: '',
        weightValue: '', weightUnit: 'q', volumeValue: '', volumeUnit: 'ml',
        variants: []
      });
      setShowAddVariantForm(false);
      setEditingVariantIndex(null);
      setTempVariant({
        sku: '',
        name: '',
        image: '',
        variantImage: '',
        images: [''],
        stock: '',
        status: 'active'
      });
      fetchProducts();
      showSuccess('Məhsul yadda saxlanıldı');
    } catch (error) {
      console.error('Error submitting product:', error.response?.data || error.message);
      showError(error.response?.data?.error || 'Xəta baş verdi');
    }
  };

  const updateProductStatus = async (productId, newStatus) => {
    console.log("Updating status:", productId, newStatus);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(`http://127.0.0.1:5000/api/products/${productId}/status`, {
        status: newStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log("Full response:", response);
      
      // Update the product in state immediately for better UX
      setProducts(prevProducts => 
        prevProducts.map(p => 
          p._id === productId ? { ...p, status: response.data.product ? response.data.product.status : response.data.status } : p
        )
      );
      
      showSuccess('Status dəyişdirildi');
    } catch (error) {
      console.error("Error updating status:", error.response?.data || error.message);
      showError(error.response?.data?.message || 'Status dəyişdirilə bilmədi');
    }
  };

  const deleteProduct = async (id) => {
    const confirmed = await showConfirm();
    if (confirmed) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://127.0.0.1:5000/api/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchProducts();
        showSuccess('Məhsul silindi');
      } catch (error) {
        showError('Xəta baş verdi');
      }
    }
  };

  const handleCatalogSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      if (editingCatalog) {
        await axios.put(`http://127.0.0.1:5000/api/catalogs/${editingCatalog._id}`, catalogForm, config);
      } else {
        await axios.post('http://127.0.0.1:5000/api/catalogs', catalogForm, config);
      }
      setIsCatalogModalOpen(false);
      setEditingCatalog(null);
      setCatalogForm({
        name: '', image: '', link: '', isActive: true
      });
      fetchCatalogs();
      showSuccess('Kataloq yadda saxlanıldı');
    } catch (error) {
      showError('Xəta baş verdi');
    }
  };

  const deleteCatalog = async (id) => {
    const confirmed = await showConfirm();
    if (confirmed) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://127.0.0.1:5000/api/catalogs/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchCatalogs();
        showSuccess('Kataloq silindi');
      } catch (error) {
        showError('Xəta baş verdi');
      }
    }
  };

  const deleteCatalogCycle = async (id) => {
    const confirmed = await showConfirm();
    if (confirmed) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://127.0.0.1:5000/api/catalog-cycles/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showSuccess('Kataloq dövrü silindi');
        fetchCatalogCycles();
      } catch (error) {
        showError('Kataloq dövrü silinərkən xəta baş verdi');
      }
    }
  };

  const matchesCategoryPath = (product, selectedPath) => { 
    if (!selectedPath) return false; 

    const normalize = (value) => 
      String(value || "") 
        .toLowerCase() 
        .trim() 
        .replace(/ə/g, "e") 
        .replace(/ı/g, "i") 
        .replace(/ö/g, "o") 
        .replace(/ü/g, "u") 
        .replace(/ğ/g, "g") 
        .replace(/ç/g, "c") 
        .replace(/ş/g, "s") 
        .replace(/\s+/g, "-");

    const categorySlug = normalize(selectedPath.categorySlug); 
    const subCategorySlug = normalize(selectedPath.subCategorySlug); 
    const childCategorySlug = normalize(selectedPath.childCategorySlug);

    const matchFromArray = Array.isArray(product.categories) && product.categories.some(cat => { 
      const catCategory = normalize(cat.categorySlug || cat.categoryName);
      const catSub = normalize(cat.subCategorySlug || cat.subCategoryName);
      const catChild = normalize(cat.childCategorySlug || cat.childCategoryName);

      return catCategory === categorySlug && 
        (!subCategorySlug || catSub === subCategorySlug) && 
        (!childCategorySlug || catChild === childCategorySlug); 
    }); 

    const matchFromOldFields = 
      normalize(product.categorySlug || product.category) === categorySlug && 
      (!subCategorySlug || normalize(product.subCategorySlug || product.subCategory) === subCategorySlug) && 
      (!childCategorySlug || normalize(product.childCategorySlug || product.childCategory) === childCategorySlug); 

    return matchFromArray || matchFromOldFields; 
  };

  const hideChat = async (chatId) => {
    const confirmed = await showConfirm();
    if (confirmed) {
      try {
        const token = localStorage.getItem('token');
        await axios.post('http://127.0.0.1:5000/api/messages/hide', { chatId }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchActiveChats();
        setSelectedChat(null);
        showSuccess('Söhbət gizləndildi');
      } catch (error) {
        showError('Xəta baş verdi');
      }
    }
  };

  const fetchActiveChats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://127.0.0.1:5000/api/messages/chat-list', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setActiveChats(response.data);
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  };

  const joinChat = async (chatId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://127.0.0.1:5000/api/messages/admin-join', { chatId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchActiveChats();
      loadChatMessages(chatId);
    } catch (error) {
      console.error('Error joining chat:', error);
    }
  };

  const loadChatMessages = async (chatId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://127.0.0.1:5000/api/messages/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedChat({ _id: chatId, messages: response.data, adminIntervened: true });
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSelectChat = async (chat) => {
    setSelectedChat({ ...chat, messages: [] });
    loadChatMessages(chat._id);
    
    // Mark messages as read
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        "http://127.0.0.1:5000/api/messages/read",
        { chatId: chat._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Refresh the chat list to update unread count
      fetchActiveChats();
    } catch (err) {
      console.error("Error marking messages as read:", err);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!adminMessage.trim() || !selectedChat) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://127.0.0.1:5000/api/messages/admin-reply', {
        chatId: selectedChat._id,
        text: adminMessage
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAdminMessage('');
      loadChatMessages(selectedChat._id);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Compute dynamic chart data
  const getRevenueChartData = () => {
    if (!revenueAnalytics) return null;
    
    const months = Object.keys(revenueAnalytics.monthlyRevenue || {}).sort();
    const labels = months.map(monthKey => {
      const [year, month] = monthKey.split('-');
      const monthNames = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'İyun', 'İyul', 'Avq', 'Sen', 'Okt', 'Noy', 'Dek'];
      return monthNames[parseInt(month) - 1];
    });
    
    const data = months.map(monthKey => revenueAnalytics.monthlyRevenue[monthKey]);
    
    return {
      labels,
      datasets: [{
        label: 'Gəlir (AZN)',
        data,
        backgroundColor: 'rgba(236, 72, 153, 0.5)',
        borderColor: 'rgb(236, 72, 153)',
        borderWidth: 2,
        borderRadius: 8,
      }],
    };
  };

  const getBestSellersChartData = () => {
    if (!bestSellers || bestSellers.length === 0) return null;
    
    const top5 = bestSellers.slice(0, 5);
    
    return {
      labels: top5.map(p => p.productName),
      datasets: [{
        label: 'Satış sayı',
        data: top5.map(p => p.totalSold),
        backgroundColor: [
          'rgba(236, 72, 153, 0.7)',
          'rgba(244, 114, 182, 0.7)',
          'rgba(219, 39, 119, 0.7)',
          'rgba(190, 24, 93, 0.7)',
          'rgba(157, 23, 77, 0.7)',
        ],
        borderWidth: 0,
      }],
    };
  };

  const stats = [
    { label: 'Ümumi Gəlir', value: `${statsData.totalRevenue} AZN`, icon: <DollarSign size={24} />, color: 'bg-green-50 text-green-600', trend: '+12%', trendColor: 'text-green-500' },
    { label: 'Ümumi Müştərilər', value: statsData.totalUsers, icon: <Users size={24} />, color: 'bg-pink-50 text-pink-600', trend: '+5%', trendColor: 'text-pink-500' },
    { label: 'Yeni Sifarişlər', value: statsData.newOrders, icon: <Package size={24} />, color: 'bg-purple-50 text-purple-600', trend: '-2%', trendColor: 'text-red-500' },
    { label: 'Admin ilə Söhbət', value: statsData.aiChats, icon: <MessageSquare size={24} />, color: 'bg-pink-50 text-pink-600', trend: '+18%', trendColor: 'text-green-500' },
  ];

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-50">
        <h2 className="text-xl font-bold text-pink-600 flex items-center gap-2">
          <ShieldCheck size={20} />
          Admin
        </h2>
        <button onClick={handleLogout} className="flex items-center gap-2 text-red-500 font-semibold">
          <LogOut size={18} />
          Çıxış
        </button>
      </div>
      
      {/* Sidebar */}
      <aside className={`lg:w-72 bg-white border-r border-gray-200 ${
        window.innerWidth < 1024 ? 'sticky bottom-0 z-40 border-t' : 'sticky top-0 h-screen flex-col'
      }`}>
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex flex-col h-full">
          <div className="p-8 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-pink-600 flex items-center gap-2">
              <ShieldCheck />
              Admin Panel
            </h2>
            <p className="text-gray-400 text-xs mt-1 uppercase tracking-widest font-semibold">Faberlic Consultant</p>
          </div>
          
          <nav className="flex-grow p-6 space-y-2">
            {[
              { id: 'overview', label: 'Ümumi Baxış', icon: <LayoutGrid size={20} /> },
              { id: 'categories', label: 'Kateqoriyalar', icon: <LayoutDashboard size={20} /> },
              { id: 'products', label: 'Məhsullar', icon: <Package size={20} /> },
              { id: 'series', label: 'Seriyalar', icon: <Sparkles size={20} /> },
              { id: 'catalogs', label: 'Kataloqlar', icon: <BookOpen size={20} /> },
              { id: 'catalog-cycles', label: 'Kataloq Dövrləri', icon: <Calendar size={20} /> },
              { id: 'orders', label: 'Sifarişlər', icon: <Clock size={20} /> },
              { id: 'users', label: 'Müştərilər', icon: <Users size={20} /> },
              { id: 'chats', label: 'Admin ilə Söhbət', icon: <MessageSquare size={20} /> },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold transition-all relative ${
                  activeTab === item.id 
                    ? 'bg-pink-600 text-white shadow-lg shadow-pink-200' 
                    : 'text-gray-500 hover:bg-pink-50 hover:text-pink-600'
                }`}
              >
                {item.icon}
                {item.label}
                {item.id === 'chats' && adminUnreadCount > 0 && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-red-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {adminUnreadCount > 99 ? '99+' : adminUnreadCount}
                  </span>
                )}
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold text-red-500 hover:bg-red-50 transition-all mt-auto"
            >
              <LogOut size={20} />
              Çıxış
            </button>
          </nav>
        </div>
        
        {/* Mobile Bottom Nav */}
        <div className="lg:hidden grid grid-cols-8 p-2 bg-white">
          {[
            { id: 'overview', label: 'Baxış', icon: <LayoutGrid size={20} /> },
            { id: 'categories', label: 'Kateqoriyalar', icon: <LayoutDashboard size={20} /> },
            { id: 'products', label: 'Məhsullar', icon: <Package size={20} /> },
            { id: 'catalogs', label: 'Kataloqlar', icon: <BookOpen size={20} /> },
            { id: 'catalog-cycles', label: 'Kataloq', icon: <Calendar size={20} /> },
            { id: 'orders', label: 'Sifarişlər', icon: <Clock size={20} /> },
            { id: 'users', label: 'Müştərilər', icon: <Users size={20} /> },
            { id: 'chats', label: 'AI', icon: <MessageSquare size={20} /> },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl transition-all relative ${
                activeTab === item.id 
                  ? 'text-pink-600' 
                  : 'text-gray-500'
              }`}
            >
              {item.icon}
              <span className="text-[10px] font-medium mt-1">{item.label}</span>
              {item.id === 'chats' && adminUnreadCount > 0 && (
                <span className="absolute top-1 right-2 bg-red-500 text-white text-[8px] font-bold rounded-full h-3.5 w-3.5 flex items-center justify-center">
                  {adminUnreadCount > 99 ? '99+' : adminUnreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </aside>

      <main className="flex-grow p-4 md:p-8 lg:p-12 overflow-x-hidden">


        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              {stats.map((stat, i) => (
                <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 group">
                  <div className="flex items-center justify-between mb-6">
                    <div className={`p-4 rounded-2xl ${stat.color}`}>{stat.icon}</div>
                  </div>
                  <p className="text-gray-500 text-sm font-medium mb-1 uppercase tracking-wider">{stat.label}</p>
                  <h3 className="text-2xl font-black text-gray-900">{stat.value}</h3>
                </div>
              ))}
            </div>
            
            {analyticsLoading ? (
              <div className="flex items-center justify-center h-80">
                <p className="text-gray-500">Yüklənir...</p>
              </div>
            ) : analyticsError ? (
              <div className="flex items-center justify-center h-80">
                <p className="text-red-500">{analyticsError}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm">
                  <h3 className="text-xl font-bold mb-8 text-gray-900">Gəlir Analizi</h3>
                  {getRevenueChartData() ? (
                    <div className="h-80"><Bar data={getRevenueChartData()} options={{ maintainAspectRatio: false }} /></div>
                  ) : (
                    <div className="h-80 flex items-center justify-center">
                      <p className="text-gray-500">Hələ satış məlumatı yoxdur</p>
                    </div>
                  )}
                </div>
                <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm">
                  <h3 className="text-xl font-bold mb-8 text-gray-900">Ən Çox Satılanlar</h3>
                  {getBestSellersChartData() ? (
                    <div className="h-80"><Doughnut data={getBestSellersChartData()} options={{ maintainAspectRatio: false }} /></div>
                  ) : (
                    <div className="h-80 flex items-center justify-center">
                      <p className="text-gray-500">Hələ satış məlumatı yoxdur</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'categories' && (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div className="flex items-center gap-2 text-gray-500">
                <button
                  onClick={() => {
                    setSelectedChildCategory(null);
                    setSelectedSubCategory(null);
                    setSelectedMainCategory(null);
                  }}
                  className="text-pink-600 hover:text-pink-700 font-semibold"
                >
                  Kateqoriyalar
                </button>
                {selectedMainCategory && (
                  <>
                    <ChevronRight size={16} />
                    {selectedSubCategory ? (
                      <>
                        <button
                          onClick={() => {
                            setSelectedChildCategory(null);
                            setSelectedSubCategory(null);
                          }}
                          className="text-pink-600 hover:text-pink-700 font-semibold"
                        >
                          {selectedMainCategory.name}
                        </button>
                      </>
                    ) : (
                      <span className="text-gray-900 font-semibold">{selectedMainCategory.name}</span>
                    )}
                  </>
                )}
                {selectedSubCategory && (
                  <>
                    <ChevronRight size={16} />
                    {selectedChildCategory ? (
                      <>
                        <button
                          onClick={() => {
                            setSelectedChildCategory(null);
                          }}
                          className="text-pink-600 hover:text-pink-700 font-semibold"
                        >
                          {selectedSubCategory.name}
                        </button>
                      </>
                    ) : (
                      <span className="text-gray-900 font-semibold">{selectedSubCategory.name}</span>
                    )}
                  </>
                )}
                {selectedChildCategory && (
                  <>
                    <ChevronRight size={16} />
                    <span className="text-gray-900 font-semibold">{selectedChildCategory.name}</span>
                  </>
                )}
              </div>
            </div>

            {/* Main Categories */}
            {!selectedMainCategory && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {categoryData.map((cat) => (
                  <button
                    key={cat.slug}
                    onClick={() => {
                      setSelectedMainCategory(cat);
                      setSelectedSubCategory(null);
                      setSelectedChildCategory(null);
                    }}
                    className="bg-white  p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:border-pink-200 transition-all text-left group"
                  >
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-pink-600 transition-colors">{cat.name}</h3>
                    <p className="text-sm text-gray-500">{cat.subCategories?.length || 0} Alt Kateqoriya</p>
                  </button>
                ))}
              </div>
            )}

            {/* Sub Categories */}
            {selectedMainCategory && !selectedSubCategory && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {selectedMainCategory.subCategories?.map((subCat) => (
                  <button
                    key={subCat.slug}
                    onClick={() => {
                      setSelectedSubCategory(subCat);
                      setSelectedChildCategory(null);
                    }}
                    className="bg-white  p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:border-pink-200 transition-all text-left group"
                  >
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-pink-600 transition-colors">{subCat.name}</h3>
                    <p className="text-sm text-gray-500">{subCat.childCategories?.length || 0} Alt Kateqoriya</p>
                  </button>
                ))}
              </div>
            )}

            {/* Child Categories OR Subcategory Page (if no children) */}
            {selectedMainCategory && selectedSubCategory && !selectedChildCategory && (
              <>
                {selectedSubCategory.childCategories && selectedSubCategory.childCategories.length > 0 ? (
                  // Show child categories grid
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {selectedSubCategory.childCategories?.map((childCat) => (
                      <button
                        key={childCat.slug}
                        onClick={() => {
                          setSelectedChildCategory(childCat);
                        }}
                        className="bg-white  p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:border-pink-200 transition-all text-left group"
                      >
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-pink-600 transition-colors">{childCat.name}</h3>
                      </button>
                    ))}
                  </div>
                ) : (
                  // Subcategory page (no children) with add button and product list
                  <div className="space-y-8">
                    <div className="bg-white  p-12 rounded-3xl border border-gray-100 shadow-sm">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">{selectedSubCategory.name}</h2>
                        <button
                          onClick={() => openProductModalWithCategory(selectedMainCategory, selectedSubCategory, null)}
                          className="flex items-center justify-center gap-2 px-8 py-4 bg-pink-600 text-white font-bold rounded-xl hover:bg-pink-700 shadow-lg transition-all"
                        >
                          <Plus size={20} />
                          Bu Kateqoriyaya Məhsul Əlavə Et
                        </button>
                      </div>
                    </div>

                    {/* Products Table for Subcategory */}
                    <div className="bg-white  rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Şəkil</th>
                              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Ad</th>
                              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">SKU</th>
                              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Qiymət</th>
                              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Stok</th>
                              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Redaktə Et</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {(() => {
                              const selectedPath = {
                                categorySlug: selectedMainCategory.slug,
                                subCategorySlug: selectedSubCategory.slug,
                                childCategorySlug: null
                              };
                              console.log("selectedCategoryPath:", selectedPath);
                              console.log("products:", products);
                              const categoryProducts = products.filter(product => matchesCategoryPath(product, selectedPath));
                              console.log("categoryProducts:", categoryProducts);
                              return categoryProducts.map(product => (
                                <tr key={product._id} className="hover:bg-pink-50/30 transition-colors">
                                  <td className="px-6 py-5">
                                    <img 
                                      src={product.images?.[0] || product.commonImages?.[0] || product.variants?.[0]?.image || product.variants?.[0]?.variantImage || product.image} 
                                      alt={product.name} 
                                      className="w-12 h-12 rounded-xl object-cover bg-gray-50 border border-gray-100"
                                    />
                                  </td>
                                  <td className="px-6 py-5">
                                    <p className="text-sm font-semibold text-gray-900 line-clamp-1">{product.name}</p>
                                  </td>
                                  <td className="px-6 py-5 text-sm text-gray-700">
                                    {product.sku}
                                  </td>
                                  <td className="px-6 py-5 text-sm font-extrabold text-pink-600">
                                    {product.price_sale} AZN
                                  </td>
                                  <td className="px-6 py-5 text-sm text-gray-700">
                                    {product.stock}
                                  </td>
                                  <td className="px-6 py-5">
                                    <select 
                                      value={product.status || (product.isActive ? 'active' : 'passive')} 
                                      onChange={(e) => updateProductStatus(product._id, e.target.value)}
                                      className={`px-3 py-2 rounded-lg text-xs font-bold uppercase border-none outline-none cursor-pointer transition-colors ${
                                        product.status === 'active' || (product.isActive && !product.status) ? 'bg-[#dcfce7] text-[#15803d]' : 
                                        product.status === 'passive' ? 'bg-[#e5e7eb] text-[#374151]' : 
                                        'bg-[#fee2e2] text-[#dc2626]'
                                      }`}
                                    >
                                      <option value="active">Aktiv</option>
                                      <option value="passive">Passiv</option>
                                      <option value="out_of_stock">Stokda yoxdur</option>
                                    </select>
                                  </td>
                                  <td className="px-6 py-5 text-right">
                                    <button 
                                      onClick={() => { 
                                        setEditingProduct(product); 
                                        setPrefilledCategory(null);
                                        setModalSource("categories");
                                        let initialCategories = [];
                                        if (product.categories && product.categories.length > 0) {
                                          initialCategories = product.categories;
                                        } else if (product.categorySlug) {
                                          initialCategories = [{
                                            categoryName: product.categoryName || product.category || '',
                                            categorySlug: product.categorySlug,
                                            subCategoryName: product.subCategoryName || '',
                                            subCategorySlug: product.subCategorySlug || '',
                                            childCategoryName: product.childCategoryName || '',
                                            childCategorySlug: product.childCategorySlug || ''
                                          }];
                                        }
                                        setProductForm({
                                          name: product.name || '',
                                          description: product.description || '',
                                          price_catalog: product.price_catalog || '',
                                          price_anbar: product.price_anbar || '',
                                          price_sale: product.price_sale || '',
                                          discountPercent: product.discountPercent || '',
                                          categoryName: product.categoryName || product.category || '',
                                          categorySlug: product.categorySlug || '',
                                          subCategoryName: product.subCategoryName || '',
                                          subCategorySlug: product.subCategorySlug || '',
                                          childCategoryName: product.childCategoryName || '',
                                          childCategorySlug: product.childCategorySlug || '',
                                          categories: initialCategories,
                                          sku: product.sku || '',
                                          stock: product.stock || '',
                                          isActive: product.isActive !== false,
                                          status: product.status || (product.isActive ? 'active' : 'passive'),
                                          images: Array.isArray(product.images) && product.images.length > 0 ? product.images : [''],
                                          commonImages: Array.isArray(product.commonImages) && product.commonImages.length > 0 ? product.commonImages : [''],
                                          isInStock: product.isInStock !== false,
                                          isSuperPrice: product.isSuperPrice === true,
                                          isNew: product.isNew === true,
                                          isDiscount: product.isDiscount === true,
                                          isPromotion: product.isPromotion === true,
                                          isHit: product.isHit === true,
                                          collection: product.collection || '',
                                          seriesName: product.seriesName || '',
                                          seriesSlug: product.seriesSlug || '',
                                          productType: product.productType || '',
                                          productEffect: product.productEffect || '',
                                          skinType: product.skinType || '',
                                          hairType: product.hairType || '',
                                          ingredients: product.ingredients || '',
                                          usage: product.usage || '',
                                          weightValue: product.weight?.value || '',
                                          weightUnit: product.weight?.unit || 'q',
                                          volumeValue: product.volume?.value || '',
                                          volumeUnit: product.volume?.unit || 'ml',
                                          variants: product.variants || []
                                        });
                                        setShowAddVariantForm(false);
                                        setEditingVariantIndex(null);
                                        setTempVariant({
                                          sku: '',
                                          name: '',
                                          image: '',
                                          variantImage: '',
                                          images: [''],
                                          stock: '',
                                          status: 'active',
                                          description: '',
                                          ingredients: '',
                                          usage: '',
                                          weight: { value: null, unit: 'q' },
                                          volume: { value: null, unit: 'ml' }
                                        }); 
                                        setIsProductModalOpen(true); 
                                      }} 
                                      className="px-6 py-3 bg-pink-50 text-pink-600 font-bold rounded-xl hover:bg-pink-600 hover:text-white transition-all"
                                    >
                                      Redaktə Et
                                    </button>
                                  </td>
                                </tr>
                              ));
                            })()}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Child Category Page with Add Button and Products */}
            {selectedMainCategory && selectedSubCategory && selectedChildCategory && (
              <div className="space-y-8">
                <div className="bg-white  p-12 rounded-3xl border border-gray-100 shadow-sm">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">{selectedChildCategory.name}</h2>
                    <button
                      onClick={() => openProductModalWithCategory(selectedMainCategory, selectedSubCategory, selectedChildCategory)}
                      className="flex items-center justify-center gap-2 px-8 py-4 bg-pink-600 text-white font-bold rounded-xl hover:bg-pink-700 shadow-lg transition-all"
                    >
                      <Plus size={20} />
                      Bu Kateqoriyaya Məhsul Əlavə Et
                    </button>
                  </div>
                </div>

                {/* Products Table for Child Category */}
                <div className="bg-white  rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Şəkil</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Ad</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">SKU</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Qiymət</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Stok</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Redaktə Et</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {(() => {
                              const selectedPath = {
                                categorySlug: selectedMainCategory.slug,
                                subCategorySlug: selectedSubCategory.slug,
                                childCategorySlug: selectedChildCategory.slug
                              };
                              console.log("selectedCategoryPath:", selectedPath);
                              console.log("products:", products);
                              const categoryProducts = products.filter(product => matchesCategoryPath(product, selectedPath));
                              console.log("categoryProducts:", categoryProducts);
                              return categoryProducts.map(product => (
                                <tr key={product._id} className="hover:bg-pink-50/30 transition-colors">
                                  <td className="px-6 py-5">
                                    <img 
                                      src={product.images?.[0] || product.commonImages?.[0] || product.variants?.[0]?.image || product.variants?.[0]?.variantImage || product.image} 
                                      alt={product.name} 
                                      className="w-12 h-12 rounded-xl object-cover bg-gray-50 border border-gray-100"
                                    />
                                  </td>
                                  <td className="px-6 py-5">
                                    <p className="text-sm font-semibold text-gray-900 line-clamp-1">{product.name}</p>
                                  </td>
                                  <td className="px-6 py-5 text-sm text-gray-700">
                                    {product.sku}
                                  </td>
                                  <td className="px-6 py-5 text-sm font-extrabold text-pink-600">
                                    {product.price_sale} AZN
                                  </td>
                                  <td className="px-6 py-5 text-sm text-gray-700">
                                    {product.stock}
                                  </td>
                                  <td className="px-6 py-5">
                                    <select 
                                      value={product.status || (product.isActive ? 'active' : 'passive')} 
                                      onChange={(e) => updateProductStatus(product._id, e.target.value)}
                                      className={`px-3 py-2 rounded-lg text-xs font-bold uppercase border-none outline-none cursor-pointer transition-colors ${
                                        product.status === 'active' || (product.isActive && !product.status) ? 'bg-[#dcfce7] text-[#15803d]' : 
                                        product.status === 'passive' ? 'bg-[#e5e7eb] text-[#374151]' : 
                                        'bg-[#fee2e2] text-[#dc2626]'
                                      }`}
                                    >
                                      <option value="active">Aktiv</option>
                                      <option value="passive">Passiv</option>
                                      <option value="out_of_stock">Stokda yoxdur</option>
                                    </select>
                                  </td>
                                  <td className="px-6 py-5 text-right">
                                    <button 
                                      onClick={() => { 
                                        setEditingProduct(product); 
                                        setPrefilledCategory(null);
                                        setModalSource("categories");
                                        let initialCategories = [];
                                        if (product.categories && product.categories.length > 0) {
                                          initialCategories = product.categories;
                                        } else if (product.categorySlug) {
                                          initialCategories = [{
                                            categoryName: product.categoryName || product.category || '',
                                            categorySlug: product.categorySlug,
                                            subCategoryName: product.subCategoryName || '',
                                            subCategorySlug: product.subCategorySlug || '',
                                            childCategoryName: product.childCategoryName || '',
                                            childCategorySlug: product.childCategorySlug || ''
                                          }];
                                        }
                                        setProductForm({
                                          name: product.name || '',
                                          description: product.description || '',
                                          price_catalog: product.price_catalog || '',
                                          price_anbar: product.price_anbar || '',
                                          price_sale: product.price_sale || '',
                                          discountPercent: product.discountPercent || '',
                                          categoryName: product.categoryName || product.category || '',
                                          categorySlug: product.categorySlug || '',
                                          subCategoryName: product.subCategoryName || '',
                                          subCategorySlug: product.subCategorySlug || '',
                                          childCategoryName: product.childCategoryName || '',
                                          childCategorySlug: product.childCategorySlug || '',
                                          categories: initialCategories,
                                          sku: product.sku || '',
                                          stock: product.stock || '',
                                          isActive: product.isActive !== false,
                                          status: product.status || (product.isActive ? 'active' : 'passive'),
                                          images: Array.isArray(product.images) && product.images.length > 0 ? product.images : [''],
                                          commonImages: Array.isArray(product.commonImages) && product.commonImages.length > 0 ? product.commonImages : [''],
                                          isInStock: product.isInStock !== false,
                                          isSuperPrice: product.isSuperPrice === true,
                                          isNew: product.isNew === true,
                                          isDiscount: product.isDiscount === true,
                                          isPromotion: product.isPromotion === true,
                                          isHit: product.isHit === true,
                                          collection: product.collection || '',
                                          seriesName: product.seriesName || '',
                                          seriesSlug: product.seriesSlug || '',
                                          productType: product.productType || '',
                                          productEffect: product.productEffect || '',
                                          skinType: product.skinType || '',
                                          hairType: product.hairType || '',
                                          ingredients: product.ingredients || '',
                                          usage: product.usage || '',
                                          weightValue: product.weight?.value || '',
                                          weightUnit: product.weight?.unit || 'q',
                                          volumeValue: product.volume?.value || '',
                                          volumeUnit: product.volume?.unit || 'ml',
                                          variants: product.variants || []
                                        });
                                        setShowAddVariantForm(false);
                                        setEditingVariantIndex(null);
                                        setTempVariant({
                                          sku: '',
                                          name: '',
                                          image: '',
                                          variantImage: '',
                                          images: [''],
                                          stock: '',
                                          status: 'active',
                                          description: '',
                                          ingredients: '',
                                          usage: '',
                                          weight: { value: null, unit: 'q' },
                                          volume: { value: null, unit: 'ml' }
                                        }); 
                                        setIsProductModalOpen(true); 
                                      }} 
                                      className="px-6 py-3 bg-pink-50 text-pink-600 font-bold rounded-xl hover:bg-pink-600 hover:text-white transition-all"
                                    >
                                      Redaktə Et
                                    </button>
                                  </td>
                                </tr>
                              ));
                            })()}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <h2 className="text-2xl font-bold text-gray-900">Məhsul İdarəetməsi</h2>
              <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">


                {/* New Product Button */}
                <button onClick={() => { 
                  setEditingProduct(null); 
                  setPrefilledCategory(null);
                  setModalSource("products");
                  setProductForm({ 
                    name: '', 
                    description: '', 
                    price_catalog: '', 
                    price_anbar: '', 
                    price_sale: '', 
                    categoryName: '', 
                    categorySlug: '', 
                    subCategoryName: '', 
                    subCategorySlug: '', 
                    childCategoryName: '', 
                    childCategorySlug: '',
                    categories: [],
                    sku: '', 
                    stock: '', 
                    isActive: true, 
                    status: 'active',
                    images: [''], 
                    isInStock: true, 
                    isSuperPrice: false, 
                    isNew: false, 
                    isDiscount: false, 
                    isPromotion: false, 
                    isHit: false, 
                    collection: '',
                    seriesName: '',
                    seriesSlug: '', 
                    productType: '', 
                    productEffect: '', 
                    skinType: '', 
                    hairType: '',
                    ingredients: '',
                    usage: '',
                    variants: []
                  }); 
                  setFormErrors({});
                  setIsProductModalOpen(true); 
                }} className="flex items-center gap-2 px-6 py-3 bg-pink-600 text-white font-bold rounded-xl hover:bg-pink-700 shadow-lg transition-all">
                  <Plus size={20} /> Yeni Məhsul
                </button>
              </div>
            </div>
            <div className="bg-white  rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Məhsul</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Kateqoriya</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Qiymət</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Stok</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Əməliyyatlar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {products.map(product => (
                      <tr key={product._id} className="hover:bg-pink-50/30 transition-colors">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <img 
                              src={product.images?.[0] || product.image} 
                              alt={product.name} 
                              className="w-12 h-12 rounded-xl object-cover bg-gray-50 border border-gray-100"
                            />
                            <div>
                              <p className="text-sm font-semibold text-gray-900 line-clamp-1">{product.name}</p>
                              <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                              <div className="flex gap-2 mt-1">
                                {product.weight?.value && (
                                  <span className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                                    {product.weight.value} {product.weight.unit}
                                  </span>
                                )}
                                {product.volume?.value && (
                                  <span className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                                    {product.volume.value} {product.volume.unit}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-sm text-gray-700">
                          {(product.categories || []).length > 0 
                            ? (product.categories || []).map((cat, idx) => (
                                <span key={idx} className="mr-2">
                                  {cat.categoryName}
                                  {cat.subCategoryName && ` > ${cat.subCategoryName}`}
                                  {cat.childCategoryName && ` > ${cat.childCategoryName}`}
                                </span>
                              ))
                            : product.categoryName || product.category
                          }
                        </td>
                        <td className="px-6 py-5 text-sm font-extrabold text-pink-600">
                          {product.price_sale} AZN
                        </td>
                        <td className="px-6 py-5 text-sm text-gray-700">
                          {product.stock}
                        </td>
                        <td className="px-6 py-5">
                          <select 
                            value={product.status || (product.isActive ? 'active' : 'passive')} 
                            onChange={(e) => updateProductStatus(product._id, e.target.value)}
                            className={`px-3 py-2 rounded-lg text-xs font-bold uppercase border-none outline-none cursor-pointer transition-colors ${
                              product.status === 'active' || (product.isActive && !product.status) ? 'bg-[#dcfce7] text-[#15803d]' : 
                              product.status === 'passive' ? 'bg-[#e5e7eb] text-[#374151]' : 
                              'bg-[#fee2e2] text-[#dc2626]'
                            }`}
                          >
                            <option value="active">Aktiv</option>
                            <option value="passive">Passiv</option>
                            <option value="out_of_stock">Stokda yoxdur</option>
                          </select>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => { 
                                setEditingProduct(product); 
                                setPrefilledCategory(null);
                                setModalSource("products");
                                // If product has categories array, use it, else create from single category
                                let initialCategories = [];
                                if (product.categories && product.categories.length > 0) {
                                  initialCategories = product.categories;
                                } else if (product.categorySlug) {
                                  initialCategories = [{
                                    categoryName: product.categoryName || product.category || '',
                                    categorySlug: product.categorySlug,
                                    subCategoryName: product.subCategoryName || '',
                                    subCategorySlug: product.subCategorySlug || '',
                                    childCategoryName: product.childCategoryName || '',
                                    childCategorySlug: product.childCategorySlug || ''
                                  }];
                                }
                                setProductForm({
                                  name: product.name || '',
                                  description: product.description || '',
                                  price_catalog: product.price_catalog || '',
                                  price_anbar: product.price_anbar || '',
                                  price_sale: product.price_sale || '',
                                  discountPercent: product.discountPercent || '',
                                  categoryName: product.categoryName || product.category || '',
                                  categorySlug: product.categorySlug || '',
                                  subCategoryName: product.subCategoryName || '',
                                  subCategorySlug: product.subCategorySlug || '',
                                  childCategoryName: product.childCategoryName || '',
                                  childCategorySlug: product.childCategorySlug || '',
                                  categories: initialCategories,
                                  sku: product.sku || '',
                                  stock: product.stock || '',
                                  isActive: product.isActive !== false,
                                  status: product.status || (product.isActive ? 'active' : 'passive'),
                                  images: Array.isArray(product.images) && product.images.length > 0 ? product.images : [''],
                                  isInStock: product.isInStock !== false,
                                  isSuperPrice: product.isSuperPrice === true,
                                  isNew: product.isNew === true,
                                  isDiscount: product.isDiscount === true,
                                  isPromotion: product.isPromotion === true,
                                  isHit: product.isHit === true,
                                  collection: product.collection || '',
                                  seriesId: product.seriesId || null,
                                  seriesName: product.seriesName || '',
                                  seriesSlug: product.seriesSlug || '',
                                  productType: product.productType || '',
                                  productEffect: product.productEffect || '',
                                  skinType: product.skinType || '',
                                  hairType: product.hairType || '',
                                  ingredients: product.ingredients || '',
                                  usage: product.usage || '',
                                  weightValue: product.weight?.value || '',
                                  weightUnit: product.weight?.unit || 'q',
                                  volumeValue: product.volume?.value || '',
                                  volumeUnit: product.volume?.unit || 'ml',
                                  variants: product.variants || []
                                }); 
                                setIsProductModalOpen(true); 
                              }} 
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            >
                              <Edit3 size={18} />
                            </button>
                            <button 
                              onClick={() => { 
                                setItemToDelete({ id: product._id, type: 'product' }); 
                                setIsDeleteModalOpen(true); 
                              }} 
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {isProductModalOpen && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                <div className="bg-white  rounded-[40px] w-full max-w-5xl max-h-[90vh] overflow-y-auto p-12">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-8 gap-4">
                    <div>
                      <h3 className="text-2xl font-bold">{editingProduct ? 'Redaktə Et' : 'Yeni Məhsul'}</h3>
                      {prefilledCategory && (
                        <p className="text-sm text-gray-500 mt-2">
                          Məhsul əlavə olunur: 
                          <span className="font-semibold text-pink-600 ml-2">
                            {prefilledCategory.categoryName}
                            {prefilledCategory.subCategoryName && ` / ${prefilledCategory.subCategoryName}`}
                            {prefilledCategory.childCategoryName && ` / ${prefilledCategory.childCategoryName}`}
                          </span>
                        </p>
                      )}
                    </div>
                    <button onClick={() => {
                      setIsProductModalOpen(false);
                      setPrefilledCategory(null);
                    }}><X size={24} /></button>
                  </div>
                  <form onSubmit={(e) => { e.preventDefault(); handleProductSubmit(); }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Form Errors */}
                    {Object.keys(formErrors).length > 0 && (
                      <div className="md:col-span-2 bg-red-50 border border-red-200 rounded-2xl p-4">
                        <h4 className="text-red-800 font-bold mb-2">Xətalar var:</h4>
                        <ul className="list-disc list-inside text-red-700 text-sm">
                          {Object.values(formErrors).map((err, idx) => <li key={idx}>{err}</li>)}
                        </ul>
                      </div>
                    )}
                    
                    {/* Basic Info */}
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-700">Məhsul Adı *</label>
                      <input placeholder="Məhsul Adı" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} className={`px-6 py-4 bg-gray-50 rounded-2xl outline-none w-full ${formErrors.name ? 'border border-red-500' : ''}`} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-700">SKU / Artikul *</label>
                      <input placeholder="SKU" value={productForm.sku} onChange={e => setProductForm({...productForm, sku: e.target.value})} className={`px-6 py-4 bg-gray-50 rounded-2xl outline-none w-full ${formErrors.sku ? 'border border-red-500' : ''}`} />
                    </div>

                    {/* Multiple Categories (Compact Version) - Only show if not prefilled from category page */}
                    {!prefilledCategory ? (
                      <div className="md:col-span-2 space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-semibold text-gray-700">Kateqoriyalar *</label>
                          {!showAddCategoryMode && (
                            <button 
                              type="button" 
                              onClick={addCategory}
                              className="px-3 py-2 bg-pink-100 text-pink-700 rounded-lg text-sm font-bold hover:bg-pink-200 transition-all flex items-center gap-1"
                            >
                              <Plus size={16} />
                              Kateqoriya əlavə et
                            </button>
                          )}
                        </div>
                        
                        {formErrors.categories && (
                          <p className="text-red-500 text-sm">{formErrors.categories}</p>
                        )}

                        {/* Category Chips */}
                        <div className="flex flex-wrap gap-2">
                          {(productForm.categories || []).map((cat, index) => (
                            <div 
                              key={index} 
                              className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-full text-sm border border-gray-200"
                            >
                              <span className="text-gray-700">
                                {cat.categoryName}
                                {cat.subCategoryName && ` / ${cat.subCategoryName}`}
                                {cat.childCategoryName && ` / ${cat.childCategoryName}`}
                              </span>
                              <button 
                                type="button" 
                                onClick={() => removeCategory(index)}
                                className="w-5 h-5 rounded-full text-gray-500 hover:bg-gray-200 hover:text-red-600 flex items-center justify-center transition-all"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Add Category Mode */}
                        {showAddCategoryMode && (
                          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              {/* Main Category */}
                              <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-700">Əsas Kateqoriya *</label>
                                <select 
                                  value={tempCategory.categoryName} 
                                  onChange={(e) => {
                                    const selectedCat = categoryData.find(c => c.name === e.target.value);
                                    setTempCategory({
                                      ...tempCategory,
                                      categoryName: selectedCat ? selectedCat.name : '',
                                      categorySlug: selectedCat ? selectedCat.slug : '',
                                      subCategoryName: '',
                                      subCategorySlug: '',
                                      childCategoryName: '',
                                      childCategorySlug: ''
                                    });
                                  }}
                                  className="px-4 py-3 bg-white  rounded-xl outline-none w-full border border-gray-200"
                                >
                                  <option value="">Əsas Kateqoriya Seçin</option>
                                  {Array.isArray(categoryData) && categoryData.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                </select>
                              </div>

                              {/* Sub Category */}
                              <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-700">Alt Kateqoriya *</label>
                                <select 
                                  disabled={!tempCategory.categoryName}
                                  value={tempCategory.subCategoryName} 
                                  onChange={(e) => {
                                    const selectedCat = categoryData.find(c => c.name === tempCategory.categoryName);
                                    const selectedSub = selectedCat?.subCategories?.find(s => s.name === e.target.value);
                                    setTempCategory({
                                      ...tempCategory,
                                      subCategoryName: selectedSub ? selectedSub.name : '',
                                      subCategorySlug: selectedSub ? selectedSub.slug : '',
                                      childCategoryName: '',
                                      childCategorySlug: ''
                                    });
                                  }}
                                  className="px-4 py-3 bg-white  rounded-xl outline-none w-full border border-gray-200"
                                >
                                  <option value="">Alt Kateqoriya Seçin</option>
                                  {Array.isArray(categoryData.find(c => c.name === tempCategory.categoryName)?.subCategories) && 
                                    categoryData.find(c => c.name === tempCategory.categoryName)?.subCategories?.map(sub => (
                                      <option key={sub.name} value={sub.name}>{sub.name}</option>
                                    ))}
                                </select>
                              </div>

                              {/* Child Category */}
                              {(() => {
                                const selectedCategory = categoryData.find(c => c.name === tempCategory.categoryName);
                                const selectedSubCategory = selectedCategory?.subCategories?.find(s => s.name === tempCategory.subCategoryName);
                                const hasChildren = selectedSubCategory?.childCategories?.length > 0;
                                
                                if (!hasChildren) return null;
                                
                                return (
                                  <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-700">Child Kateqoriya</label>
                                    <select 
                                      value={tempCategory.childCategoryName} 
                                      onChange={(e) => {
                                        const selectedCat = categoryData.find(c => c.name === tempCategory.categoryName);
                                        const selectedSub = selectedCat?.subCategories?.find(s => s.name === tempCategory.subCategoryName);
                                        const selectedChild = selectedSub?.childCategories?.find(ch => ch.name === e.target.value);
                                        setTempCategory({
                                          ...tempCategory,
                                          childCategoryName: selectedChild ? selectedChild.name : '',
                                          childCategorySlug: selectedChild ? selectedChild.slug : ''
                                        });
                                      }}
                                      className="px-4 py-3 bg-white  rounded-xl outline-none w-full border border-gray-200"
                                    >
                                      <option value="">Child Kateqoriya Seçin</option>
                                      {Array.isArray(selectedSubCategory?.childCategories) && 
                                        selectedSubCategory?.childCategories?.map(child => (
                                          <option key={child.name} value={child.name}>{child.name}</option>
                                        ))}
                                    </select>
                                  </div>
                                );
                              })()}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 justify-end">
                              <button 
                                type="button" 
                                onClick={() => setShowAddCategoryMode(false)}
                                className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-300 transition-all"
                              >
                                İmtina et
                              </button>
                              <button 
                                type="button" 
                                onClick={saveTempCategory}
                                className="px-3 py-2 bg-pink-600 text-white rounded-lg text-sm font-bold hover:bg-pink-700 transition-all"
                              >
                                Kateqoriyanı əlavə et
                              </button>
                            </div>
                          </div>
                        )}

                        {/* If no categories and not adding, show a message */}
                        {(productForm.categories || []).length === 0 && !showAddCategoryMode && (
                          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-xl">
                            <p className="text-gray-500 text-sm">Kateqoriya əlavə etmək üçün yuxarıdakı düyməni basın</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      // If prefilled, just show the category chip without add/remove options
                      <div className="md:col-span-2 space-y-3">
                        <div className="flex flex-wrap gap-2">
                          {(productForm.categories || []).map((cat, index) => (
                            <div 
                              key={index} 
                              className="flex items-center gap-2 bg-pink-100 text-pink-700 px-3 py-2 rounded-full text-sm border border-pink-200"
                            >
                              <span>
                                {cat.categoryName}
                                {cat.subCategoryName && ` / ${cat.subCategoryName}`}
                                {cat.childCategoryName && ` / ${cat.childCategoryName}`}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Styles for number inputs */}
                    <style>{numberInputStyles}</style>
                    
                    {/* Prices */}
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-700">Köhnə qiymət / Kataloq qiyməti</label>
                      <input 
                        type="number" 
                        min="0" 
                        step="0.01" 
                        inputMode="decimal" 
                        placeholder="Kataloq Qiyməti" 
                        value={productForm.price_catalog} 
                        onChange={e => {
                          let val = e.target.value;
                          if (val < 0) val = 0;
                          const newForm = {...productForm, price_catalog: val};
                          // Auto calculate sale price if discount exists
                          if (newForm.price_catalog && newForm.discountPercent) {
                            const oldPrice = parseFloat(newForm.price_catalog);
                            const discount = parseFloat(newForm.discountPercent);
                            newForm.price_sale = (oldPrice - (oldPrice * discount / 100)).toFixed(2);
                          }
                          setProductForm(newForm);
                        }} 
                        className={`px-6 py-4 bg-gray-50 rounded-2xl outline-none w-full ${formErrors.price_catalog ? 'border border-red-500' : ''}`} 
                      />
                      {formErrors.price_catalog && <p className="text-red-500 text-xs mt-1">{formErrors.price_catalog}</p>}
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-700">Endirim faizi %</label>
                      <input 
                        type="number" 
                        min="0" 
                        max="100" 
                        step="0.01" 
                        inputMode="decimal" 
                        placeholder="Endirim faizi" 
                        value={productForm.discountPercent} 
                        onChange={e => {
                          let val = e.target.value;
                          if (val < 0) val = 0;
                          if (val > 100) val = 100;
                          const newForm = {...productForm, discountPercent: val};
                          // Auto calculate sale price
                          if (newForm.price_catalog) {
                            const oldPrice = parseFloat(newForm.price_catalog);
                            const discount = parseFloat(newForm.discountPercent || 0);
                            newForm.price_sale = (oldPrice - (oldPrice * discount / 100)).toFixed(2);
                          }
                          setProductForm(newForm);
                        }} 
                        className="px-6 py-4 bg-gray-50 rounded-2xl outline-none w-full" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-700">Satış Qiyməti *</label>
                      <input 
                        type="number" 
                        min="0" 
                        step="0.01" 
                        inputMode="decimal" 
                        placeholder="Satış Qiyməti" 
                        value={productForm.price_sale} 
                        onChange={e => {
                          let val = e.target.value;
                          if (val < 0) val = 0;
                          setProductForm({...productForm, price_sale: val});
                        }} 
                        className={`px-6 py-4 bg-gray-50 rounded-2xl outline-none w-full ${formErrors.price_sale ? 'border border-red-500' : ''}`} 
                      />
                      {formErrors.price_sale && <p className="text-red-500 text-xs mt-1">{formErrors.price_sale}</p>}
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-700">Anbar Qiyməti</label>
                      <input 
                        type="number" 
                        min="0" 
                        step="0.01" 
                        inputMode="decimal" 
                        placeholder="Anbar Qiyməti" 
                        value={productForm.price_anbar} 
                        onChange={e => {
                          let val = e.target.value;
                          if (val < 0) val = 0;
                          setProductForm({...productForm, price_anbar: val});
                        }} 
                        className={`px-6 py-4 bg-gray-50 rounded-2xl outline-none w-full ${formErrors.price_anbar ? 'border border-red-500' : ''}`} 
                      />
                      {formErrors.price_anbar && <p className="text-red-500 text-xs mt-1">{formErrors.price_anbar}</p>}
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-700">Stok Sayı</label>
                      <input type="number" min="0" placeholder="Stok" value={productForm.stock} onChange={e => setProductForm({...productForm, stock: e.target.value})} className="px-6 py-4 bg-gray-50 rounded-2xl outline-none w-full" />
                    </div>

                    {/* Weight and Volume */}
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-700">Çəki</label>
                      <div className="flex gap-2">
                        <input 
                          type="number" 
                          min="0" 
                          step="0.01" 
                          placeholder="Məs: 100" 
                          value={productForm.weightValue} 
                          onChange={e => setProductForm({...productForm, weightValue: e.target.value})} 
                          className="px-6 py-4 bg-gray-50 rounded-2xl outline-none w-full" 
                        />
                        <select 
                          value={productForm.weightUnit} 
                          onChange={e => setProductForm({...productForm, weightUnit: e.target.value})} 
                          className="px-4 py-4 bg-gray-50 rounded-2xl outline-none min-w-[80px]"
                        >
                          <option value="q">q</option>
                          <option value="kq">kq</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-700">Həcm</label>
                      <div className="flex gap-2">
                        <input 
                          type="number" 
                          min="0" 
                          step="0.01" 
                          placeholder="Məs: 250" 
                          value={productForm.volumeValue} 
                          onChange={e => setProductForm({...productForm, volumeValue: e.target.value})} 
                          className="px-6 py-4 bg-gray-50 rounded-2xl outline-none w-full" 
                        />
                        <select 
                          value={productForm.volumeUnit} 
                          onChange={e => setProductForm({...productForm, volumeUnit: e.target.value})} 
                          className="px-4 py-4 bg-gray-50 rounded-2xl outline-none min-w-[80px]"
                        >
                          <option value="ml">ml</option>
                          <option value="l">l</option>
                        </select>
                      </div>
                    </div>

                    {/* Textareas - Description, Ingredients, Usage */}
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-sm font-semibold text-gray-700">Məhsul Haqqında / Ətraflı Təsvir</label>
                      <textarea placeholder="Məhsul haqqında ətraflı təsvir" value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} className="px-6 py-4 bg-gray-50 rounded-2xl outline-none w-full" rows="3" />
                    </div>
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-sm font-semibold text-gray-700">Tərkibi</label>
                      <textarea placeholder="Məhsulun tərkibi" value={productForm.ingredients} onChange={e => setProductForm({...productForm, ingredients: e.target.value})} className="px-6 py-4 bg-gray-50 rounded-2xl outline-none w-full" rows="3" />
                    </div>
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-sm font-semibold text-gray-700">İstifadə Qaydası</label>
                      <textarea placeholder="Məhsulun istifadə qaydası" value={productForm.usage} onChange={e => setProductForm({...productForm, usage: e.target.value})} className="px-6 py-4 bg-gray-50 rounded-2xl outline-none w-full" rows="3" />
                    </div>

                    {/* Multiple Images URL */}
                    <div className="md:col-span-2 space-y-4">
                      <label className="text-sm font-semibold text-gray-700">Məhsul Şəkilləri (URL) *</label>
                      <div className="grid grid-cols-1 gap-4">
                        {productForm.images?.map((img, index) => (
                          <div key={index} className="flex gap-2">
                            <input 
                              placeholder={`Şəkil ${index + 1} URL`} 
                              value={img} 
                              onChange={e => {
                                const newImages = [...productForm.images];
                                newImages[index] = e.target.value;
                                setProductForm({...productForm, images: newImages});
                              }} 
                              className={`px-6 py-4 bg-gray-50 rounded-2xl outline-none flex-grow ${formErrors.images ? 'border border-red-500' : ''}`} 
                            />
                            {productForm.images.length > 1 && (
                              <button 
                                type="button"
                                onClick={() => {
                                  const newImages = productForm.images.filter((_, i) => i !== index);
                                  setProductForm({...productForm, images: newImages});
                                }}
                                className="px-4 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-all"
                              >
                                <Trash2 size={20} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      <button 
                        type="button"
                        onClick={() => setProductForm({...productForm, images: [...productForm.images, '']})}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-50 text-blue-600 font-bold rounded-xl hover:bg-blue-100 transition-all"
                      >
                        <Plus size={20} /> + Daha çox şəkil əlavə et
                      </button>
                      {formErrors.images && <p className="text-red-500 text-xs mt-1">{formErrors.images}</p>}
                    </div>

                    {/* Status Select */}
                    <div className="md:col-span-2 space-y-1 pt-4">
                      <label className="text-sm font-semibold text-gray-700">Məhsul Statusu</label>
                      <select 
                        value={productForm.status} 
                        onChange={(e) => setProductForm({...productForm, status: e.target.value})}
                        className={`w-full px-6 py-4 rounded-2xl outline-none ${
                          productForm.status === 'active' ? 'bg-[#dcfce7] text-[#15803d]' : 
                          productForm.status === 'passive' ? 'bg-[#e5e7eb] text-[#374151]' : 
                          'bg-[#fee2e2] text-[#dc2626]'
                        }`}
                      >
                        <option value="active">Aktiv</option>
                        <option value="passive">Passiv</option>
                        <option value="out_of_stock">Stokda yoxdur</option>
                      </select>
                    </div>
                    
                    {/* Boolean Filters */}
                    <div className="md:col-span-2 grid grid-cols-3 gap-4 pt-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={productForm.isInStock} onChange={e => setProductForm({...productForm, isInStock: e.target.checked})} className="w-4 h-4 text-pink-600 rounded" />
                        <span className="text-sm">Anbarda Var</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={productForm.isSuperPrice} onChange={e => setProductForm({...productForm, isSuperPrice: e.target.checked})} className="w-4 h-4 text-pink-600 rounded" />
                        <span className="text-sm">Super Qiymət</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={productForm.isNew} onChange={e => setProductForm({...productForm, isNew: e.target.checked})} className="w-4 h-4 text-pink-600 rounded" />
                        <span className="text-sm">Yeni</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={productForm.isDiscount} onChange={e => setProductForm({...productForm, isDiscount: e.target.checked})} className="w-4 h-4 text-pink-600 rounded" />
                        <span className="text-sm">Endirim</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={productForm.isPromotion} onChange={e => setProductForm({...productForm, isPromotion: e.target.checked})} className="w-4 h-4 text-pink-600 rounded" />
                        <span className="text-sm">Aksiya</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={productForm.isHit} onChange={e => setProductForm({...productForm, isHit: e.target.checked})} className="w-4 h-4 text-pink-600 rounded" />
                        <span className="text-sm">Hit</span>
                      </label>
                    </div>

                    {/* Collection, Product Type, Etc. */}
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-700">Seriya</label>
                      <div className="flex gap-2">
                        <select 
                          value={productForm.seriesId || ''}
                          onChange={(e) => {
                            const selectedSeries = series.find(s => s._id === e.target.value);
                            if (selectedSeries) {
                              setProductForm({
                                ...productForm,
                                seriesId: selectedSeries._id,
                                seriesName: selectedSeries.name,
                                seriesSlug: selectedSeries.slug
                              });
                            } else {
                              setProductForm({
                                ...productForm,
                                seriesId: null,
                                seriesName: '',
                                seriesSlug: ''
                              });
                            }
                          }}
                          className="flex-1 px-6 py-4 bg-gray-50 rounded-2xl outline-none"
                        >
                          <option value="">Seriya Seçin</option>
                          {series.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                        </select>
                        <span className="text-gray-500 text-sm flex items-center">və ya</span>
                        <input 
                          list="seriesList"
                          placeholder="Yeni Seriya Adı" 
                          value={productForm.seriesName} 
                          onChange={(e) => {
                            const selectedSeries = series.find(s => s.name === e.target.value);
                            if (selectedSeries) {
                              setProductForm({
                                ...productForm,
                                seriesId: selectedSeries._id,
                                seriesName: selectedSeries.name,
                                seriesSlug: selectedSeries.slug
                              });
                            } else {
                              setProductForm({
                                ...productForm,
                                seriesId: null,
                                seriesName: e.target.value,
                                seriesSlug: e.target.value ? e.target.value.toLowerCase().replace(/\s+/g, '-') : ''
                              });
                            }
                          }} 
                          className="flex-1 px-6 py-4 bg-gray-50 rounded-2xl outline-none" 
                        />
                      </div>
                      <datalist id="seriesList">
                        {series.map(s => <option key={s._id} value={s.name} />)}
                        {/* Also include the old collections for backward compatibility */}
                        {collections.map(c => <option key={c} value={c} />)}
                      </datalist>
                    </div>
                    <select value={productForm.productType} onChange={e => setProductForm({...productForm, productType: e.target.value})} className="px-6 py-4 bg-gray-50 rounded-2xl outline-none">
                      <option value="">Məhsul Növü Seçin</option>
                      {productTypes.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <select value={productForm.productEffect} onChange={e => setProductForm({...productForm, productEffect: e.target.value})} className="px-6 py-4 bg-gray-50 rounded-2xl outline-none">
                      <option value="">Məhsul Təsiri Seçin</option>
                      {productEffects.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <select value={productForm.skinType} onChange={e => setProductForm({...productForm, skinType: e.target.value})} className="px-6 py-4 bg-gray-50 rounded-2xl outline-none">
                      <option value="">Dərinin Tipi Seçin</option>
                      {skinTypes.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <select value={productForm.hairType} onChange={e => setProductForm({...productForm, hairType: e.target.value})} className="px-6 py-4 bg-gray-50 rounded-2xl outline-none">
                      <option value="">Saçların Tipi Seçin</option>
                      {hairTypes.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>

                    {/* Variants Section */}
                    <div className="md:col-span-2 space-y-4 pt-4">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold text-gray-700">Məhsul Variantları</label>
                        <button 
                          type="button" 
                          onClick={handleAddVariantClick}
                          className="flex items-center gap-2 px-4 py-2 bg-pink-100 text-pink-700 rounded-lg text-sm font-bold hover:bg-pink-200 transition-all"
                        >
                          <Plus size={16} /> Variant əlavə et
                        </button>
                      </div>

                      {productForm.variants?.map((variant, index) => {
                        const [isAccordionOpen, setIsAccordionOpen] = React.useState(false);
                        return (
                          <div key={index} className="bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-bold text-gray-700">Variant {index + 1}</span>
                              <button 
                                type="button"
                                onClick={() => removeVariant(index)}
                                className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-all"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-600">SKU *</label>
                                <input 
                                  placeholder="Variant SKU" 
                                  value={variant.sku}
                                  onChange={e => updateVariant(index, 'sku', e.target.value)}
                                  className="w-full px-4 py-3 bg-white  rounded-xl outline-none border border-gray-200"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-600">Variant Adı *</label>
                                <input 
                                  placeholder="Variant adı (rəng, ölçü və s.)" 
                                  value={variant.name}
                                  onChange={e => updateVariant(index, 'name', e.target.value)}
                                  className="w-full px-4 py-3 bg-white  rounded-xl outline-none border border-gray-200"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-600">Stok</label>
                                <input 
                                  type="number" 
                                  placeholder="Stok sayı" 
                                  value={variant.stock}
                                  onChange={e => updateVariant(index, 'stock', e.target.value)}
                                  className="w-full px-4 py-3 bg-white  rounded-xl outline-none border border-gray-200"
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-gray-600">Status</label>
                              <select 
                                value={variant.status}
                                onChange={e => updateVariant(index, 'status', e.target.value)}
                                className="w-full px-4 py-3 bg-white  rounded-xl outline-none border border-gray-200"
                              >
                                <option value="active">Aktiv</option>
                                <option value="passive">Passiv</option>
                                <option value="out_of_stock">Stokda yoxdur</option>
                              </select>
                            </div>

                            <div className="space-y-2">
                              <label className="text-xs font-semibold text-gray-600">Əsas şəkil</label>
                              <input 
                                placeholder="Variantın əsas şəkil linki" 
                                value={variant.image}
                                onChange={e => updateVariant(index, 'image', e.target.value)}
                                className="w-full px-4 py-3 bg-white  rounded-xl outline-none border border-gray-200"
                              />
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <label className="text-xs font-semibold text-gray-600">Əlavə şəkillər</label>
                                <button 
                                  type="button"
                                  onClick={() => addVariantImage(index)}
                                  className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                                >
                                  + Şəkil əlavə et
                                </button>
                              </div>
                              {variant.images.map((img, imgIndex) => (
                                <div key={imgIndex} className="flex gap-2">
                                  <input 
                                    placeholder="Şəkil linki" 
                                    value={img}
                                    onChange={e => updateVariantImage(index, imgIndex, e.target.value)}
                                    className="flex-1 px-4 py-3 bg-white  rounded-xl outline-none border border-gray-200"
                                  />
                                  <button 
                                    type="button"
                                    onClick={() => removeVariantImage(index, imgIndex)}
                                    className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-all"
                                  >
                                    <X size={18} />
                                  </button>
                                </div>
                              ))}
                            </div>

                            {/* Accordion for Advanced Variant Info */}
                            <div className="border-t border-gray-200 pt-4">
                              <button 
                                type="button"
                                onClick={() => setIsAccordionOpen(!isAccordionOpen)}
                                className="flex items-center justify-between w-full text-left text-sm font-semibold text-gray-700 hover:text-pink-600"
                              >
                                <span>Ətraflı variant məlumatları</span>
                                <ChevronRight size={18} className={`transition-transform ${isAccordionOpen ? 'rotate-90' : ''}`} />
                              </button>

                              {isAccordionOpen && (
                                <div className="mt-4 space-y-4">
                                  {/* Variant Description */}
                                  <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-600">Variant təsviri</label>
                                    <textarea 
                                      placeholder="Variant üçün xüsusi təsvir (boş buraxılırsa əsas məhsulun təsviri istifadə olunacaq)" 
                                      value={variant.description || ''}
                                      onChange={e => updateVariant(index, 'description', e.target.value)}
                                      className="w-full px-4 py-3 bg-white  rounded-xl outline-none border border-gray-200"
                                      rows="3"
                                    />
                                  </div>

                                  {/* Variant Ingredients */}
                                  <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-600">Variant tərkibi</label>
                                    <textarea 
                                      placeholder="Variant üçün xüsusi tərkib (boş buraxılırsa əsas məhsulun tərkibi istifadə olunacaq)" 
                                      value={variant.ingredients || ''}
                                      onChange={e => updateVariant(index, 'ingredients', e.target.value)}
                                      className="w-full px-4 py-3 bg-white  rounded-xl outline-none border border-gray-200"
                                      rows="3"
                                    />
                                  </div>

                                  {/* Variant Usage */}
                                  <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-600">Variant istifadə qaydası</label>
                                    <textarea 
                                      placeholder="Variant üçün xüsusi istifadə qaydası (boş buraxılırsa əsas məhsulun istifadə qaydası istifadə olunacaq)" 
                                      value={variant.usage || ''}
                                      onChange={e => updateVariant(index, 'usage', e.target.value)}
                                      className="w-full px-4 py-3 bg-white  rounded-xl outline-none border border-gray-200"
                                      rows="3"
                                    />
                                  </div>

                                  {/* Variant Weight */}
                                  <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-600">Variant çəkisi</label>
                                    <div className="flex gap-2">
                                      <input 
                                        type="number" 
                                        placeholder="Çəki dəyəri" 
                                        value={variant.weight?.value || ''}
                                        onChange={e => updateVariant(index, 'weight', { ...variant.weight, value: e.target.value ? parseFloat(e.target.value) : null })}
                                        className="flex-1 px-4 py-3 bg-white  rounded-xl outline-none border border-gray-200"
                                      />
                                      <select 
                                        value={variant.weight?.unit || 'q'}
                                        onChange={e => updateVariant(index, 'weight', { ...variant.weight, unit: e.target.value })}
                                        className="px-4 py-3 bg-white  rounded-xl outline-none border border-gray-200 min-w-[80px]"
                                      >
                                        <option value="q">q</option>
                                        <option value="kq">kq</option>
                                      </select>
                                    </div>
                                  </div>

                                  {/* Variant Volume */}
                                  <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-600">Variant həcmi</label>
                                    <div className="flex gap-2">
                                      <input 
                                        type="number" 
                                        placeholder="Həcm dəyəri" 
                                        value={variant.volume?.value || ''}
                                        onChange={e => updateVariant(index, 'volume', { ...variant.volume, value: e.target.value ? parseFloat(e.target.value) : null })}
                                        className="flex-1 px-4 py-3 bg-white  rounded-xl outline-none border border-gray-200"
                                      />
                                      <select 
                                        value={variant.volume?.unit || 'ml'}
                                        onChange={e => updateVariant(index, 'volume', { ...variant.volume, unit: e.target.value })}
                                        className="px-4 py-3 bg-white  rounded-xl outline-none border border-gray-200 min-w-[80px]"
                                      >
                                        <option value="ml">ml</option>
                                        <option value="l">l</option>
                                      </select>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <button type="submit" className="md:col-span-2 py-5 bg-pink-600 text-white font-bold rounded-2xl shadow-lg hover:bg-pink-700 transition-all">Yadda Saxla</button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'series' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Seriya İdarəetməsi</h2>
              <button onClick={() => { 
                setEditingSeries(null); 
                setSeriesForm({ name: '', slug: '', logo: '', bannerImage: '', description: '', isPopular: false, status: 'active', order: 0 }); 
                setIsSeriesModalOpen(true); 
              }} className="flex items-center gap-2 px-6 py-3 bg-pink-600 text-white font-bold rounded-xl hover:bg-pink-700 shadow-lg transition-all">
                <Plus size={20} /> Yeni Seriya
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {series.map(serie => (
                <div key={serie._id} className="bg-white  rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-r from-pink-100 to-purple-100 from-pink-900/30 to-purple-900/30">
                    {serie.bannerImage ? (
                      <img src={serie.bannerImage} alt={serie.name} className="w-full h-full object-cover" />
                    ) : serie.logo ? (
                      <div className="flex items-center justify-center h-full">
                        <img src={serie.logo} alt={serie.name} className="h-24 object-contain" />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Sparkles size={48} className="text-pink-300" />
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">{serie.name}</h3>
                    <div className="flex items-center gap-2 mb-4 flex-wrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${serie.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                        {serie.status === 'active' ? 'Aktiv' : 'Passiv'}
                      </span>
                      {serie.isPopular && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-600">
                          Populyar
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditingSeries(serie); setSeriesForm(serie); setIsSeriesModalOpen(true); }} className="flex-1 py-2 bg-blue-50 text-blue-600 font-semibold rounded-xl hover:bg-blue-100 transition-all">
                        <Edit3 size={16} className="inline mr-1" /> Redaktə Et
                      </button>
                      <button onClick={() => deleteSeries(serie._id)} className="flex-1 py-2 bg-red-50 text-red-600 font-semibold rounded-xl hover:bg-red-100 transition-all">
                        <Trash2 size={16} className="inline mr-1" /> Sil
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {isSeriesModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white  rounded-[40px] w-full max-w-3xl max-h-[90vh] overflow-y-auto p-12">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-8 gap-4">
                <div>
                  <h3 className="text-2xl font-bold">{editingSeries ? 'Seriyanı Redaktə Et' : 'Yeni Seriya'}</h3>
                </div>
                <button onClick={() => setIsSeriesModalOpen(false)}><X size={24} /></button>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); handleSeriesSubmit(); }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700">Seriya Adı *</label>
                  <input placeholder="Seriya Adı" value={seriesForm.name} onChange={e => setSeriesForm({...seriesForm, name: e.target.value})} className="px-6 py-4 bg-gray-50 rounded-2xl outline-none w-full" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700">Slug</label>
                  <input placeholder="slug" value={seriesForm.slug} onChange={e => setSeriesForm({...seriesForm, slug: e.target.value})} className="px-6 py-4 bg-gray-50 rounded-2xl outline-none w-full" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700">Logo Şəkil Linki</label>
                  <input placeholder="Logo linki" value={seriesForm.logo} onChange={e => setSeriesForm({...seriesForm, logo: e.target.value})} className="px-6 py-4 bg-gray-50 rounded-2xl outline-none w-full" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700">Banner Şəkil Linki</label>
                  <input placeholder="Banner linki" value={seriesForm.bannerImage} onChange={e => setSeriesForm({...seriesForm, bannerImage: e.target.value})} className="px-6 py-4 bg-gray-50 rounded-2xl outline-none w-full" />
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="text-sm font-semibold text-gray-700">Təsvir</label>
                  <textarea placeholder="Seriya haqqında təsvir" value={seriesForm.description} onChange={e => setSeriesForm({...seriesForm, description: e.target.value})} className="px-6 py-4 bg-gray-50 rounded-2xl outline-none w-full" rows="4" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700">Status</label>
                  <select value={seriesForm.status} onChange={e => setSeriesForm({...seriesForm, status: e.target.value})} className="px-6 py-4 bg-gray-50 rounded-2xl outline-none w-full">
                    <option value="active">Aktiv</option>
                    <option value="passive">Passiv</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700">Sıralama</label>
                  <input type="number" placeholder="Sıra" value={seriesForm.order} onChange={e => setSeriesForm({...seriesForm, order: parseInt(e.target.value) || 0})} className="px-6 py-4 bg-gray-50 rounded-2xl outline-none w-full" />
                </div>
                <div className="md:col-span-2 flex items-center gap-3">
                  <input type="checkbox" id="isPopular" checked={seriesForm.isPopular} onChange={e => setSeriesForm({...seriesForm, isPopular: e.target.checked})} className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500" />
                  <label htmlFor="isPopular" className="text-sm font-semibold text-gray-700 cursor-pointer">Populyar seriya kimi göstər</label>
                </div>
                <button type="submit" className="md:col-span-2 py-5 bg-pink-600 text-white font-bold rounded-2xl shadow-lg hover:bg-pink-700 transition-all">Yadda Saxla</button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'catalogs' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Kataloq İdarəetməsi</h2>
              <button onClick={() => { setEditingCatalog(null); setCatalogForm({ name: '', image: '', link: '', isActive: true }); setIsCatalogModalOpen(true); }} className="flex items-center gap-2 px-6 py-3 bg-pink-600 text-white font-bold rounded-xl hover:bg-pink-700 shadow-lg transition-all">
                <Plus size={20} /> Yeni Kataloq
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {catalogs.map(catalog => (
                <div key={catalog._id} className="bg-white  rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img src={catalog.image} alt={catalog.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">{catalog.name}</h3>
                    <div className="flex items-center gap-2 mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${catalog.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                        {catalog.isActive ? 'Aktiv' : 'Passiv'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditingCatalog(catalog); setCatalogForm(catalog); setIsCatalogModalOpen(true); }} className="flex-1 py-2 bg-blue-50 text-blue-600 font-semibold rounded-xl hover:bg-blue-100 transition-all">
                        <Edit3 size={16} className="inline mr-1" /> Redaktə Et
                      </button>
                      <button onClick={() => deleteCatalog(catalog._id)} className="flex-1 py-2 bg-red-50 text-red-600 font-semibold rounded-xl hover:bg-red-100 transition-all">
                        <Trash2 size={16} className="inline mr-1" /> Sil
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'catalog-cycles' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Kataloq Dövrləri İdarəetməsi</h2>
              <button onClick={() => { 
                setEditingCatalogCycle(null); 
                setCatalogCycleForm({ catalogNumber: '', title: '', startDate: '', endDate: '', isActive: true }); 
                setIsCatalogCycleModalOpen(true); 
              }} className="flex items-center gap-2 px-6 py-3 bg-pink-600 text-white font-bold rounded-xl hover:bg-pink-700 shadow-lg transition-all">
                <Plus size={20} /> Yeni Kataloq Dövrü
              </button>
            </div>
            <div className="bg-white  rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Kataloq Nömrəsi</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Başlıq</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Başlama Tarixi</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Bitmə Tarixi</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Əməliyyatlar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {catalogCycles.map(cycle => {
                      const now = new Date();
                      const start = new Date(cycle.startDate);
                      const end = new Date(cycle.endDate);
                      const isCurrentlyActive = cycle.isActive && now >= start && now <= end;
                      return (
                        <tr key={cycle._id} className="hover:bg-pink-50/30 transition-colors">
                          <td className="px-6 py-5">
                            <p className="text-sm font-bold text-gray-900">{cycle.catalogNumber}</p>
                          </td>
                          <td className="px-6 py-5 text-sm text-gray-700">{cycle.title}</td>
                          <td className="px-6 py-5 text-sm text-gray-700">{new Date(cycle.startDate).toLocaleDateString()}</td>
                          <td className="px-6 py-5 text-sm text-gray-700">{new Date(cycle.endDate).toLocaleDateString()}</td>
                          <td className="px-6 py-5">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${isCurrentlyActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                              {isCurrentlyActive ? 'Aktiv' : 'Passiv'}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => { 
                                  setEditingCatalogCycle(cycle); 
                                  setCatalogCycleForm({ 
                                    catalogNumber: cycle.catalogNumber, 
                                    title: cycle.title, 
                                    startDate: new Date(cycle.startDate).toISOString().split('T')[0], 
                                    endDate: new Date(cycle.endDate).toISOString().split('T')[0], 
                                    isActive: cycle.isActive 
                                  }); 
                                  setIsCatalogCycleModalOpen(true); 
                                }} 
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                              >
                                <Edit3 size={18} />
                              </button>
                              <button 
                                onClick={() => deleteCatalogCycle(cycle._id)} 
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Catalog Cycle Modal */}
        {isCatalogCycleModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white  rounded-[40px] w-full max-w-2xl p-12">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900">{editingCatalogCycle ? 'Kataloq Dövrünü Redaktə Et' : 'Yeni Kataloq Dövrü'}</h3>
                <button onClick={() => setIsCatalogCycleModalOpen(false)}><X size={24} /></button>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                if (editingCatalogCycle) {
                  updateCatalogCycle(editingCatalogCycle._id, catalogCycleForm);
                } else {
                  createCatalogCycle(catalogCycleForm);
                }
              }} className="space-y-6">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700">Kataloq Nömrəsi *</label>
                  <input 
                    placeholder="Məs: №08" 
                    value={catalogCycleForm.catalogNumber} 
                    onChange={(e) => setCatalogCycleForm({ ...catalogCycleForm, catalogNumber: e.target.value })}
                    className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700">Başlıq *</label>
                  <input 
                    placeholder="Kataloq başlığı" 
                    value={catalogCycleForm.title} 
                    onChange={(e) => setCatalogCycleForm({ ...catalogCycleForm, title: e.target.value })}
                    className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">Başlama Tarixi *</label>
                    <input 
                      type="date" 
                      value={catalogCycleForm.startDate} 
                      onChange={(e) => setCatalogCycleForm({ ...catalogCycleForm, startDate: e.target.value })}
                      className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">Bitmə Tarixi *</label>
                    <input 
                      type="date" 
                      value={catalogCycleForm.endDate} 
                      onChange={(e) => setCatalogCycleForm({ ...catalogCycleForm, endDate: e.target.value })}
                      className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={catalogCycleForm.isActive} 
                      onChange={(e) => setCatalogCycleForm({ ...catalogCycleForm, isActive: e.target.checked })}
                      className="w-5 h-5 text-pink-600 rounded"
                    />
                    <span className="text-sm font-semibold text-gray-700">Aktiv</span>
                  </label>
                </div>
                <button type="submit" className="w-full py-5 bg-pink-600 text-white font-bold rounded-2xl shadow-lg hover:bg-pink-700 transition-all">Yadda Saxla</button>
              </form>
            </div>
          </div>
        )}

        {/* Catalog Modal */}
        {isCatalogModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white  rounded-[40px] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-12">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold">{editingCatalog ? 'Kataloqu Redaktə Et' : 'Yeni Kataloq'}</h3>
                <button onClick={() => setIsCatalogModalOpen(false)}><X size={24} /></button>
              </div>
              <form onSubmit={handleCatalogSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <input placeholder="Kataloq Adı" value={catalogForm.name} onChange={e => setCatalogForm({...catalogForm, name: e.target.value})} className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none" required />
                </div>
                <div className="md:col-span-2">
                  <input placeholder="Şəkil URL" value={catalogForm.image} onChange={e => setCatalogForm({...catalogForm, image: e.target.value})} className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none" required />
                </div>
                <div className="md:col-span-2">
                  <input placeholder="Kataloq Linki" value={catalogForm.link} onChange={e => setCatalogForm({...catalogForm, link: e.target.value})} className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none" required />
                </div>
                <div className="md:col-span-2 flex items-center gap-3">
                  <input type="checkbox" checked={catalogForm.isActive} onChange={e => setCatalogForm({...catalogForm, isActive: e.target.checked})} className="w-5 h-5 text-pink-600 rounded" />
                  <label className="text-gray-700 font-medium">Aktiv Kataloq</label>
                </div>
                <button type="submit" className="md:col-span-2 py-5 bg-pink-600 text-white font-bold rounded-2xl shadow-lg hover:bg-pink-700 transition-all">Yadda Saxla</button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold">Sifarişlər</h2>
            <div className="bg-white  rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Sifariş No</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Müştəri</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Məbləğ</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Kataloq</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Ödəniş Metodu</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Ödəniş Statusu</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Ödəniş Son Tarixi</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Sifariş Statusu</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Tarix</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Əməllər</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {orders.map(order => (
                      <tr key={order._id}>
                        <td className="px-6 py-4 text-sm font-bold">#{order._id.slice(-6)}</td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold">{order.user?.name} {order.user?.surname}</p>
                          <p className="text-xs text-gray-400">{order.user?.email}</p>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-pink-600">{order.totalAmount} AZN</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{order.catalogNumber || '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {order.paymentMethod === 'card_transfer' ? 'Kart köçürməsi' : 'Kart köçürməsi'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${
                            order.paymentStatus === 'paid' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                          }`}>
                            {order.paymentStatus === 'paid' ? 'Ödənilib' : 'Ödənilməyib'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {order.paymentDeadline ? new Date(order.paymentDeadline).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-6 py-4">
                          <select 
                            value={order.orderStatus || order.status} 
                            onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                            className={`text-xs font-bold px-3 py-1 rounded-full border-none outline-none ${
                              order.orderStatus === 'pending_payment' ? 'bg-yellow-100 text-yellow-600' :
                              order.orderStatus === 'paid' ? 'bg-blue-100 text-blue-600' :
                              order.orderStatus === 'preparing' ? 'bg-purple-100 text-purple-600' :
                              order.orderStatus === 'shipped' ? 'bg-indigo-100 text-indigo-600' :
                              order.orderStatus === 'delivered' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            <option value="pending_payment">Ödəniş gözləməsində</option>
                            <option value="paid">Ödənilib</option>
                            <option value="preparing">Hazırlanır</option>
                            <option value="shipped">Yolda</option>
                            <option value="delivered">Çatdırıldı</option>
                            <option value="cancelled">Ləğv edildi</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 flex items-center gap-2">
                          {order.paymentStatus !== 'paid' && (
                            <button 
                              onClick={() => confirmPayment(order._id)}
                              className="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-all"
                              title="Ödənişi təsdiqlə"
                            >
                              <CheckCircle2 size={20} />
                            </button>
                          )}
                          <button 
                            onClick={() => setSelectedOrder(order)}
                            className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all"
                          >
                            <Eye size={20} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white  rounded-[40px] w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 md:p-12">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900">Sifariş Detalları</h3>
                <button onClick={() => setSelectedOrder(null)}><X size={24} /></button>
              </div>

              {/* Order Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Sifariş No</p>
                  <p className="text-lg font-bold text-gray-900">#{selectedOrder._id.slice(-6)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Sifariş Tarixi</p>
                  <p className="text-lg font-bold text-gray-900">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Müştəri</p>
                  <p className="text-lg font-bold text-gray-900">{selectedOrder.user?.name} {selectedOrder.user?.surname}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Email</p>
                  <p className="text-lg font-bold text-gray-900">{selectedOrder.user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Kataloq</p>
                  <p className="text-lg font-bold text-gray-900">{selectedOrder.catalogNumber || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Ödəniş Son Tarixi</p>
                  <p className="text-lg font-bold text-gray-900">
                    {selectedOrder.paymentDeadline ? new Date(selectedOrder.paymentDeadline).toLocaleDateString() : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Ödəniş Metodu</p>
                  <p className="text-lg font-bold text-gray-900">
                    {selectedOrder.paymentMethod === 'card_transfer' ? 'Kart köçürməsi' : 'Kart köçürməsi'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Ödəniş Statusu</p>
                  <p className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${selectedOrder.paymentStatus === 'paid' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                    {selectedOrder.paymentStatus === 'paid' ? 'Ödənilib' : 'Ödənilməyib'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Sifariş Statusu</p>
                  <p className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                    selectedOrder.orderStatus === 'pending_payment' ? 'bg-yellow-100 text-yellow-600' :
                    selectedOrder.orderStatus === 'paid' ? 'bg-blue-100 text-blue-600' :
                    selectedOrder.orderStatus === 'preparing' ? 'bg-purple-100 text-purple-600' :
                    selectedOrder.orderStatus === 'shipped' ? 'bg-indigo-100 text-indigo-600' :
                    selectedOrder.orderStatus === 'delivered' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {selectedOrder.orderStatus === 'pending_payment' ? 'Ödəniş gözləməsində' : 
                     selectedOrder.orderStatus === 'paid' ? 'Ödənilib' : 
                     selectedOrder.orderStatus === 'preparing' ? 'Hazırlanır' : 
                     selectedOrder.orderStatus === 'shipped' ? 'Yolda' : 
                     selectedOrder.orderStatus === 'delivered' ? 'Çatdırıldı' : 'Ləğv edildi'}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-8">
                <h4 className="text-xl font-bold text-gray-900 mb-4">Sifariş Edilən Məhsullar</h4>
                <div className="space-y-4">
                  {(() => {
                    // Check if we have items array
                    if (selectedOrder.items && selectedOrder.items.length > 0) {
                      return selectedOrder.items.map((item, index) => (
                        <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                          {item.image && (
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className="w-20 h-20 rounded-xl object-cover"
                            />
                          )}
                          <div className="flex-grow">
                            <p className="font-bold text-gray-900">{item.name}</p>
                            {item.sku && <p className="text-xs text-gray-500">SKU: {item.sku}</p>}
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Miqdar: {item.quantity} ədəd</p>
                            <p className="text-sm text-gray-500">1 ədəd: {item.price} AZN</p>
                            <p className="font-bold text-pink-600">Cəmi: {item.total} AZN</p>
                          </div>
                        </div>
                      ));
                    }
                    // Check if we have products array (backward compatibility)
                    else if (selectedOrder.products && selectedOrder.products.length > 0) {
                      return selectedOrder.products.map((p, index) => {
                        const item = {
                          productId: p.product?._id,
                          name: p.product?.name || 'Məhsul adı yoxdur',
                          sku: p.product?.sku,
                          image: p.product?.images?.[0] || p.product?.image,
                          price: p.price,
                          quantity: p.quantity,
                          total: p.price * p.quantity
                        };
                        
                        return (
                          <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                            {item.image && (
                              <img 
                                src={item.image} 
                                alt={item.name} 
                                className="w-20 h-20 rounded-xl object-cover"
                              />
                            )}
                            <div className="flex-grow">
                              <p className="font-bold text-gray-900">{item.name}</p>
                              {item.sku && <p className="text-xs text-gray-500">SKU: {item.sku}</p>}
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-500">Miqdar: {item.quantity} ədəd</p>
                              <p className="text-sm text-gray-500">1 ədəd: {item.price} AZN</p>
                              <p className="font-bold text-pink-600">Cəmi: {item.total} AZN</p>
                            </div>
                          </div>
                        );
                      });
                    }
                    // If no items at all
                    else {
                      return (
                        <div className="p-8 bg-gray-50 rounded-2xl text-center">
                          <p className="text-gray-500">Bu sifarişdə məhsul məlumatı yoxdur</p>
                        </div>
                      );
                    }
                  })()}
                </div>
              </div>

              {/* Total Amount */}
              <div className="p-6 bg-pink-50 rounded-3xl">
                <div className="flex justify-between items-center">
                <p className="text-lg font-bold text-gray-900">Ümumi Məbləğ</p>
                <p className="text-2xl font-bold text-pink-600">{selectedOrder.totalAmount} AZN</p>
              </div>
                {selectedOrder.notes && (
                  <div className="mt-4 pt-4 border-t border-pink-100">
                    <p className="text-sm text-gray-500 mb-1">Qeyd</p>
                    <p className="text-gray-900">{selectedOrder.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold">Müştərilər</h2>
            <div className="bg-white  rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Ad Soyad</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">İstifadəçi Adı</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Qeydiyyat</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {users.map(u => (
                    <tr key={u._id}>
                      <td className="px-6 py-4 text-sm font-bold">{u.name} {u.surname}</td>
                      <td className="px-6 py-4 text-sm">@{u.username}</td>
                      <td className="px-6 py-4 text-sm">{u.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'chats' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-white  rounded-3xl border border-gray-100 overflow-hidden shadow-sm flex flex-col h-[600px]">
              <div className="p-6 border-b bg-pink-50 font-bold">Aktiv Söhbətlər</div>
              <div className="divide-y overflow-y-auto">
                {activeChats.map(chat => (
                  <div key={chat._id} className={`w-full p-4 hover:bg-pink-50 ${selectedChat?._id === chat._id ? 'bg-pink-50 border-l-4 border-pink-600' : ''}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-sm">{chat.userSnapshot?.fullName || 'Müştəri'}</p>
                        <p className="text-xs text-gray-500 truncate">{chat.userSnapshot?.email}</p>
                        <p className="text-xs text-gray-400 truncate">{chat.lastMessage}</p>
                        {chat.unreadCount > 0 && (
                          <span className="inline-block mt-1 px-2 py-1 bg-pink-600 text-white text-[10px] font-bold rounded-full">{chat.unreadCount} yeni</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button 
                        onClick={() => handleSelectChat(chat)} 
                        className="flex-1 py-2 bg-blue-50 text-blue-600 font-semibold rounded-xl text-xs hover:bg-blue-100 transition-all"
                      >
                        Detallar
                      </button>
                      <button 
                        onClick={() => hideChat(chat._id)} 
                        className="flex-1 py-2 bg-gray-100 text-gray-600 font-semibold rounded-xl text-xs hover:bg-gray-200 transition-all"
                      >
                        Gizlət
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-2 bg-white  rounded-3xl border border-gray-100 flex flex-col h-[600px] shadow-sm">
              {selectedChat ? (
                <>
                  <div className="p-6 bg-pink-600 text-white rounded-t-3xl flex justify-between items-center">
                    <div>
                      <p className="font-bold">{selectedChat.userSnapshot?.fullName || 'Müştəri'}</p>
                      <p className="text-pink-200 text-xs">{selectedChat.userSnapshot?.email} • {selectedChat.userSnapshot?.phone}</p>
                    </div>
                    <div className="flex gap-2">
                      {!selectedChat.adminIntervened && <button onClick={() => joinChat(selectedChat._id)} className="px-4 py-2 bg-white  text-pink-600 rounded-xl font-bold text-sm">Söhbətə Qoşul</button>}
                      <button 
                        onClick={() => hideChat(selectedChat._id)} 
                        className="px-4 py-2 bg-red-100 text-red-600 rounded-xl font-bold text-sm"
                      >
                        Söhbəti Gizlət
                      </button>
                    </div>
                  </div>
                  <div className="flex-grow p-6 overflow-y-auto space-y-4 bg-pink-50/10">
                    {selectedChat.messages.map((m, i) => (
                      <div key={m._id || i} className={`flex ${m.senderType === 'user' ? 'justify-start' : 'justify-end'}`}>
                        <div className={`p-4 rounded-2xl max-w-[70%] ${
                          m.senderType === 'user' ? 'bg-white ' : 
                          m.senderType === 'admin' ? 'bg-pink-600 text-white' : 
                          'bg-gray-200'
                        }`}>
                          <p className="text-[10px] font-bold opacity-50 uppercase">{m.senderType}</p>
                          <p className="text-sm">{m.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <form onSubmit={sendMessage} className="p-6 border-t flex gap-4">
                    <input value={adminMessage} onChange={e => setAdminMessage(e.target.value)} placeholder="Mesaj..." className="flex-grow px-6 py-3 bg-gray-50 rounded-xl outline-none" />
                    <button type="submit" disabled={!adminMessage.trim()} className="p-3 bg-pink-600 text-white rounded-xl shadow-lg"><Send size={24} /></button>
                  </form>
                </>
              ) : <div className="flex-grow flex items-center justify-center text-gray-400">Söhbət seçin</div>}
            </div>
          </div>
        )}
      </main>

      {/* Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white  rounded-[40px] w-full max-w-5xl max-h-[90vh] overflow-y-auto p-12">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-8 gap-4">
              <div>
                <h3 className="text-2xl font-bold">{editingProduct ? 'Redaktə Et' : 'Yeni Məhsul'}</h3>
                {prefilledCategory && (
                  <p className="text-sm text-gray-500 mt-2">
                    Məhsul əlavə olunur: 
                    <span className="font-semibold text-pink-600 ml-2">
                      {prefilledCategory.categoryName}
                      {prefilledCategory.subCategoryName && ` / ${prefilledCategory.subCategoryName}`}
                      {prefilledCategory.childCategoryName && ` / ${prefilledCategory.childCategoryName}`}
                    </span>
                  </p>
                )}
              </div>
              <button onClick={() => {
                setIsProductModalOpen(false);
                setPrefilledCategory(null);
              }}><X size={24} /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleProductSubmit(); }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Form Errors */}
              {Object.keys(formErrors).length > 0 && (
                <div className="md:col-span-2 bg-red-50 border border-red-200 rounded-2xl p-4">
                  <h4 className="text-red-800 font-bold mb-2">Xətalar var:</h4>
                  <ul className="list-disc list-inside text-red-700 text-sm">
                    {Object.values(formErrors).map((err, idx) => <li key={idx}>{err}</li>)}
                  </ul>
                </div>
              )}
              
              {/* Basic Info */}
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Məhsul Adı *</label>
                <input placeholder="Məhsul Adı" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} className={`px-6 py-4 bg-gray-50 rounded-2xl outline-none w-full ${formErrors.name ? 'border border-red-500' : ''}`} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">SKU / Artikul *</label>
                <input placeholder="SKU" value={productForm.sku} onChange={e => setProductForm({...productForm, sku: e.target.value})} className={`px-6 py-4 bg-gray-50 rounded-2xl outline-none w-full ${formErrors.sku ? 'border border-red-500' : ''}`} />
              </div>

              {/* Multiple Categories (Compact Version) - Only show if not prefilled from category page */}
              {!prefilledCategory ? (
                <div className="md:col-span-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-gray-700">Kateqoriyalar *</label>
                    {!showAddCategoryMode && (
                      <button 
                        type="button" 
                        onClick={addCategory}
                        className="px-3 py-2 bg-pink-100 text-pink-700 rounded-lg text-sm font-bold hover:bg-pink-200 transition-all flex items-center gap-1"
                      >
                        <Plus size={16} />
                        Kateqoriya əlavə et
                      </button>
                    )}
                  </div>
                  
                  {formErrors.categories && (
                    <p className="text-red-500 text-sm">{formErrors.categories}</p>
                  )}

                  {/* Category Chips */}
                  <div className="flex flex-wrap gap-2">
                    {(productForm.categories || []).map((cat, index) => (
                      <div 
                        key={index} 
                        className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-full text-sm border border-gray-200"
                      >
                        <span className="text-gray-700">
                          {cat.categoryName}
                          {cat.subCategoryName && ` / ${cat.subCategoryName}`}
                          {cat.childCategoryName && ` / ${cat.childCategoryName}`}
                        </span>
                        <button 
                          type="button" 
                          onClick={() => removeCategory(index)}
                          className="w-5 h-5 rounded-full text-gray-500 hover:bg-gray-200 hover:text-red-600 flex items-center justify-center transition-all"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add Category Mode */}
                  {showAddCategoryMode && (
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* Main Category */}
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-700">Əsas Kateqoriya *</label>
                          <select 
                            value={tempCategory.categoryName} 
                            onChange={(e) => {
                              const selectedCat = categoryData.find(c => c.name === e.target.value);
                              setTempCategory({
                                ...tempCategory,
                                categoryName: selectedCat ? selectedCat.name : '',
                                categorySlug: selectedCat ? selectedCat.slug : '',
                                subCategoryName: '',
                                subCategorySlug: '',
                                childCategoryName: '',
                                childCategorySlug: ''
                              });
                            }}
                            className="px-4 py-3 bg-white  rounded-xl outline-none w-full border border-gray-200"
                          >
                            <option value="">Əsas Kateqoriya Seçin</option>
                            {Array.isArray(categoryData) && categoryData.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                          </select>
                        </div>

                        {/* Sub Category */}
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-700">Alt Kateqoriya *</label>
                          <select 
                            disabled={!tempCategory.categoryName}
                            value={tempCategory.subCategoryName} 
                            onChange={(e) => {
                              const selectedCat = categoryData.find(c => c.name === tempCategory.categoryName);
                              const selectedSub = selectedCat?.subCategories?.find(s => s.name === e.target.value);
                              setTempCategory({
                                ...tempCategory,
                                subCategoryName: selectedSub ? selectedSub.name : '',
                                subCategorySlug: selectedSub ? selectedSub.slug : '',
                                childCategoryName: '',
                                childCategorySlug: ''
                              });
                            }}
                            className="px-4 py-3 bg-white  rounded-xl outline-none w-full border border-gray-200"
                          >
                            <option value="">Alt Kateqoriya Seçin</option>
                            {Array.isArray(categoryData.find(c => c.name === tempCategory.categoryName)?.subCategories) && 
                              categoryData.find(c => c.name === tempCategory.categoryName)?.subCategories?.map(sub => (
                                <option key={sub.name} value={sub.name}>{sub.name}</option>
                              ))}
                          </select>
                        </div>

                        {/* Child Category */}
                        {(() => {
                          const selectedCategory = categoryData.find(c => c.name === tempCategory.categoryName);
                          const selectedSubCategory = selectedCategory?.subCategories?.find(s => s.name === tempCategory.subCategoryName);
                          const hasChildren = selectedSubCategory?.childCategories?.length > 0;
                          
                          if (!hasChildren) return null;
                          
                          return (
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-gray-700">Child Kateqoriya</label>
                              <select 
                                value={tempCategory.childCategoryName} 
                                onChange={(e) => {
                                  const selectedCat = categoryData.find(c => c.name === tempCategory.categoryName);
                                  const selectedSub = selectedCat?.subCategories?.find(s => s.name === tempCategory.subCategoryName);
                                  const selectedChild = selectedSub?.childCategories?.find(ch => ch.name === e.target.value);
                                  setTempCategory({
                                    ...tempCategory,
                                    childCategoryName: selectedChild ? selectedChild.name : '',
                                    childCategorySlug: selectedChild ? selectedChild.slug : ''
                                  });
                                }}
                                className="px-4 py-3 bg-white  rounded-xl outline-none w-full border border-gray-200"
                              >
                                <option value="">Child Kateqoriya Seçin</option>
                                {Array.isArray(selectedSubCategory?.childCategories) && 
                                  selectedSubCategory?.childCategories?.map(child => (
                                    <option key={child.name} value={child.name}>{child.name}</option>
                                  ))}
                              </select>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 justify-end">
                        <button 
                          type="button" 
                          onClick={() => setShowAddCategoryMode(false)}
                          className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-300 transition-all"
                        >
                          İmtina et
                        </button>
                        <button 
                          type="button" 
                          onClick={saveTempCategory}
                          className="px-3 py-2 bg-pink-600 text-white rounded-lg text-sm font-bold hover:bg-pink-700 transition-all"
                        >
                          Kateqoriyanı əlavə et
                        </button>
                      </div>
                    </div>
                  )}

                  {/* If no categories and not adding, show a message */}
                  {(productForm.categories || []).length === 0 && !showAddCategoryMode && (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-xl">
                      <p className="text-gray-500 text-sm">Kateqoriya əlavə etmək üçün yuxarıdakı düyməni basın</p>
                    </div>
                  )}
                </div>
              ) : (
                // If prefilled, just show the category chip without add/remove options
                <div className="md:col-span-2 space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {(productForm.categories || []).map((cat, index) => (
                      <div 
                        key={index} 
                        className="flex items-center gap-2 bg-pink-100 text-pink-700 px-3 py-2 rounded-full text-sm border border-pink-200"
                      >
                        <span>
                          {cat.categoryName}
                          {cat.subCategoryName && ` / ${cat.subCategoryName}`}
                          {cat.childCategoryName && ` / ${cat.childCategoryName}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Styles for number inputs */}
              <style>{numberInputStyles}</style>
              
              {/* Prices */}
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Köhnə qiymət / Kataloq qiyməti</label>
                <input 
                  type="number" 
                  min="0" 
                  step="0.01" 
                  inputMode="decimal" 
                  placeholder="Kataloq Qiyməti" 
                  value={productForm.price_catalog} 
                  onChange={e => {
                    let val = e.target.value;
                    if (val < 0) val = 0;
                    const newForm = {...productForm, price_catalog: val};
                    // Auto calculate sale price if discount exists
                    if (newForm.price_catalog && newForm.discountPercent) {
                      const oldPrice = parseFloat(newForm.price_catalog);
                      const discount = parseFloat(newForm.discountPercent);
                      newForm.price_sale = (oldPrice - (oldPrice * discount / 100)).toFixed(2);
                    }
                    setProductForm(newForm);
                  }} 
                  className={`px-6 py-4 bg-gray-50 rounded-2xl outline-none w-full ${formErrors.price_catalog ? 'border border-red-500' : ''}`} 
                />
                {formErrors.price_catalog && <p className="text-red-500 text-xs mt-1">{formErrors.price_catalog}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Endirim faizi %</label>
                <input 
                  type="number" 
                  min="0" 
                  max="100" 
                  step="0.01" 
                  inputMode="decimal" 
                  placeholder="Endirim faizi" 
                  value={productForm.discountPercent} 
                  onChange={e => {
                    let val = e.target.value;
                    if (val < 0) val = 0;
                    if (val > 100) val = 100;
                    const newForm = {...productForm, discountPercent: val};
                    // Auto calculate sale price
                    if (newForm.price_catalog) {
                      const oldPrice = parseFloat(newForm.price_catalog);
                      const discount = parseFloat(newForm.discountPercent || 0);
                      newForm.price_sale = (oldPrice - (oldPrice * discount / 100)).toFixed(2);
                    }
                    setProductForm(newForm);
                  }} 
                  className="px-6 py-4 bg-gray-50 rounded-2xl outline-none w-full" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Satış Qiyməti *</label>
                <input 
                  type="number" 
                  min="0" 
                  step="0.01" 
                  inputMode="decimal" 
                  placeholder="Satış Qiyməti" 
                  value={productForm.price_sale} 
                  onChange={e => {
                    let val = e.target.value;
                    if (val < 0) val = 0;
                    setProductForm({...productForm, price_sale: val});
                  }} 
                  className={`px-6 py-4 bg-gray-50 rounded-2xl outline-none w-full ${formErrors.price_sale ? 'border border-red-500' : ''}`} 
                />
                {formErrors.price_sale && <p className="text-red-500 text-xs mt-1">{formErrors.price_sale}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Anbar Qiyməti</label>
                <input 
                  type="number" 
                  min="0" 
                  step="0.01" 
                  inputMode="decimal" 
                  placeholder="Anbar Qiyməti" 
                  value={productForm.price_anbar} 
                  onChange={e => {
                    let val = e.target.value;
                    if (val < 0) val = 0;
                    setProductForm({...productForm, price_anbar: val});
                  }} 
                  className={`px-6 py-4 bg-gray-50 rounded-2xl outline-none w-full ${formErrors.price_anbar ? 'border border-red-500' : ''}`} 
                />
                {formErrors.price_anbar && <p className="text-red-500 text-xs mt-1">{formErrors.price_anbar}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Stok Sayı</label>
                <input type="number" min="0" placeholder="Stok" value={productForm.stock} onChange={e => setProductForm({...productForm, stock: e.target.value})} className="px-6 py-4 bg-gray-50 rounded-2xl outline-none w-full" />
              </div>

              {/* Weight and Volume */}
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Çəki</label>
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    min="0" 
                    step="0.01" 
                    placeholder="Məs: 100" 
                    value={productForm.weightValue} 
                    onChange={e => setProductForm({...productForm, weightValue: e.target.value})} 
                    className="px-6 py-4 bg-gray-50 rounded-2xl outline-none w-full" 
                  />
                  <select 
                    value={productForm.weightUnit} 
                    onChange={e => setProductForm({...productForm, weightUnit: e.target.value})} 
                    className="px-4 py-4 bg-gray-50 rounded-2xl outline-none min-w-[80px]"
                  >
                    <option value="q">q</option>
                    <option value="kq">kq</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Həcm</label>
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    min="0" 
                    step="0.01" 
                    placeholder="Məs: 250" 
                    value={productForm.volumeValue} 
                    onChange={e => setProductForm({...productForm, volumeValue: e.target.value})} 
                    className="px-6 py-4 bg-gray-50 rounded-2xl outline-none w-full" 
                  />
                  <select 
                    value={productForm.volumeUnit} 
                    onChange={e => setProductForm({...productForm, volumeUnit: e.target.value})} 
                    className="px-4 py-4 bg-gray-50 rounded-2xl outline-none min-w-[80px]"
                  >
                    <option value="ml">ml</option>
                    <option value="l">l</option>
                  </select>
                </div>
              </div>

              {/* Textareas - Description, Ingredients, Usage */}
              <div className="md:col-span-2 space-y-1">
                <label className="text-sm font-semibold text-gray-700">Məhsul Haqqında / Ətraflı Təsvir</label>
                <textarea placeholder="Məhsul haqqında ətraflı təsvir" value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} className="px-6 py-4 bg-gray-50 rounded-2xl outline-none w-full" rows="3" />
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-sm font-semibold text-gray-700">Tərkibi</label>
                <textarea placeholder="Məhsulun tərkibi" value={productForm.ingredients} onChange={e => setProductForm({...productForm, ingredients: e.target.value})} className="px-6 py-4 bg-gray-50 rounded-2xl outline-none w-full" rows="3" />
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-sm font-semibold text-gray-700">İstifadə Qaydası</label>
                <textarea placeholder="Məhsulun istifadə qaydası" value={productForm.usage} onChange={e => setProductForm({...productForm, usage: e.target.value})} className="px-6 py-4 bg-gray-50 rounded-2xl outline-none w-full" rows="3" />
              </div>

              {/* Common Images URL */}
              <div className="md:col-span-2 space-y-4">
                <label className="text-sm font-semibold text-gray-700">Ümumi Məhsul Şəkilləri (URL) *</label>
                <div className="grid grid-cols-1 gap-4">
                  {productForm.commonImages?.map((img, index) => (
                    <div key={index} className="flex gap-2">
                      <input 
                        placeholder={`Ümumi şəkil ${index + 1} URL`} 
                        value={img} 
                        onChange={e => {
                          const newCommonImages = [...productForm.commonImages];
                          newCommonImages[index] = e.target.value;
                          setProductForm({...productForm, commonImages: newCommonImages});
                        }} 
                        className={`px-6 py-4 bg-gray-50 rounded-2xl outline-none flex-grow ${formErrors.images ? 'border border-red-500' : ''}`} 
                      />
                      {productForm.commonImages.length > 1 && (
                        <button 
                          type="button"
                          onClick={() => {
                            const newCommonImages = productForm.commonImages.filter((_, i) => i !== index);
                            setProductForm({...productForm, commonImages: newCommonImages});
                          }}
                          className="px-4 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-all"
                        >
                          <Trash2 size={20} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button 
                  type="button"
                  onClick={() => setProductForm({...productForm, commonImages: [...productForm.commonImages, '']})}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-50 text-blue-600 font-bold rounded-xl hover:bg-blue-100 transition-all"
                >
                  <Plus size={20} /> + Daha çox ümumi şəkil əlavə et
                </button>
                {formErrors.images && <p className="text-red-500 text-xs mt-1">{formErrors.images}</p>}
              </div>

              {/* Backward compatibility: Old images section (for existing products without commonImages) */}
              <div className="md:col-span-2 space-y-4">
                <label className="text-sm font-semibold text-gray-500">Köhnə Şəkillər (geriyə uyğunluq üçün)</label>
                <div className="grid grid-cols-1 gap-4">
                  {productForm.images?.map((img, index) => (
                    <div key={index} className="flex gap-2">
                      <input 
                        placeholder={`Köhnə şəkil ${index + 1} URL`} 
                        value={img} 
                        onChange={e => {
                          const newImages = [...productForm.images];
                          newImages[index] = e.target.value;
                          setProductForm({...productForm, images: newImages});
                        }} 
                        className="px-6 py-4 bg-gray-100 rounded-2xl outline-none flex-grow" 
                      />
                      {productForm.images.length > 1 && (
                        <button 
                          type="button"
                          onClick={() => {
                            const newImages = productForm.images.filter((_, i) => i !== index);
                            setProductForm({...productForm, images: newImages});
                          }}
                          className="px-4 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-all"
                        >
                          <Trash2 size={20} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button 
                  type="button"
                  onClick={() => setProductForm({...productForm, images: [...productForm.images, '']})}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-all"
                >
                  <Plus size={20} /> + Daha çox köhnə şəkil əlavə et
                </button>
              </div>

              {/* Status Select */}
              <div className="md:col-span-2 space-y-1 pt-4">
                <label className="text-sm font-semibold text-gray-700">Məhsul Statusu</label>
                <select 
                  value={productForm.status} 
                  onChange={(e) => setProductForm({...productForm, status: e.target.value})}
                  className={`w-full px-6 py-4 rounded-2xl outline-none ${
                    productForm.status === 'active' ? 'bg-[#dcfce7] text-[#15803d]' : 
                    productForm.status === 'passive' ? 'bg-[#e5e7eb] text-[#374151]' : 
                    'bg-[#fee2e2] text-[#dc2626]'
                  }`}
                >
                  <option value="active">Aktiv</option>
                  <option value="passive">Passiv</option>
                  <option value="out_of_stock">Stokda yoxdur</option>
                </select>
              </div>
              
              {/* Boolean Filters */}
              <div className="md:col-span-2 grid grid-cols-3 gap-4 pt-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={productForm.isInStock} onChange={e => setProductForm({...productForm, isInStock: e.target.checked})} className="w-4 h-4 text-pink-600 rounded" />
                  <span className="text-sm">Anbarda Var</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={productForm.isSuperPrice} onChange={e => setProductForm({...productForm, isSuperPrice: e.target.checked})} className="w-4 h-4 text-pink-600 rounded" />
                  <span className="text-sm">Super Qiymət</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={productForm.isNew} onChange={e => setProductForm({...productForm, isNew: e.target.checked})} className="w-4 h-4 text-pink-600 rounded" />
                  <span className="text-sm">Yeni</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={productForm.isDiscount} onChange={e => setProductForm({...productForm, isDiscount: e.target.checked})} className="w-4 h-4 text-pink-600 rounded" />
                  <span className="text-sm">Endirim</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={productForm.isPromotion} onChange={e => setProductForm({...productForm, isPromotion: e.target.checked})} className="w-4 h-4 text-pink-600 rounded" />
                  <span className="text-sm">Aksiya</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={productForm.isHit} onChange={e => setProductForm({...productForm, isHit: e.target.checked})} className="w-4 h-4 text-pink-600 rounded" />
                  <span className="text-sm">Hit</span>
                </label>
              </div>

              {/* Collection, Product Type, Etc. */}
              <input 
                list="seriesList"
                placeholder="Seriya Adı" 
                value={productForm.seriesName} 
                onChange={e => setProductForm({
                  ...productForm, 
                  seriesName: e.target.value
                })} 
                className="px-6 py-4 bg-gray-50 rounded-2xl outline-none" 
              />
              <datalist id="seriesList">
                {series.map(s => <option key={s._id} value={s.name} />)}
                {/* Also include the old collections for backward compatibility */}
                {collections.map(c => <option key={c} value={c} />)}
              </datalist>
              <select value={productForm.productType} onChange={e => setProductForm({...productForm, productType: e.target.value})} className="px-6 py-4 bg-gray-50 rounded-2xl outline-none">
                <option value="">Məhsul Növü Seçin</option>
                {productTypes.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <select value={productForm.productEffect} onChange={e => setProductForm({...productForm, productEffect: e.target.value})} className="px-6 py-4 bg-gray-50 rounded-2xl outline-none">
                <option value="">Məhsul Təsiri Seçin</option>
                {productEffects.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <select value={productForm.skinType} onChange={e => setProductForm({...productForm, skinType: e.target.value})} className="px-6 py-4 bg-gray-50 rounded-2xl outline-none">
                <option value="">Dərinin Tipi Seçin</option>
                {skinTypes.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={productForm.hairType} onChange={e => setProductForm({...productForm, hairType: e.target.value})} className="px-6 py-4 bg-gray-50 rounded-2xl outline-none">
                <option value="">Saçların Tipi Seçin</option>
                {hairTypes.map(h => <option key={h} value={h}>{h}</option>)}
              </select>

              {/* Variants Section */}
              <div className="md:col-span-2 space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-700">Məhsul Variantları</label>
                  <button 
                    type="button" 
                    onClick={handleAddVariantClick}
                    className="flex items-center gap-2 px-4 py-2 bg-pink-100 text-pink-700 rounded-lg text-sm font-bold hover:bg-pink-200 transition-all"
                  >
                    <Plus size={16} /> Variant əlavə et
                  </button>
                </div>

                {/* Variant Chips */}
                <div className="flex flex-wrap gap-2">
                  {productForm.variants?.map((variant, index) => (
                    <div 
                      key={index} 
                      className="flex items-center gap-2 bg-gray-100 px-4 py-3 rounded-full text-sm border border-gray-200"
                    >
                      {variant.variantImage || variant.image ? (
                        <img src={variant.variantImage || variant.image} alt={variant.name} className="w-8 h-8 rounded-full object-cover" />
                      ) : null}
                      <span className="font-semibold text-gray-800">{variant.sku}</span>
                      <span className="text-gray-600">/ {variant.name}</span>
                      <button 
                        type="button"
                        onClick={() => handleEditVariantClick(index)}
                        className="p-1 text-blue-500 hover:bg-blue-100 rounded-full transition-all"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button 
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="p-1 text-red-500 hover:bg-red-100 rounded-full transition-all"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add/Edit Variant Form */}
                {showAddVariantForm && (
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-gray-700">{editingVariantIndex !== null ? 'Variantı Redaktə Et' : 'Yeni Variant Əlavə Et'}</span>
                      <button 
                        type="button"
                        onClick={() => {
                          setShowAddVariantForm(false);
                          setEditingVariantIndex(null);
                          setTempVariant({
                            sku: '',
                            name: '',
                            image: '',
                            variantImage: '',
                            images: [''],
                            stock: '',
                            status: 'active',
                            description: '',
                            ingredients: '',
                            usage: '',
                            weight: { value: null, unit: 'q' },
                            volume: { value: null, unit: 'ml' }
                          });
                          setIsTempAccordionOpen(false);
                        }}
                        className="p-2 text-gray-500 hover:bg-gray-200 rounded-lg transition-all"
                      >
                        <X size={18} />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-600">SKU *</label>
                        <input 
                          placeholder="Variant SKU" 
                          value={tempVariant.sku}
                          onChange={e => setTempVariant({...tempVariant, sku: e.target.value})}
                          className="w-full px-4 py-3 bg-white  rounded-xl outline-none border border-gray-200"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-600">Variant Adı *</label>
                        <input 
                          placeholder="Variant adı (rəng, ölçü və s.)" 
                          value={tempVariant.name}
                          onChange={e => setTempVariant({...tempVariant, name: e.target.value})}
                          className="w-full px-4 py-3 bg-white  rounded-xl outline-none border border-gray-200"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-600">Stok</label>
                        <input 
                          type="number" 
                          placeholder="Stok sayı" 
                          value={tempVariant.stock}
                          onChange={e => setTempVariant({...tempVariant, stock: e.target.value})}
                          className="w-full px-4 py-3 bg-white  rounded-xl outline-none border border-gray-200"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-600">Status</label>
                      <select 
                        value={tempVariant.status}
                        onChange={e => setTempVariant({...tempVariant, status: e.target.value})}
                        className="w-full px-4 py-3 bg-white  rounded-xl outline-none border border-gray-200"
                      >
                        <option value="active">Aktiv</option>
                        <option value="passive">Passiv</option>
                        <option value="out_of_stock">Stokda yoxdur</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-600">Variant Şəkli (variantImage)</label>
                      <input 
                        placeholder="Variantın şəkil linki" 
                        value={tempVariant.variantImage}
                        onChange={e => setTempVariant({...tempVariant, variantImage: e.target.value})}
                        className="w-full px-4 py-3 bg-white  rounded-xl outline-none border border-gray-200"
                      />
                    </div>

                    {/* Backward compatibility: Old variant image field */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-500">Köhnə Variant Şəkli (geriyə uyğunluq üçün)</label>
                      <input 
                        placeholder="Köhnə variant şəkil linki" 
                        value={tempVariant.image}
                        onChange={e => setTempVariant({...tempVariant, image: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-100 rounded-xl outline-none border border-gray-200"
                      />
                    </div>

                    {/* Backward compatibility: Old variant images array */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-gray-500">Köhnə Əlavə Şəkillər (geriyə uyğunluq üçün)</label>
                        <button 
                          type="button"
                          onClick={() => setTempVariant({...tempVariant, images: [...tempVariant.images, '']})}
                          className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                        >
                          + Şəkil əlavə et
                        </button>
                      </div>
                      {tempVariant.images.map((img, imgIndex) => (
                        <div key={imgIndex} className="flex gap-2">
                          <input 
                            placeholder="Şəkil linki" 
                            value={img}
                            onChange={e => {
                              const newImages = [...tempVariant.images];
                              newImages[imgIndex] = e.target.value;
                              setTempVariant({...tempVariant, images: newImages});
                            }}
                            className="flex-1 px-4 py-3 bg-gray-100 rounded-xl outline-none border border-gray-200"
                          />
                          {tempVariant.images.length > 1 && (
                            <button 
                              type="button"
                              onClick={() => {
                                const newImages = tempVariant.images.filter((_, i) => i !== imgIndex);
                                setTempVariant({...tempVariant, images: newImages});
                              }}
                              className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-all"
                            >
                              <X size={18} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Accordion for Advanced Variant Info (tempVariant) */}
                    <div className="border-t border-gray-200 pt-4">
                      {/* We need to add state for accordion, but since we can't add state in render, let's use a useState call here? Wait no, let's create a state variable for this accordion! Wait, let's first add a state variable [isTempAccordionOpen, setIsTempAccordionOpen]! */}
                      {/* Wait let's first add the state, then use it! */}
                      <button 
                        type="button"
                        onClick={() => setIsTempAccordionOpen(!isTempAccordionOpen)}
                        className="flex items-center justify-between w-full text-left text-sm font-semibold text-gray-700 hover:text-pink-600"
                      >
                        <span>Ətraflı variant məlumatları</span>
                        <ChevronRight size={18} className={`transition-transform ${isTempAccordionOpen ? 'rotate-90' : ''}`} />
                      </button>

                      {isTempAccordionOpen && (
                        <div className="mt-4 space-y-4">
                          {/* Variant Description */}
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-600">Variant təsviri</label>
                            <textarea 
                              placeholder="Variant üçün xüsusi təsvir (boş buraxılırsa əsas məhsulun təsviri istifadə olunacaq)" 
                              value={tempVariant.description || ''}
                              onChange={e => setTempVariant({...tempVariant, description: e.target.value})}
                              className="w-full px-4 py-3 bg-white  rounded-xl outline-none border border-gray-200"
                              rows="3"
                            />
                          </div>

                          {/* Variant Ingredients */}
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-600">Variant tərkibi</label>
                            <textarea 
                              placeholder="Variant üçün xüsusi tərkib (boş buraxılırsa əsas məhsulun tərkibi istifadə olunacaq)" 
                              value={tempVariant.ingredients || ''}
                              onChange={e => setTempVariant({...tempVariant, ingredients: e.target.value})}
                              className="w-full px-4 py-3 bg-white  rounded-xl outline-none border border-gray-200"
                              rows="3"
                            />
                          </div>

                          {/* Variant Usage */}
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-600">Variant istifadə qaydası</label>
                            <textarea 
                              placeholder="Variant üçün xüsusi istifadə qaydası (boş buraxılırsa əsas məhsulun istifadə qaydası istifadə olunacaq)" 
                              value={tempVariant.usage || ''}
                              onChange={e => setTempVariant({...tempVariant, usage: e.target.value})}
                              className="w-full px-4 py-3 bg-white  rounded-xl outline-none border border-gray-200"
                              rows="3"
                            />
                          </div>

                          {/* Variant Weight */}
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-600">Variant çəkisi</label>
                            <div className="flex gap-2">
                              <input 
                                type="number" 
                                placeholder="Çəki dəyəri" 
                                value={tempVariant.weight?.value || ''}
                                onChange={e => setTempVariant({
                                  ...tempVariant, 
                                  weight: { 
                                    ...tempVariant.weight, 
                                    value: e.target.value ? parseFloat(e.target.value) : null 
                                  }
                                })}
                                className="flex-1 px-4 py-3 bg-white  rounded-xl outline-none border border-gray-200"
                              />
                              <select 
                                value={tempVariant.weight?.unit || 'q'}
                                onChange={e => setTempVariant({
                                  ...tempVariant, 
                                  weight: { 
                                    ...tempVariant.weight, 
                                    unit: e.target.value 
                                  }
                                })}
                                className="px-4 py-3 bg-white  rounded-xl outline-none border border-gray-200 min-w-[80px]"
                              >
                                <option value="q">q</option>
                                <option value="kq">kq</option>
                              </select>
                            </div>
                          </div>

                          {/* Variant Volume */}
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-600">Variant həcmi</label>
                            <div className="flex gap-2">
                              <input 
                                type="number" 
                                placeholder="Həcm dəyəri" 
                                value={tempVariant.volume?.value || ''}
                                onChange={e => setTempVariant({
                                  ...tempVariant, 
                                  volume: { 
                                    ...tempVariant.volume, 
                                    value: e.target.value ? parseFloat(e.target.value) : null 
                                  }
                                })}
                                className="flex-1 px-4 py-3 bg-white  rounded-xl outline-none border border-gray-200"
                              />
                              <select 
                                value={tempVariant.volume?.unit || 'ml'}
                                onChange={e => setTempVariant({
                                  ...tempVariant, 
                                  volume: { 
                                    ...tempVariant.volume, 
                                    unit: e.target.value 
                                  }
                                })}
                                className="px-4 py-3 bg-white  rounded-xl outline-none border border-gray-200 min-w-[80px]"
                              >
                                <option value="ml">ml</option>
                                <option value="l">l</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 justify-end pt-2">
                      <button 
                        type="button"
                        onClick={() => {
                          setShowAddVariantForm(false);
                          setEditingVariantIndex(null);
                          setTempVariant({
                            sku: '',
                            name: '',
                            image: '',
                            variantImage: '',
                            images: [''],
                            stock: '',
                            status: 'active',
                            description: '',
                            ingredients: '',
                            usage: '',
                            weight: { value: null, unit: 'q' },
                            volume: { value: null, unit: 'ml' }
                          });
                          setIsTempAccordionOpen(false);
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-300 transition-all"
                      >
                        İmtina et
                      </button>
                      <button 
                        type="button"
                        onClick={saveVariant}
                        className="px-4 py-2 bg-pink-600 text-white rounded-lg text-sm font-bold hover:bg-pink-700 transition-all"
                      >
                        {editingVariantIndex !== null ? 'Yadda Saxla' : 'Əlavə Et'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button type="submit" className="md:col-span-2 py-5 bg-pink-600 text-white font-bold rounded-2xl shadow-lg hover:bg-pink-700 transition-all">Yadda Saxla</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
