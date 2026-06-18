
import { Link } from 'react-router-dom';

const About = () => {
  const stats = [
    { number: '26+', label: 'illik təcrübə' },
    { number: '46', label: 'ölkədə çatdırılma' },
    { number: '20', label: 'ölkədə nümayəndəlik' },
    { number: '1500+', label: 'yeni məhsul' },
    { number: '8500+', label: 'satış və çatdırılma nöqtəsi' }
  ];

  const categories = [
    { name: 'Oksigen kosmetikası', icon: '✨' },
    { name: 'Makiyaj', icon: '💄' },
    { name: 'Parfümeriya', icon: '🌸' },
    { name: 'Saç qulluğu', icon: '💇‍♀️' },
    { name: 'Şəxsi gigiyena', icon: '🧴' },
    { name: 'Ev məhsulları', icon: '🏠' },
    { name: 'Uşaq məhsulları', icon: '👶' },
    { name: 'Sağlamlıq məhsulları', icon: '💊' }
  ];

  const certifications = [
    { name: 'ISO 9001', icon: '🏆' },
    { name: 'GMP standartları', icon: '📋' },
    { name: 'Halal sertifikatı', icon: '✅' },
    { name: 'Heyvanlar üzərində sınaq aparılmır', icon: '🐰' }
  ];

  const timeline = [
    { year: '1997', event: 'Şirkətin əsası qoyuldu' },
    { year: '2009', event: 'Onlayn sifariş sisteminə keçid' },
    { year: '2015', event: 'Air Stream oksigen kosmetikası' },
    { year: '2020', event: '"FABERLIC. BE YOUR BEST" yenilənmiş brend mövqeyi' },
    { year: '2021', event: 'Yeni beynəlxalq bazarlara çıxış' },
    { year: '2022', event: 'Təchizat zəncirlərinin genişləndirilməsi' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-pink-50 to-pink-100 py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=premium%20cosmetics%20background%20pink%20elegant%20faberlic%20style%20banner&image_size=landscape_16_9')] bg-cover bg-center opacity-20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6">Faberlic haqqında</h1>
            <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto">
              Gözəllik, sağlamlıq və ilhamverici ideyalar dünyasına xoş gəlmisiniz.
            </p>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-6 rounded-2xl bg-pink-50 border border-pink-100 hover:shadow-lg transition-all">
                <div className="text-4xl md:text-5xl font-extrabold text-pink-600 mb-2">{stat.number}</div>
                <div className="text-sm md:text-base text-gray-700 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Company Info Section */}
      <section className="py-16 bg-pink-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Şirkət haqqında</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            Faberlic kosmetika, parfümeriya, geyim, ev məhsulları, uşaq məhsulları və sağlamlıq sahəsində geniş çeşid təqdim edən beynəlxalq şirkətdir.
          </p>
        </div>
      </section>

      {/* Product Categories Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">Məhsul kateqoriyaları</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((cat, index) => (
              <div key={index} className="p-6 rounded-2xl bg-pink-50 border border-pink-100 hover:shadow-lg transition-all text-center">
                <div className="text-4xl mb-3">{cat.icon}</div>
                <div className="font-semibold text-gray-900">{cat.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications Section */}
      <section className="py-16 bg-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">Keyfiyyət və sertifikatlar</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {certifications.map((cert, index) => (
              <div key={index} className="p-6 rounded-2xl bg-white border border-pink-100 hover:shadow-lg transition-all text-center">
                <div className="text-4xl mb-3">{cert.icon}</div>
                <div className="font-semibold text-gray-900">{cert.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">Tariximiz</h2>
          <div className="space-y-6">
            {timeline.map((item, index) => (
              <div key={index} className="flex items-start gap-4 p-6 rounded-2xl bg-pink-50 border border-pink-100">
                <div className="text-2xl font-extrabold text-pink-600 min-w-[80px]">{item.year}</div>
                <div className="text-gray-700">{item.event}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Business Opportunities Section */}
      <section className="py-16 bg-pink-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Faberlic ilə biznes imkanı</h2>
          <p className="text-lg text-pink-100 mb-8 max-w-2xl mx-auto">
            Faberlic məsləhətçi və partnyorlar üçün satış, şəxsi inkişaf və əlavə gəlir imkanı yaradır.
          </p>
          <Link to="/register" className="inline-block px-10 py-4 bg-white text-pink-600 font-bold rounded-xl hover:bg-pink-50 transition-all shadow-xl">
            Qeydiyyatdan keç
          </Link>
        </div>
      </section>
    </div>
  );
};

export default About;

