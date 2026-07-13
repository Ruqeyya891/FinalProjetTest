const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config();


console.log('Server initializing...');

const app = express();
const PORT = process.env.PORT || 5000;

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Middleware
const allowedOrigins = [
  "http://localhost:5173",
  "https://final-projet-test.vercel.app",
  "https://faberlic-shop.vercel.app",
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    const msg = 'The CORS policy for this site does not allow access from the specified origin.';
    return callback(new Error(msg), false);
  },
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database Connection
const connectDB = async () => {
    try {
        console.log('Trying to connect to MongoDB...');
        console.log('MONGO_URI:', process.env.MONGO_URI ? 'Set' : 'Not set');
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined in .env file');
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connection successful');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        console.log('Zəhmət olmasa MongoDB Atlas-da IP ünvanınızın whitelist-ə əlavə olunduğundan əmin olun.');
        throw err; // Re-throw to let startServer handle it
    }
};

// Routes
app.get('/', (req, res) => {
    res.send('Faberlic Consultant API is running...');
});

// Import Routes
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const orderRoutes = require('./routes/orderRoutes');
const messageRoutes = require('./routes/messageRoutes');
const catalogRoutes = require('./routes/catalogRoutes');
const catalogCycleRoutes = require('./routes/catalogCycleRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const seriesRoutes = require('./routes/seriesRoutes');

app.use('/api/series', seriesRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/catalogs', catalogRoutes);
app.use('/api/catalog-cycles', catalogCycleRoutes);
app.use('/api/admin/analytics', analyticsRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Server Error:', err.stack);
    res.status(500).json({
        success: false,
        error: 'Daxili server xətası baş verdi.',
        message: err.message
    });
});

// Start server only after MongoDB connects
const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (err) {
        console.error('Failed to start server:', err);
    }
};

startServer();
