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
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database Connection
const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined in .env file');
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connection successful');
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        console.log('Zəhmət olmasa MongoDB Atlas-da IP ünvanınızın whitelist-ə əlavə olunduğundan əmin olun.');
    }
};

connectDB();

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
const analyticsRoutes = require('./routes/analyticsRoutes');

app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/catalogs', catalogRoutes);
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

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
