const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Favorites (Note: Currently not in User model, needs adjustment if required)
const toggleFavorite = async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId } = req.body;
        const user = await User.findById(userId);
        if (!user.favorites) user.favorites = [];

        // Convert to string for consistent comparison
        const productIdStr = productId.toString();
        
        const isFavorite = user.favorites.some(id => id.toString() === productIdStr);
        
        if (isFavorite) {
            user.favorites = user.favorites.filter(id => id.toString() !== productIdStr);
        } else {
            user.favorites.push(productId);
        }

        await user.save();
        
        // Return array of string ids for easier frontend handling
        const favoriteIds = user.favorites.map(id => id.toString());
        res.status(200).json({ success: true, favorites: favoriteIds });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const getFavorites = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('favorites');
        res.status(200).json({ success: true, favorites: user.favorites || [] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Cart (Note: Currently not in User model, needs adjustment if required)
const addToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        
        if (!productId) {
            return res.status(400).json({ success: false, error: 'Məhsul ID göndərilməyib' });
        }

        if (!req.user || !req.user._id) {
            return res.status(401).json({ success: false, error: 'İstifadəçi ID tapılmadı. Yenidən giriş edin.' });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ success: false, error: 'İstifadəçi bazada tapılmadı' });
        }

        // Initialize cart if it doesn't exist
        if (!user.cart) user.cart = [];

        // Convert productId to string for comparison
        const targetId = productId.toString();

        // Check if product already exists in cart
        const cartItemIndex = user.cart.findIndex(item => 
            item.product && item.product.toString() === targetId
        );

        if (cartItemIndex > -1) {
            user.cart[cartItemIndex].quantity += (Number(quantity) || 1);
        } else {
            user.cart.push({ product: productId, quantity: Number(quantity) || 1 });
        }

        await user.save();
        
        // Return success and let frontend fetch the full cart if needed
        res.status(200).json({ success: true, cart: user.cart });
    } catch (error) {
        console.error('--- ADD TO CART ERROR ---', error);
        res.status(500).json({ success: false, error: 'Server xətası: ' + error.message });
    }
};

const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ success: false, error: 'İstifadəçi tapılmadı' });
        }
        if (!user.cart) user.cart = [];
        user.cart = user.cart.filter(item => item.product && item.product.toString() !== productId);
        await user.save();
        res.status(200).json({ success: true, cart: user.cart });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const updateCartQuantity = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ success: false, error: 'İstifadəçi tapılmadı' });
        }
        if (!user.cart) user.cart = [];
        const cartItem = user.cart.find(item => item.product && item.product.toString() === productId);
        if (cartItem) {
            cartItem.quantity = Number(quantity);
            await user.save();
        }
        res.status(200).json({ success: true, cart: user.cart });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const getCart = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('cart.product');
        if (!user) {
            return res.status(404).json({ success: false, error: 'İstifadəçi tapılmadı' });
        }
        res.status(200).json({ success: true, cart: user.cart || [] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const registerUser = async (req, res) => {
    try {
        const { name, surname, username, email, password, gender } = req.body;

        // Restriction: Only females allowed
        if (gender !== 'female') {
            return res.status(403).json({ success: false, error: 'Qeydiyyat yalnız xanımlar üçün mümkündür.' });
        }

        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ success: false, error: 'Bu e-poçt və ya istifadəçi adı artıq qeydiyyatdan keçib.' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name,
            surname,
            username,
            email,
            password: hashedPassword,
            gender: 'female',
            role: 'user'
        });

        await newUser.save();

        const token = jwt.sign({ id: newUser._id, role: newUser.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

        res.status(201).json({ success: true, user: {
            id: newUser._id,
            name: newUser.name,
            surname: newUser.surname,
            username: newUser.username,
            email: newUser.email,
            role: newUser.role
        }, token });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ success: false, error: 'Server xətası baş verdi.' });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login attempt for:', email);
        
        // Search by email or username
        const user = await User.findOne({ 
            $or: [
                { email: email.toLowerCase() },
                { username: email }
            ]
        });

        if (!user) {
            console.log('User not found:', email);
            return res.status(401).json({ success: false, error: 'E-poçt və ya şifrə yanlışdır.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('Password mismatch for:', email);
            return res.status(401).json({ success: false, error: 'E-poçt və ya şifrə yanlışdır.' });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

        res.status(200).json({ success: true, user: {
            id: user._id,
            name: user.name,
            surname: user.surname,
            username: user.username,
            email: user.email,
            role: user.role
        }, token });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, error: 'Server xətası baş verdi.' });
    }
};

const getUsers = async (req, res) => {
    try {
        const users = await User.find({ role: 'user' }).select('-password');
        res.status(200).json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await User.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: 'İstifadəçi silindi' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, error: 'İstifadəçi tapılmadı' });
        }
        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = { 
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
};
