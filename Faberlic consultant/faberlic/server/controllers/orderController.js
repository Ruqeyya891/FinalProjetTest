const Order = require('../models/Order');
const Product = require('../models/Product');

const User = require('../models/User');

const createOrder = async (req, res) => {
    try {
        const { products, totalAmount, contactMethod, notes } = req.body;
        const userId = req.user._id;

        // Fetch full product details for each item and check stock
        const items = [];
        for (const item of products) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(404).json({ success: false, error: 'Məhsul tapılmadı' });
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({ success: false, error: 'Bu məhsuldan stokda kifayət qədər yoxdur' });
            }
            
            // Add full product details to items array
            items.push({
                productId: product._id,
                name: product.name,
                sku: product.sku,
                image: product.images?.[0] || product.image,
                price: product.price_sale,
                quantity: item.quantity,
                total: product.price_sale * item.quantity
            });

            // Now update stock for this product
            const newStock = product.stock - item.quantity;
            let newStatus = product.status;
            if (newStock <= 0) {
                newStatus = "out_of_stock";
            }
            await Product.findByIdAndUpdate(item.product, { stock: newStock, status: newStatus });
        }

        const newOrder = new Order({
            user: userId,
            items,
            products, // Keep for backward compatibility
            totalAmount,
            contactMethod,
            notes
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
        const orders = await Order.find()
            .populate('user', 'name surname email username')
            .populate('products.product', 'name sku images image price_sale');
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
