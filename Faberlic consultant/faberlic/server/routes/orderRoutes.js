const express = require('express');
const router = express.Router();
const { createOrder, getOrderStats, getOrders, updateOrderStatus, getMyOrders, confirmPayment } = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/', protect, createOrder);
router.get('/', protect, adminOnly, getOrders);
router.get('/my-orders', protect, getMyOrders);
router.get('/stats', protect, adminOnly, getOrderStats);
router.put('/:id/status', protect, adminOnly, updateOrderStatus);
router.put('/:id/confirm-payment', protect, adminOnly, confirmPayment);

module.exports = router;
