import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Products from './pages/Products';
import AIAdvisor from './pages/AIAdvisor';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductDetails from './pages/ProductDetails';
import UserDashboard from './pages/UserDashboard';
import Cart from './pages/Cart';
import Favorites from './pages/Favorites';
import Footer from './components/Footer';
import Catalogs from './pages/Catalogs';
import QuickOrder from './pages/QuickOrder';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { jwtDecode } from 'jwt-decode';

// Protected Route for Admin
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  console.log('--- ADMIN ROUTE CHECK ---');
  if (!token) {
    console.log('No token found, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  try {
    const decoded = jwtDecode(token);
    console.log('AdminRoute decoded role:', decoded.role);
    if (decoded.role !== 'admin') {
      console.log('User is not admin, redirecting to home');
      return <Navigate to="/" replace />;
    }
    return children;
  } catch (error) {
    console.error('AdminRoute token decode error:', error);
    return <Navigate to="/login" replace />;
  }
};

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const handleGlobalSearch = (e) => {
      setSearchTerm(e.detail);
    };
    window.addEventListener('globalSearch', handleGlobalSearch);
    return () => window.removeEventListener('globalSearch', handleGlobalSearch);
  }, []);

  useEffect(() => {
    const checkAdmin = () => {
      const token = localStorage.getItem('token');
      console.log('--- ADMIN CHECK ---');
      console.log('Token exists:', !!token);
      if (token) {
        try {
          const decoded = jwtDecode(token);
          console.log('Decoded Token:', decoded);
          const isUserAdmin = decoded.role === 'admin';
          console.log('Is Admin:', isUserAdmin);
          setIsAdmin(isUserAdmin);
        } catch (e) {
          console.error('JWT Decode Error:', e);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };

    checkAdmin();
    // Listen for storage changes (login/logout)
    window.addEventListener('storage', checkAdmin);
    return () => window.removeEventListener('storage', checkAdmin);
  }, []);

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="min-h-screen flex flex-col bg-pink-50">
        <Navbar isAdmin={isAdmin} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home searchTerm={searchTerm} />} />
            <Route path="/products" element={<Products searchTerm={searchTerm} />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/ai-advisor" element={<AIAdvisor />} />
            <Route path="/catalogs" element={<Catalogs />} />
            <Route path="/admin" element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/quick-order" element={<QuickOrder />} />
            <Route path="/suretli-sifaris" element={<QuickOrder />} />
          </Routes>
        </main>
        <Footer />
        <ToastContainer position="bottom-right" />
      </div>
    </Router>
  );
}

export default App;
