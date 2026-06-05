// Helper function to create slugs from Azerbaijani text
export const slugify = (text) => {
  if (!text) return '';
  const azChars = {
    'ə': 'e', 'ı': 'i', 'ö': 'o', 'ü': 'u', 'ğ': 'g', 'ş': 's', 'ç': 'c',
    'Ə': 'E', 'İ': 'I', 'Ö': 'O', 'Ü': 'U', 'Ğ': 'G', 'Ş': 'S', 'Ç': 'C'
  };
  return text
    .toLowerCase()
    .split('')
    .map(char => azChars[char] || char)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

export const categories = [
  {
    name: 'QULLUQ',
    slug: 'qulluq',
    subCategories: [
      {
        name: 'Üzə qulluq',
        slug: 'uze-qulluq',
        childCategories: [
          { name: 'Aksesuarlar', slug: 'aksesuarlar' },
          { name: 'Dodaq balzamları', slug: 'dodaq-balzamlari' },
          { name: 'Gecə kremləri', slug: 'gece-kremleri' },
          { name: 'Göz qapaqları və kirpiklər üçün vasitələr', slug: 'goz-qapalari-ve-kirpikler-ucun-vasiteler' },
          { name: 'Gündüz kremləri', slug: 'gunduz-kremleri' },
          { name: 'Günəşdən qorunma', slug: 'gunesden-qorunma' },
          { name: 'Skrablar, pilinqlər', slug: 'skrablar-pilinqlər' },
          { name: 'Təmizləmə və demakiyaj', slug: 'temizleme-ve-demakiyaj' },
          { name: 'Zərdablar, konsentratlar', slug: 'zerdablar-konsentratlar' },
          { name: 'Üz üçün maskalar', slug: 'uz-ucun-maskalar' }
        ]
      },
      {
        name: 'Bədənə qulluq',
        slug: 'badene-qulluq',
        childCategories: [
          { name: 'Aksesuarlar', slug: 'aksesuarlar' },
          { name: 'Ayaqlar üçün vasitələr', slug: 'ayaqlar-ucun-vasiteler' },
          { name: 'Bədən quruluşunun korreksiyası', slug: 'baden-qurulusunun-korreksiyasi' },
          { name: 'Depilyasiya vasitələri', slug: 'depilyasiya-vasiteleri' },
          { name: 'Dezodorantlar', slug: 'dezodorantlar' },
          { name: 'Günəşdən qorunma vasitələri', slug: 'gunesden-qorunma-vasiteleri' },
          { name: 'Kremlər, süd', slug: 'kremler-sud' },
          { name: 'Vanna və duş üçün', slug: 'vanna-ve-dus-ucun' },
          { name: 'Əllər üçün vasitələr', slug: 'eller-ucun-vasiteler' }
        ]
      },
      {
        name: 'Saçlar',
        slug: 'saclar',
        childCategories: [
          { name: 'Aksesuarlar', slug: 'aksesuarlar' },
          { name: 'Balzamlar, maskalar', slug: 'balzamlar-maskalar' },
          { name: 'Boyama', slug: 'boyama' },
          { name: 'Saç boyaları', slug: 'sac-boyalari' },
          { name: 'Saç düzləşdirmə vasitələri', slug: 'sac-duzlesdirme-vasiteleri' },
          { name: 'Saç rəng açıcıları', slug: 'sac-reng-acicilari' },
          { name: 'Xüsusi qulluq', slug: 'xususi-qulluq' },
          { name: 'Şampunlar', slug: 'sampunlar' }
        ]
      },
      { name: 'Boyama', slug: 'boyama', childCategories: [] },
      { name: 'Aromaterapiya', slug: 'aromaterapiya', childCategories: [] },
      { 
        name: 'Ağız boşluğunun gigiyenası', 
        slug: 'agiz-boslugunun-gigiyenasi', 
        childCategories: [
          { name: 'Ağız yaxalayıcıları, spreylər', slug: 'agiz-yaxalayicilari-spreyler' },
          { name: 'Diş fırçaları', slug: 'dis-fircalari' },
          { name: 'Diş məcunları', slug: 'dis-mecunlari' },
          { name: 'Xüsusi vasitələr', slug: 'xususi-vasiteler' }
        ] 
      },
      { name: 'Gigiyena', slug: 'gigiyena', childCategories: [] },
      { name: 'Kişilərə', slug: 'kasilərə', childCategories: [] },
      { name: 'Kosmesevtika', slug: 'kosmesevtika', childCategories: [] },
      { name: 'Uşaqlara', slug: 'usaqlara', childCategories: [] }
    ]
  },
  {
    name: 'MAKIYAJ',
    slug: 'makiyaj',
    subCategories: [
      {
        name: 'Gözlər',
        slug: 'gozler',
        childCategories: [
          { name: 'Göz kölgələri', slug: 'goz-kolgeleri' },
          { name: 'Kirpik tuşu', slug: 'kirpik-tusu' },
          { name: 'Qələmlər, layner', slug: 'qelemler-layner' }
        ]
      },
      {
        name: 'Dodaqlar',
        slug: 'dodaqlar',
        childCategories: [
          { name: 'Dodaq boyaları', slug: 'dodaq-boyalari' },
          { name: 'Parladıcılar, balzamlar', slug: 'parladicilar-balzamlar' },
          { name: 'Qələmlər', slug: 'qelemler' },
          { name: 'Sınaq nümunələri', slug: 'sinaq-numuneleri' }
        ]
      },
      {
        name: 'Üz',
        slug: 'uz',
        childCategories: [
          { name: 'BB krem', slug: 'bb-krem' },
          { name: 'Bronzerlər, haylayterlər', slug: 'bronzerler-haylayterler' },
          { name: 'Kirşan', slug: 'kirsan' },
          { name: 'Korrektorlar, konsilerlər', slug: 'korrektorlar-konsilerler' },
          { name: 'Tonal təməllər və kuşonlar', slug: 'tonal-temeller-ve-kusonlar' },
          { name: 'Ənlik', slug: 'enlik' }
        ]
      },
      {
        name: 'Dırnaqlar',
        slug: 'dirnaqlar',
        childCategories: [
          { name: 'Baza, top, dırnaq boyasının çıxarılması', slug: 'baza-top-dirnaq-boyasi-cixarilmasi' },
          { name: 'Dırnaq aksesuarları', slug: 'dirnaq-aksesuarlari' },
          { name: 'Dırnaq boyaları', slug: 'dirnaq-boyalari' },
          { name: 'Qulluq vasitələri', slug: 'qulluq-vasiteleri' }
        ]
      },
      {
        name: 'Qaşlar',
        slug: 'qaslar',
        childCategories: []
      }
    ]
  },
  { 
    name: 'PARFÜMERİYA', 
    slug: 'parfumeriya', 
    subCategories: [
      { 
        name: 'Qadınlara', 
        slug: 'qadinlara', 
        childCategories: [
          { name: 'Ətirlər', slug: 'ətirlər' },
          { name: 'Parfümləşdirilmiş kosmetika', slug: 'parfümləşdirilmiş-kosmetika' }
        ] 
      },
      { 
        name: 'Kişilərə', 
        slug: 'kasilərə', 
        childCategories: [
          { name: 'Ətirlər', slug: 'ətirlər' },
          { name: 'Parfümləşdirilmiş kosmetika', slug: 'parfümləşdirilmiş-kosmetika' }
        ] 
      },
      { name: 'Ev üçün ətirlər', slug: 'ev-üçün-ətirlər', childCategories: [] },
      { name: 'Sınaq nümunələri', slug: 'sınaq-nümünələri', childCategories: [] }
    ] 
  },
  { name: 'DƏB', slug: 'deb', subCategories: [] },
  { name: 'SAĞLAMLIQ', slug: 'saglamliq', subCategories: [] },
  { name: 'EV', slug: 'ev', subCategories: [] },
  { name: 'UŞAQLARA', slug: 'usaqlara', subCategories: [] },
  { name: 'BİZNES', slug: 'biznes', subCategories: [] },
  { name: 'AKSİYALAR', slug: 'aksiyalar', subCategories: [] },
  { name: 'ENDİRİM', slug: 'endirim', subCategories: [] }
];
