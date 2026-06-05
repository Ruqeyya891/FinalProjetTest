const Order = require('../models/Order');
const Product = require('../models/Product');

const getRevenueAnalytics = async (req, res) => {
    try {
        console.log("Fetching revenue analytics...");
        
        // Get all completed/delivered orders
        const completedOrders = await Order.find({ status: { $in: ['delivered'] } });
        const allOrders = await Order.find();
        
        console.log(`Found ${completedOrders.length} completed orders out of ${allOrders.length} total orders`);

        // Calculate total revenue
        const totalRevenue = completedOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        const completedOrdersCount = completedOrders.length;
        const averageOrderValue = completedOrdersCount > 0 ? totalRevenue / completedOrdersCount : 0;

        // Calculate monthly revenue
        const monthlyRevenue = {};
        const dailyRevenue = {};

        completedOrders.forEach(order => {
            const date = new Date(order.createdAt);
            
            // Monthly
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + (order.totalAmount || 0);
            
            // Daily
            const dayKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            dailyRevenue[dayKey] = (dailyRevenue[dayKey] || 0) + (order.totalAmount || 0);
        });

        const responseData = {
            totalRevenue,
            totalOrders: allOrders.length,
            completedOrdersCount,
            averageOrderValue,
            monthlyRevenue,
            dailyRevenue
        };

        console.log("Revenue analytics:", responseData);
        res.status(200).json(responseData);
    } catch (error) {
        console.error("Error fetching revenue analytics:", error);
        res.status(500).json({ error: error.message });
    }
};

const getBestSellers = async (req, res) => {
    try {
        console.log("Fetching best sellers...");
        
        // Get all completed orders
        const completedOrders = await Order.find({ status: { $in: ['delivered'] } }).populate('products.product');

        // Aggregate product sales
        const productSales = {};

        completedOrders.forEach(order => {
            order.products.forEach(item => {
                if (!item.product) return;
                
                const productId = item.product._id.toString();
                if (!productSales[productId]) {
                    productSales[productId] = {
                        productId,
                        productName: item.product.name,
                        productImage: item.product.image,
                        totalSold: 0,
                        totalRevenue: 0
                    };
                }
                productSales[productId].totalSold += item.quantity;
                productSales[productId].totalRevenue += (item.price || item.product.price_sale) * item.quantity;
            });
        });

        // Convert to array and sort by totalSold descending
        const bestSellers = Object.values(productSales).sort((a, b) => b.totalSold - a.totalSold);

        console.log("Best sellers:", bestSellers);
        res.status(200).json(bestSellers);
    } catch (error) {
        console.error("Error fetching best sellers:", error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getRevenueAnalytics,
    getBestSellers
};
