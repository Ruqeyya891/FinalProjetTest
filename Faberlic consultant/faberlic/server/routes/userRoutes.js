const express = require('express');
const router = express.Router();
const { 
    registerUser, 
    loginUser,
    toggleFavorite,
    getFavorites,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    getCart,
    getUsers,
    deleteUser,
    getUserProfile
} = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);

// Admin Routes
router.get('/', protect, adminOnly, getUsers);
router.delete('/:id', protect, adminOnly, deleteUser);

// Profile
router.get('/profile', protect, getUserProfile);

// Favorites
router.post('/favorites/toggle', protect, toggleFavorite);
router.get('/favorites', protect, getFavorites);

// Cart
router.get('/cart', protect, getCart);
router.post('/cart/add', protect, addToCart);
router.post('/cart/update', protect, updateCartQuantity);
router.delete('/cart/:productId', protect, removeFromCart);

module.exports = router;
