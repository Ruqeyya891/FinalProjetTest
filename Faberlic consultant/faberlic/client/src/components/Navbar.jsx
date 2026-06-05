import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, User, Bot, LayoutDashboard, Search, BookOpen, LogOut, Menu, X } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'react-toastify';

const Navbar = ({ isAdmin }) => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileCategoryOpen, setMobileCategoryOpen] = useState(null);
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success('Çıxış edildi');
    navigate('/login');
    window.dispatchEvent(new Event('storage'));
  };

  const categories = [
    {
      name: 'YENİ MƏHSULLAR',
      subCategories: []
    },
    {
      name: 'QULLUQ',
      subCategories: [
        {
          name: 'Üz qulluğu',
          items: ['Aksesuarlar', 'Dodaq balzamları', 'Gecə kremləri', 'Göz qapaqları və kirpiklər üçün vasitələr', 'Gündüz kremləri', 'Günəşdən qorunma', 'Skrablar, pilinqlər', 'Təmizləmə və demakiyaj', 'Zərdablar, konsentratlar', 'Üz üçün maskalar']
        },
        {
          name: 'Bədənə qulluq',
          items: ['Aksesuarlar', 'Ayaqlar üçün vasitələr', 'Bədən quruluşunun korreksiyası', 'Depilyasiya vasitələri', 'Dezodorantlar', 'Günəşdən qorunma vasitələri', 'Kremlər, süd', 'Vanna və duş üçün', 'Əllər üçün vasitələr']
        },
        {
          name: 'Saçlar',
          items: ['Aksesuarlar', 'Balzamlar, maskalar', 'Boyama', 'Saç boyaları', 'Saç düzləşdirmə vasitələri', 'Saç rəng açıcıları', 'Xüsusi qulluq', 'Şampunlar']
        }
      ]
    },
    {
      name: 'MAKIYAJ',
      subCategories: [
        {
          name: 'Gözlər',
          items: ['Göz kölgələri', 'Kirpik tuşu', 'Qələmlər, layner']
        },
        {
          name: 'Dodaqlar',
          items: ['Dodaq boyaları', 'Parladıcılar, balzamlar', 'Qələmlər', 'Sınaq nümunələri']
        },
        {
          name: 'Üz',
          items: ['BB krem', 'Bronzerlər, haylayterlər', 'Kirşan', 'Korrektorlar, konsilerlər', 'Tonal təməllər və kuşonlar', 'Ənlik']
        },
        {
          name: 'Dırnaqlar',
          items: ['Baza, top, dırnaq boyasının çıxarılması', 'Dırnaq aksesuarları', 'Dırnaq boyaları', 'Qulluq vasitələri']
        },
        {
          name: 'Qaşlar',
          items: []
        }
      ]
    },
    { name: 'PARFÜMERİYA', subCategories: [] },
    { name: 'DƏB', subCategories: [] },
    { name: 'SAĞLAMLIQ', subCategories: [] },
    { name: 'EV', subCategories: [] },
    { name: 'UŞAQLARA', subCategories: [] },
    { name: 'BİZNES', subCategories: [] },
    { name: 'AKSİYALAR', subCategories: [] },
    { name: 'ENDİRİM', subCategories: [] }
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      {/* Top Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center gap-4">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex flex-col">
              <span className="text-2xl sm:text-3xl font-light tracking-widest text-black">FABERLIC</span>
              <span className="text-[8px] sm:text-[10px] font-bold tracking-[0.2em] text-gray-500">BE YOUR BEST</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden p-2 text-gray-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>

          {/* Desktop Action Icons */}
          <div className="hidden lg:flex items-center space-x-4 xl:space-x-6">
            <Link to="/catalogs" className="flex flex-col items-center group">
              <BookOpen size={22} className="text-gray-700 group-hover:text-pink-600" />
              <span className="text-[9px] xl:text-[10px] mt-1 font-medium">Kataloq</span>
            </Link>
            <Link to="/favorites" className="flex flex-col items-center group">
              <Heart size={22} className="text-gray-700 group-hover:text-pink-600" />
              <span className="text-[9px] xl:text-[10px] mt-1 font-medium">Seçilmişlər</span>
            </Link>
            <Link to="/cart" className="flex flex-col items-center group">
              <ShoppingCart size={22} className="text-gray-700 group-hover:text-pink-600" />
              <span className="text-[9px] xl:text-[10px] mt-1 font-medium">Səbət</span>
            </Link>
            
            {!token ? (
              <Link to="/login" className="flex flex-col items-center group">
                <User size={22} className="text-gray-700 group-hover:text-pink-600" />
                <span className="text-[9px] xl:text-[10px] mt-1 font-medium">Giriş</span>
              </Link>
            ) : (
              <>
                {isAdmin ? (
                  <Link to="/admin" className="flex flex-col items-center group">
                    <LayoutDashboard size={22} className="text-pink-600" />
                    <span className="text-[9px] xl:text-[10px] mt-1 font-bold text-pink-600">Admin</span>
                  </Link>
                ) : (
                  <Link to="/dashboard" className="flex flex-col items-center group">
                    <User size={22} className="text-gray-700 group-hover:text-pink-600" />
                    <span className="text-[9px] xl:text-[10px] mt-1 font-medium">Profil</span>
                  </Link>
                )}
                <button onClick={handleLogout} className="flex flex-col items-center group">
                  <LogOut size={22} className="text-gray-700 group-hover:text-red-600" />
                  <span className="text-[9px] xl:text-[10px] mt-1 font-medium">Çıxış</span>
                </button>
              </>
            )}

            <Link to="/ai-advisor" className="flex flex-col items-center group">
              <Bot size={22} className="text-pink-600 animate-pulse" />
              <span className="text-[9px] xl:text-[10px] mt-1 font-medium text-pink-600">AI</span>
            </Link>
          </div>
        </div>

        {/* Search Bar - Mobile & Desktop */}
        <div className="mt-4 lg:mt-0 lg:max-w-2xl">
          <div className="relative group">
            <input
              type="text"
              placeholder="Faberlic məhsulları axtarışı"
              className="w-full bg-gray-50 border border-gray-200 rounded-sm py-2 px-4 pr-10 focus:outline-none focus:border-pink-500 transition-colors text-sm"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-pink-600" size={20} />
          </div>
        </div>
      </div>

      {/* Categories Bar - Desktop */}
      <div className="border-t border-gray-100 hidden lg:block">
        <div className="max-w-7xl mx-auto px-4">
          <ul className="flex justify-between items-center h-12">
            {categories.map((cat) => (
              <li
                key={cat.name}
                className="relative h-full flex items-center group"
                onMouseEnter={() => setActiveCategory(cat.name)}
                onMouseLeave={() => setActiveCategory(null)}
              >
                <Link
                  to={`/products?category=${cat.name}`}
                  className="text-[10px] xl:text-[11px] font-bold tracking-wider text-gray-800 hover:text-pink-600 h-full flex items-center px-1 xl:px-2 transition-colors"
                >
                  {cat.name}
                </Link>

                {/* Mega Menu */}
                {cat.subCategories.length > 0 && activeCategory === cat.name && (
                  <div className="absolute top-12 left-0 bg-white shadow-xl border-t border-gray-100 w-[700px] xl:w-[800px] p-6 xl:p-8 grid grid-cols-3 xl:grid-cols-4 gap-4 xl:gap-8 z-50">
                    {cat.subCategories.map((sub) => (
                      <div key={sub.name}>
                        <h4 className="font-bold text-sm mb-3 border-b border-gray-100 pb-2">{sub.name}</h4>
                        <ul className="space-y-1.5">
                          {sub.items.map((item) => (
                            <li key={item}>
                              <Link
                                to={`/products?category=${cat.name}&subcategory=${sub.name}&item=${item}`}
                                className="text-xs text-gray-600 hover:text-pink-600 transition-colors"
                              >
                                {item}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 max-h-[80vh] overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* Mobile Action Icons */}
            <div className="grid grid-cols-4 gap-3 pb-4 border-b border-gray-100">
              <Link to="/catalogs" onClick={() => setMobileMenuOpen(false)} className="flex flex-col items-center">
                <BookOpen size={22} className="text-gray-700" />
                <span className="text-[9px] mt-1">Kataloq</span>
              </Link>
              <Link to="/favorites" onClick={() => setMobileMenuOpen(false)} className="flex flex-col items-center">
                <Heart size={22} className="text-gray-700" />
                <span className="text-[9px] mt-1">Seçilmişlər</span>
              </Link>
              <Link to="/cart" onClick={() => setMobileMenuOpen(false)} className="flex flex-col items-center">
                <ShoppingCart size={22} className="text-gray-700" />
                <span className="text-[9px] mt-1">Səbət</span>
              </Link>
              <Link to="/ai-advisor" onClick={() => setMobileMenuOpen(false)} className="flex flex-col items-center">
                <Bot size={22} className="text-pink-600 animate-pulse" />
                <span className="text-[9px] mt-1 text-pink-600">AI</span>
              </Link>
            </div>

            {/* Mobile Auth/Profile */}
            <div className="pb-4 border-b border-gray-100 space-y-2">
              {!token ? (
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block w-full py-3 bg-pink-600 text-white text-center font-bold rounded-xl">
                  Giriş / Qeydiyyat
                </Link>
              ) : (
                <>
                  {isAdmin ? (
                    <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="block w-full py-3 bg-pink-50 text-pink-600 text-center font-bold rounded-xl">
                      Admin Panel
                    </Link>
                  ) : (
                    <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block w-full py-3 bg-pink-50 text-pink-600 text-center font-bold rounded-xl">
                      Profilim
                    </Link>
                  )}
                  <button onClick={handleLogout} className="block w-full py-3 text-red-600 text-center font-medium">
                    Çıxış Et
                  </button>
                </>
              )}
            </div>

            {/* Mobile Categories */}
            <div className="space-y-2">
              <h3 className="font-bold text-gray-900">Kateqoriyalar</h3>
              {categories.map((cat) => (
                <div key={cat.name} className="border-b border-gray-100 pb-2">
                  <button
                    onClick={() => {
                      if (cat.subCategories.length === 0) {
                        navigate(`/products?category=${cat.name}`);
                        setMobileMenuOpen(false);
                      } else {
                        setMobileCategoryOpen(mobileCategoryOpen === cat.name ? null : cat.name);
                      }
                    }}
                    className="w-full flex justify-between items-center py-2 text-left text-sm font-semibold text-gray-800"
                  >
                    {cat.name}
                    {cat.subCategories.length > 0 && (
                      <span className="text-gray-400">{mobileCategoryOpen === cat.name ? '−' : '+'}</span>
                    )}
                  </button>
                  
                  {cat.subCategories.length > 0 && mobileCategoryOpen === cat.name && (
                    <div className="pl-4 mt-2 space-y-2 pb-2">
                      {cat.subCategories.map((sub) => (
                        <div key={sub.name} className="space-y-1">
                          <h4 className="text-xs font-bold text-gray-600">{sub.name}</h4>
                          <ul className="pl-3 space-y-1">
                            {sub.items.map((item) => (
                              <li key={item}>
                                <Link
                                  to={`/products?category=${cat.name}&subcategory=${sub.name}&item=${item}`}
                                  onClick={() => setMobileMenuOpen(false)}
                                  className="text-xs text-gray-500 hover:text-pink-600"
                                >
                                  {item}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
