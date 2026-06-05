import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  Package, 
  MessageSquare, 
  Settings, 
  Download, 
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
  BookOpen
} from 'lucide-react';
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
import { toast } from 'react-toastify';

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
  const [activeTab, setActiveTab] = useState('overview');
  const [activeChats, setActiveChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [adminMessage, setAdminMessage] = useState('');
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
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
  const [productForm, setProductForm] = useState({
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
    sku: '',
    stock: '',
    isActive: true,
    image: '',
    isInStock: true,
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
    ingredients: '',
    usage: ''
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
    if (activeTab === 'products') fetchProducts();
    if (activeTab === 'catalogs') fetchCatalogs();
    if (activeTab === 'orders') fetchOrders();
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'overview') fetchStats();
  }, [activeTab]);

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

  const updateOrderStatus = async (orderId, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://127.0.0.1:5000/api/orders/${orderId}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchOrders();
      toast.success('Sifariş statusu yeniləndi');
    } catch (error) {
      toast.error('Xəta baş verdi');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success('Çıxış edildi');
    navigate('/login');
    window.dispatchEvent(new Event('storage'));
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

  const handleImportCSV = async (e) => {
    e.preventDefault();
    console.log('🔍 Step 1: Selected file:', csvFile); // Debug log 1
    
    if (!csvFile) {
      toast.error('Zəhmət olmasa bir CSV faylı seçin');
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

      toast.success(`${response.data.imported} məhsul uğurla import edildi!`);
      setCsvFile(null);
      fetchProducts();
    } catch (error) {
      console.error('❌ Import error:', error);
      console.error('❌ Error details:', error.response?.data);
      toast.error(error.response?.data?.error || 'Import edərkən xəta baş verdi');
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
    if (!productForm.categoryName.trim()) errors.categoryName = 'Əsas kateqoriya mütləqdir';
    if (!productForm.subCategoryName.trim()) errors.subCategoryName = 'Alt kateqoriya mütləqdir';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});

    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      // Convert prices to numbers
      const productData = {
        ...productForm,
        price_sale: parseFloat(productForm.price_sale) || 0,
        price_catalog: productForm.price_catalog ? parseFloat(productForm.price_catalog) : 0,
        price_anbar: productForm.price_anbar ? parseFloat(productForm.price_anbar) : 0
      };
      
      if (editingProduct) {
        await axios.put(`http://127.0.0.1:5000/api/products/${editingProduct._id}`, productData, config);
      } else {
        await axios.post('http://127.0.0.1:5000/api/products', productData, config);
      }
      setIsProductModalOpen(false);
      setEditingProduct(null);
      setProductForm({
        name: '', description: '', price_catalog: '', price_anbar: '', price_sale: '',
        categoryName: '', categorySlug: '', subCategoryName: '', subCategorySlug: '',
        childCategoryName: '', childCategorySlug: '', sku: '', stock: '', isActive: true,
        image: '', isInStock: true, isSuperPrice: false, isNew: false, isDiscount: false,
        isPromotion: false, isHit: false, collection: '', productType: '', productEffect: '',
        skinType: '', hairType: '', ingredients: '', usage: ''
      });
      fetchProducts();
      toast.success('Məhsul yadda saxlanıldı');
    } catch (error) {
      console.error('Error submitting product:', error.response?.data || error.message);
      toast.error(error.response?.data?.error || 'Xəta baş verdi');
    }
  };

  const toggleProductStatus = async (product) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://127.0.0.1:5000/api/products/${product._id}`, {
        isActive: !product.isActive
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchProducts();
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Bu məhsulu silmək istədiyinizə əminsiniz?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://127.0.0.1:5000/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchProducts();
      toast.success('Məhsul silindi');
    } catch (error) {
      toast.error('Xəta baş verdi');
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
      toast.success('Kataloq yadda saxlanıldı');
    } catch (error) {
      toast.error('Xəta baş verdi');
    }
  };

  const deleteCatalog = async (id) => {
    if (!window.confirm('Bu kataloqu silmək istədiyinizə əminsiniz?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://127.0.0.1:5000/api/catalogs/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCatalogs();
      toast.success('Kataloq silindi');
    } catch (error) {
      toast.error('Xəta baş verdi');
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

  const handleSelectChat = (chat) => {
    setSelectedChat({ ...chat, messages: [] });
    loadChatMessages(chat._id);
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
    { label: 'AI Söhbətləri', value: statsData.aiChats, icon: <MessageSquare size={24} />, color: 'bg-pink-50 text-pink-600', trend: '+18%', trendColor: 'text-green-500' },
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
              { id: 'products', label: 'Məhsullar', icon: <Package size={20} /> },
              { id: 'catalogs', label: 'Kataloqlar', icon: <BookOpen size={20} /> },
              { id: 'orders', label: 'Sifarişlər', icon: <Clock size={20} /> },
              { id: 'users', label: 'Müştərilər', icon: <Users size={20} /> },
              { id: 'chats', label: 'AI Söhbətlər', icon: <MessageSquare size={20} /> },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold transition-all ${
                  activeTab === item.id 
                    ? 'bg-pink-600 text-white shadow-lg shadow-pink-200' 
                    : 'text-gray-500 hover:bg-pink-50 hover:text-pink-600'
                }`}
              >
                {item.icon}
                {item.label}
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
        <div className="lg:hidden grid grid-cols-6 p-2 bg-white">
          {[
            { id: 'overview', label: 'Baxış', icon: <LayoutGrid size={20} /> },
            { id: 'products', label: 'Məhsullar', icon: <Package size={20} /> },
            { id: 'catalogs', label: 'Kataloqlar', icon: <BookOpen size={20} /> },
            { id: 'orders', label: 'Sifarişlər', icon: <Clock size={20} /> },
            { id: 'users', label: 'Müştərilər', icon: <Users size={20} /> },
            { id: 'chats', label: 'AI', icon: <MessageSquare size={20} /> },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl transition-all ${
                activeTab === item.id 
                  ? 'text-pink-600' 
                  : 'text-gray-500'
              }`}
            >
              {item.icon}
              <span className="text-[10px] font-medium mt-1">{item.label}</span>
            </button>
          ))}
        </div>
      </aside>

      <main className="flex-grow p-4 md:p-8 lg:p-12 overflow-x-hidden">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-500 mt-1">İdarəetmə və analiz paneli.</p>
          </div>
        </header>

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
                  <h3 className="text-xl font-bold mb-8">Gəlir Analizi</h3>
                  {getRevenueChartData() ? (
                    <div className="h-80"><Bar data={getRevenueChartData()} options={{ maintainAspectRatio: false }} /></div>
                  ) : (
                    <div className="h-80 flex items-center justify-center">
                      <p className="text-gray-500">Hələ satış məlumatı yoxdur</p>
                    </div>
                  )}
                </div>
                <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm">
                  <h3 className="text-xl font-bold mb-8">Ən Çox Satılanlar</h3>
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

        {activeTab === 'products' && (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <h2 className="text-2xl font-bold text-gray-900">Məhsul İdarəetməsi</h2>
              <div className="flex flex-col md:flex-row gap-4">
                {/* CSV Import */}
                <form onSubmit={handleImportCSV} className="flex items-center gap-2">
                  <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-xl cursor-pointer hover:bg-gray-200 transition-all">
                    <FileText size={18} />
                    {csvFile ? csvFile.name : 'CSV Seç'}
                    <input 
                      type="file" 
                      accept=".csv" 
                      className="hidden" 
                      onChange={(e) => setCsvFile(e.target.files[0])}
                    />
                  </label>
                  <button 
                    type="submit" 
                    disabled={importing || !csvFile}
                    className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all"
                  >
                    {importing ? 'Import olunur...' : 'Import Et'}
                  </button>
                </form>

                {/* New Product Button */}
                <button onClick={() => { 
                  setEditingProduct(null); 
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
                    sku: '', 
                    stock: '', 
                    isActive: true, 
                    image: '', 
                    isInStock: true, 
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
                    ingredients: '',
                    usage: ''
                  }); 
                  setFormErrors({});
                  setIsProductModalOpen(true); 
                }} className="flex items-center gap-2 px-6 py-3 bg-pink-600 text-white font-bold rounded-xl hover:bg-pink-700 shadow-lg transition-all">
                  <Plus size={20} /> Yeni Məhsul
                </button>
              </div>
            </div>
            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Məhsul</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Kateqoriya</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Qiymət</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Stok</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Əməliyyatlar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {products.map(product => (
                      <tr key={product._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 flex items-center gap-3">
                          <img src={product.image} className="w-10 h-10 rounded-lg object-cover" />
                          <div><p className="text-sm font-bold">{product.name}</p><p className="text-xs text-gray-400">SKU: {product.sku}</p></div>
                        </td>
                        <td className="px-6 py-4 text-sm">{product.category}</td>
                        <td className="px-6 py-4 text-sm font-bold text-pink-600">{product.price_sale} AZN</td>
                        <td className="px-6 py-4 text-sm">{product.stock}</td>
                        <td className="px-6 py-4">
                          <button onClick={() => toggleProductStatus(product)} className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${product.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>{product.isActive ? 'Aktiv' : 'Passiv'}</button>
                        </td>
                        <td className="px-6 py-4 flex gap-2">
                          <button 
                    onClick={() => { 
                      setEditingProduct(product); 
                      // Initialize form with product data, falling back to defaults
                      setProductForm({
                        name: product.name || '',
                        description: product.description || '',
                        price_catalog: product.price_catalog || '',
                        price_anbar: product.price_anbar || '',
                        price_sale: product.price_sale || '',
                        categoryName: product.categoryName || product.category || '',
                        categorySlug: product.categorySlug || '',
                        subCategoryName: product.subCategoryName || '',
                        subCategorySlug: product.subCategorySlug || '',
                        childCategoryName: product.childCategoryName || '',
                        childCategorySlug: product.childCategorySlug || '',
                        sku: product.sku || '',
                        stock: product.stock || '',
                        isActive: product.isActive !== false,
                        image: product.image || '',
                        isInStock: product.isInStock !== false,
                        isSuperPrice: product.isSuperPrice === true,
                        isNew: product.isNew === true,
                        isDiscount: product.isDiscount === true,
                        isPromotion: product.isPromotion === true,
                        isHit: product.isHit === true,
                        collection: product.collection || '',
                        productType: product.productType || '',
                        productEffect: product.productEffect || '',
                        skinType: product.skinType || '',
                        hairType: product.hairType || '',
                        ingredients: product.ingredients || '',
                        usage: product.usage || ''
                      }); 
                      setIsProductModalOpen(true); 
                    }} 
                    className="text-gray-400 hover:text-blue-600"
                  >
                    <Edit3 size={18} />
                  </button>
                          <button onClick={() => deleteProduct(product._id)} className="text-gray-400 hover:text-red-600"><Trash2 size={18} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {isProductModalOpen && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                <div className="bg-white rounded-[40px] w-full max-w-5xl max-h-[90vh] overflow-y-auto p-12">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-bold">{editingProduct ? 'Redaktə Et' : 'Yeni Məhsul'}</h3>
                    <button onClick={() => setIsProductModalOpen(false)}><X size={24} /></button>
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

                    {/* Category Selects - All 3 */}
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-700">Əsas Kateqoriya *</label>
                      <select 
                        value={productForm.categoryName} 
                        onChange={(e) => {
                          const selectedCat = categoryData.find(cat => cat.name === e.target.value);
                          setProductForm({
                            ...productForm,
                            categoryName: selectedCat ? selectedCat.name : '',
                            categorySlug: selectedCat ? selectedCat.slug : '',
                            subCategoryName: '',
                            subCategorySlug: '',
                            childCategoryName: '',
                            childCategorySlug: ''
                          });
                        }}
                        className={`px-6 py-4 bg-gray-50 rounded-2xl outline-none w-full ${formErrors.categoryName ? 'border border-red-500' : ''}`}
                      >
                        <option value="">Əsas Kateqoriya Seçin</option>
                        {Array.isArray(categoryData) && categoryData.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-700">Alt Kateqoriya *</label>
                      <select 
                        disabled={!productForm.categoryName}
                        value={productForm.subCategoryName} 
                        onChange={(e) => {
                          const selectedCat = categoryData.find(cat => cat.name === productForm.categoryName);
                          const selectedSub = selectedCat?.subCategories?.find(sub => sub.name === e.target.value);
                          setProductForm({
                            ...productForm,
                            subCategoryName: selectedSub ? selectedSub.name : '',
                            subCategorySlug: selectedSub ? selectedSub.slug : '',
                            childCategoryName: '',
                            childCategorySlug: ''
                          });
                        }}
                        className={`px-6 py-4 bg-gray-50 rounded-2xl outline-none w-full ${formErrors.subCategoryName ? 'border border-red-500' : ''}`}
                      >
                        <option value="">Alt Kateqoriya Seçin</option>
                        {Array.isArray(categoryData.find(c => c.name === productForm.categoryName)?.subCategories) && 
                          categoryData.find(c => c.name === productForm.categoryName)?.subCategories?.map(sub => (
                            <option key={sub.name} value={sub.name}>{sub.name}</option>
                          ))}
                      </select>
                    </div>

                    {(() => {
                      const selectedCategory = categoryData.find(c => c.name === productForm.categoryName);
                      const selectedSubCategory = selectedCategory?.subCategories?.find(sub => sub.name === productForm.subCategoryName);
                      const hasChildren = selectedSubCategory?.childCategories?.length > 0;

                      if (!hasChildren) return null;

                      return (
                        <div className="space-y-1">
                          <label className="text-sm font-semibold text-gray-700">Child Kateqoriya</label>
                          <select 
                            value={productForm.childCategoryName} 
                            onChange={(e) => {
                              const selectedCat = categoryData.find(cat => cat.name === productForm.categoryName);
                              const selectedSub = selectedCat?.subCategories?.find(sub => sub.name === productForm.subCategoryName);
                              const selectedChild = selectedSub?.childCategories?.find(child => child.name === e.target.value);
                              setProductForm({
                                ...productForm,
                                childCategoryName: selectedChild ? selectedChild.name : '',
                                childCategorySlug: selectedChild ? selectedChild.slug : ''
                              });
                            }}
                            className={`px-6 py-4 bg-gray-50 rounded-2xl outline-none w-full ${formErrors.childCategoryName ? 'border border-red-500' : ''}`}
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

                    {/* Styles for number inputs */}
                    <style>{numberInputStyles}</style>
                    
                    {/* Prices */}
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
                      <label className="text-sm font-semibold text-gray-700">Kataloq Qiyməti</label>
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
                          setProductForm({...productForm, price_catalog: val});
                        }} 
                        className={`px-6 py-4 bg-gray-50 rounded-2xl outline-none w-full ${formErrors.price_catalog ? 'border border-red-500' : ''}`} 
                      />
                      {formErrors.price_catalog && <p className="text-red-500 text-xs mt-1">{formErrors.price_catalog}</p>}
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

                    {/* Image URL */}
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-sm font-semibold text-gray-700">Şəkil URL</label>
                      <input placeholder="Şəkil URL" value={productForm.image} onChange={e => setProductForm({...productForm, image: e.target.value})} className="px-6 py-4 bg-gray-50 rounded-2xl outline-none w-full" />
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
                    <select value={productForm.collection} onChange={e => setProductForm({...productForm, collection: e.target.value})} className="px-6 py-4 bg-gray-50 rounded-2xl outline-none">
                      <option value="">Seriya Seçin</option>
                      {collections.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
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

                    <button type="submit" className="md:col-span-2 py-5 bg-pink-600 text-white font-bold rounded-2xl shadow-lg hover:bg-pink-700 transition-all">Yadda Saxla</button>
                  </form>
                </div>
              </div>
            )}
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
                <div key={catalog._id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
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
            {isCatalogModalOpen && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                <div className="bg-white rounded-[40px] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-12">
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
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold">Sifarişlər</h2>
            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Sifariş No</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Müştəri</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Məbləğ</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Tarix</th>
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
                      <td className="px-6 py-4">
                        <select 
                          value={order.status} 
                          onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                          className={`text-xs font-bold px-3 py-1 rounded-full border-none outline-none ${
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-600' : 
                            order.status === 'delivered' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                          }`}
                        >
                          <option value="pending">Gözləmədə</option>
                          <option value="processing">Hazırlanır</option>
                          <option value="shipped">Yolda</option>
                          <option value="delivered">Çatdırıldı</option>
                          <option value="cancelled">Ləğv edildi</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold">Müştərilər</h2>
            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
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
            <div className="lg:col-span-1 bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm flex flex-col h-[600px]">
              <div className="p-6 border-b bg-pink-50 font-bold">Aktiv Söhbətlər</div>
              <div className="divide-y overflow-y-auto">
                {activeChats.map(chat => (
                  <button key={chat._id} onClick={() => handleSelectChat(chat)} className={`w-full p-6 text-left hover:bg-pink-50 ${selectedChat?._id === chat._id ? 'bg-pink-50 border-l-4 border-pink-600' : ''}`}>
                    <p className="font-bold">{chat.user?.name || 'Anonim'} {chat.user?.surname || ''}</p>
                    <p className="text-xs text-gray-400 truncate">{chat.lastMessage}</p>
                    {chat.unreadCount > 0 && (
                      <span className="inline-block mt-1 px-2 py-1 bg-pink-600 text-white text-[10px] font-bold rounded-full">{chat.unreadCount} yeni</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
            <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 flex flex-col h-[600px] shadow-sm">
              {selectedChat ? (
                <>
                  <div className="p-6 bg-pink-600 text-white rounded-t-3xl flex justify-between items-center">
                    <p className="font-bold">{selectedChat.user?.name || 'Anonim'} {selectedChat.user?.surname || ''}</p>
                    {!selectedChat.adminIntervened && <button onClick={() => joinChat(selectedChat._id)} className="px-4 py-2 bg-white text-pink-600 rounded-xl font-bold text-sm">Söhbətə Qoşul</button>}
                  </div>
                  <div className="flex-grow p-6 overflow-y-auto space-y-4 bg-pink-50/10">
                    {selectedChat.messages.map((m, i) => (
                      <div key={m._id || i} className={`flex ${m.senderType === 'user' ? 'justify-start' : 'justify-end'}`}>
                        <div className={`p-4 rounded-2xl max-w-[70%] ${
                          m.senderType === 'user' ? 'bg-white' : 
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
    </div>
  );
};

export default AdminDashboard;
