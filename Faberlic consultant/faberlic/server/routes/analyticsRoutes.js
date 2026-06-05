const express = require('express');
const router = express.Router();
const {
    getRevenueAnalytics,
    getBestSellers
} = require('../controllers/analyticsController');
const { protect, adminOnly } = require('../middleware/auth');

// Admin-only analytics routes
router.get('/revenue', protect, adminOnly, getRevenueAnalytics);
router.get('/best-sellers', protect, adminOnly, getBestSellers);

module.exports = router;
