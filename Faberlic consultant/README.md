# Layihə haqqında

Faberlic məhsulları üçün tam funksionallı e-ticarət platforması. Layihə məhsul kataloqu, səbət, istifadəçi hesabı, admin paneli və istifadəçi-admin söhbəti kimi funksiyaları ehtiva edir.

# İstifadə olunan texnologiyalar

## Frontend
- React 18
- Vite 5
- Tailwind CSS 3
- Material UI
- React Router DOM 6
- Axios
- Swiper
- Lucide React
- React Toastify
- SweetAlert2
- Chart.js (react-chartjs-2)

## Backend
- Node.js
- Express 5
- MongoDB (Mongoose ODM)
- JWT (jsonwebtoken)
- bcryptjs
- Multer
- Cloudinary
- Cheerio
- Playwright
- Papaparse
- XLSX
- Socket.io

## Verilənlər bazası
- MongoDB

# Əsas funksiyalar

## İstifadəçi funksiyaları
- Qeydiyyat və giriş (JWT ilə autentifikasiya)
- Məhsulları kateqoriya, seriya və kataloq dövrünə görə axtarış və filtrləmə
- Məhsulları seçilmişlərə əlavə etmə
- Səbəti idarə etmə (məhsul əlavə etmə, silmə, miqdarı dəyişmə)
- Sürətli sifariş (məhsul kodu ilə)
- İstifadəçi paneli (sifariş tarixinə baxış)
- Admin ilə söhbət
- Responsiv dizayn (mobil və masaüstü cihazlar üçün)

## Admin funksiyaları
- Məhsul idarə edilməsi (əlavə etmə, redaktə etmə, silmə, CSV/XLSX faylları ilə idxal)
- Kataloq və seriya idarə edilməsi
- İstifadəçi idarə edilməsi
- Sifariş idarə edilməsi
- Analitika paneli (satış və inventar analitikası, vizual diaqramlar ilə)
- Məhsul məlumatlarını kəsmə
- İstifadəçilərlə söhbət

# Qovluq strukturu

```
faberlic/
├── client/
│   ├── public/
│   │   └── images/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Footer.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── ScrollToTop.jsx
│   │   ├── contexts/
│   │   │   ├── NotificationContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── pages/
│   │   │   ├── AIAdvisor.jsx (Admin ilə söhbət səhifəsi)
│   │   │   ├── About.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── Catalogs.jsx
│   │   │   ├── Favorites.jsx
│   │   │   ├── GiftSets.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── ProductDetails.jsx
│   │   │   ├── Products.jsx
│   │   │   ├── QuickOrder.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── SeriesDetail.jsx
│   │   │   └── UserDashboard.jsx
│   │   ├── utils/
│   │   │   ├── axios.js
│   │   │   └── categories.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
└── server/
    ├── controllers/
    │   ├── analyticsController.js
    │   ├── catalogController.js
    │   ├── catalogCycleController.js
    │   ├── chatController.js
    │   ├── messageController.js
    │   ├── orderController.js
    │   ├── productController.js
    │   ├── seriesController.js
    │   └── userController.js
    ├── middleware/
    │   ├── auth.js
    │   ├── upload.js
    │   └── uploadCSV.js
    ├── models/
    │   ├── Catalog.js
    │   ├── CatalogCycle.js
    │   ├── Chat.js
    │   ├── Message.js
    │   ├── Order.js
    │   ├── Product.js
    │   ├── Series.js
    │   └── User.js
    ├── routes/
    │   ├── analyticsRoutes.js
    │   ├── catalogCycleRoutes.js
    │   ├── catalogRoutes.js
    │   ├── chatRoutes.js
    │   ├── messageRoutes.js
    │   ├── orderRoutes.js
    │   ├── productRoutes.js
    │   ├── seriesRoutes.js
    │   └── userRoutes.js
    ├── services/
    │   └── notificationService.js
    ├── utils/
    ├── uploads/
    ├── index.js
    └── package.json
```

# Quraşdırma

## Tələblər
- Node.js (v18 və ya yuxarı)
- npm və ya yarn
- MongoDB Atlas və ya yerli MongoDB

## Backend qurulumu

1. Server qovluğuna keçin:
```bash
cd "Faberlic consultant/faberlic/server"
```

2. Asılılıqları quraşdırın:
```bash
npm install
```

3. `server` qovluğunda `.env` faylı yaradın və aşağıdakı dəyişənləri əlavə edin (dəyərləri öz məlumatlarınızla əvəz edin):

4. Serveri işə salın:
```bash
# Development rejimində (Nodemon ilə)
npm run dev

# Production rejimində
npm start
```

## Frontend qurulumu

1. Yeni terminal açın və client qovluğuna keçin:
```bash
cd "Faberlic consultant/faberlic/client"
```

2. Asılılıqları quraşdırın:
```bash
npm install
```

3. `client` qovluğunda `.env` faylı yaradın və aşağıdakı dəyişəni əlavə edin:

4. Frontend development serverini işə salın:
```bash
npm run dev
```

5. Brauzerdə `http://localhost:5173` ünvanına daxil olun.

# Environment Variables

## Server (.env)
```
PORT=
NODE_ENV=
MONGO_URI=
JWT_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

## Client (.env)
```
VITE_API_URL=
```

# Canlı Demo

- **Frontend**: https://faberlic-shop.vercel.app
- **Backend**: [https://finalprojettest.onrender.com]

# Lisenziya

> React, Node.js, Express və MongoDB istifadə edilərək hazırlanmış, Faberlic məhsullarının idarə edilməsi və onlayn satışı üçün nəzərdə tutulmuş tam funksional Full-Stack e-ticarət platforması.

# Müəllif

Code Academy tələbəsi
**Rüqəyya Əhmədzadə**

Junior Full-Stack Web Developer

GitHub: https://github.com/Ruqeyya891

