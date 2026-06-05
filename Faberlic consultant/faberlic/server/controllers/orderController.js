const Order = require('../models/Order');
const Product = require('../models/Product');

const User = require('../models/User');

const createOrder = async (req, res) => {
    try {
        const { products, totalAmount, contactMethod } = req.body;
        const userId = req.user._id;

        const newOrder = new Order({
            user: userId,
            products,
            totalAmount,
            contactMethod
        });

        await newOrder.save();

        // Clear user cart
        await User.findByIdAndUpdate(userId, { cart: [] });

        res.status(201).json({ success: true, order: newOrder });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const getOrderStats = async (req, res) => {
    try {
        const stats = await Order.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    totalRevenue: { $sum: "$totalAmount" },
                    orderCount: { $count: {} }
                }
            },
            { $sort: { "_id": -1 } }
        ]);

        const popularProducts = await Order.aggregate([
            { $unwind: "$products" },
            {
                $group: {
                    _id: "$products.product",
                    count: { $sum: "$products.quantity" }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "_id",
                    as: "productInfo"
                }
            }
        ]);

        res.json({ success: true, dailyStats: stats, popularProducts });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const getOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate('user', 'name surname email').populate('products.product', 'name image price_sale');
        res.status(200).json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
        res.status(200).json({ success: true, order });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = { createOrder, getOrderStats, getOrders, updateOrderStatus, getMyOrders };
