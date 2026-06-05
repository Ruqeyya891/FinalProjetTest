import { Instagram, MessageCircle, Phone, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-pink-100 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-xl font-bold text-pink-600 mb-4">Faberlic Consultant</h3>
            <p className="text-gray-500 text-sm">
              Sizə ən uyğun Faberlik məhsullarını tapmaqda və komandamıza qoşulmaqda kömək edirik.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Sürətli Keçidlər</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="/" className="hover:text-pink-600">Ana Səhifə</a></li>
              <li><a href="/products" className="hover:text-pink-600">Məhsullar</a></li>
              <li><a href="/ai-advisor" className="hover:text-pink-600">AI Məsləhətçi</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Xidmətlər</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>Qeydiyyat (Xanımlar üçün)</li>
              <li>Sifariş və Çatdırılma</li>
              <li>Dəri Analizi</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Əlaqə</h4>
            <div className="space-y-4">
              <a href="tel:0519848659" className="flex items-center text-sm text-gray-600 hover:text-pink-600">
                <Phone size={18} className="mr-2" />
                051 984 86 59
              </a>
              <a href="https://wa.me/994519848659" className="flex items-center text-sm text-gray-600 hover:text-pink-600">
                <MessageCircle size={18} className="mr-2" />
                WhatsApp
              </a>
              <a href="https://www.instagram.com/direct/t/18079163858165773/" className="flex items-center text-sm text-gray-600 hover:text-pink-600">
                <Instagram size={18} className="mr-2" />
                Instagram
              </a>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-pink-50 text-center">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Faberlic Consultant. Bütün hüquqlar qorunur.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
