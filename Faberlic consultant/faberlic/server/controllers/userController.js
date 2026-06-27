const User = require('../models/User');
const Product = require('../models/Product');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const notificationService = require('../services/notificationService');

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

// Cart
const addToCart = async (req, res) => {
    try {
        console.log("Cart add request body:", req.body);
        const { productId, quantity, variantSku, variantName } = req.body;
        
        // 1. productId validation
        if (!productId) {
            return res.status(400).json({ success: false, error: 'Məhsul ID göndərilməyib' });
        }

        // 5. Valid MongoDB ObjectId check
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ success: false, error: 'Invalid productId' });
        }

        // 8. User authentication check
        if (!req.user || (!req.user._id && !req.user.id)) {
            return res.status(401).json({ success: false, error: 'User not authenticated' });
        }

        const userId = req.user._id || req.user.id;

        // 6. Product existence check
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }
        
        // Check product status OR variant status
        if (product.status === 'passive' || product.status === 'out_of_stock') {
            return res.status(400).json({ success: false, error: 'Bu məhsul artıq mövcud deyil' });
        }

        // Check variant status if variantSku is provided
        if (variantSku) {
            const variant = product.variants?.find(v => v.sku === variantSku);
            if (variant) {
                if (variant.status === 'passive' || variant.status === 'out_of_stock' || variant.stock <= 0) {
                    return res.status(400).json({ success: false, error: 'Bu məhsul artıq mövcud deyil' });
                }
            }
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, error: 'İstifadəçi bazada tapılmadı' });
        }

        // 9. Initialize cart if it doesn't exist
        if (!user.cart) user.cart = [];

        // 10. Add or update logic
        const targetId = productId.toString();
        
        // Ensure user.cart is an array and items have product field
        if (!Array.isArray(user.cart)) {
            user.cart = [];
        }

        // Find cart item: check productId AND variantSku (if provided)
        const cartItemIndex = user.cart.findIndex(item => 
            item && item.product && 
            item.product.toString() === targetId && 
            item.variantSku === variantSku
        );

        const qtyToAdd = Number(quantity) || 1;

        if (cartItemIndex > -1) {
            user.cart[cartItemIndex].quantity += qtyToAdd;
        } else {
            user.cart.push({ 
                product: productId, 
                quantity: qtyToAdd,
                variantSku: variantSku || null,
                variantName: variantName || null
            });
        }

        console.log(`Saving user ${userId} with ${user.cart.length} items in cart`);
        
        try {
            await user.save();
        } catch (saveError) {
            console.error("User save error during cart add:", saveError);
            return res.status(500).json({ 
                success: false, 
                error: 'Səbət yadda saxlanılarkən xəta: ' + saveError.message 
            });
        }
        
        // 13. Successful response
        return res.status(200).json({ 
            success: true, 
            message: "Məhsul səbətə əlavə edildi", 
            cart: user.cart 
        });
    } catch (error) {
        // 2 & 11. Error handling with logging
        console.error("Cart add error:", error);
        res.status(500).json({ 
            success: false, 
            error: 'Server xətası: ' + error.message 
        });
    }
};

const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;
        const { variantSku } = req.query; // Optional variantSku from query
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ success: false, error: 'İstifadəçi tapılmadı' });
        }
        if (!user.cart) user.cart = [];
        
        // Filter items: if variantSku provided, match product AND variant; else match product
        user.cart = user.cart.filter(item => 
            !(item.product && 
              item.product.toString() === productId && 
              (variantSku ? item.variantSku === variantSku : true))
        );
        
        await user.save();
        res.status(200).json({ success: true, cart: user.cart });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const updateCartQuantity = async (req, res) => {
    try {
        const { productId, quantity, variantSku } = req.body;
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ success: false, error: 'İstifadəçi tapılmadı' });
        }
        if (!user.cart) user.cart = [];
        
        // Find cart item: match productId AND (variantSku matches OR both are null/undefined)
        const cartItem = user.cart.find(item => 
            item.product && 
            item.product.toString() === productId && 
            (variantSku ? item.variantSku === variantSku : !item.variantSku)
        );
        if (cartItem) {
            cartItem.quantity = Math.max(1, Number(quantity));
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
        // Filter out items where product is null (deleted product)
        const validCart = (user.cart || []).filter(item => item.product);
        res.status(200).json({ success: true, cart: validCart });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Helper function to generate random numeric code
const generateNumericCode = (length, prefix = '') => {
    let code = prefix;
    for (let i = 0; i < length - prefix.length; i++) {
        code += Math.floor(Math.random() * 10).toString();
    }
    return code;
};

const registerUser = async (req, res) => {
    try {
        const { fullName, phone, email } = req.body;

        // Check for required fields
        if (!fullName || !phone || !email) {
            return res.status(400).json({ success: false, error: 'Bütün sahələr doldurulmalıdır.' });
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, error: 'Bu e-poçt artıq qeydiyyatdan keçib.' });
        }

        // Generate unique customerCode (always starts with 3, 9 digits total)
        let customerCode;
        let customerCodeExists = true;
        while (customerCodeExists) {
            customerCode = generateNumericCode(9, '3');
            const existingCode = await User.findOne({ customerCode });
            customerCodeExists = !!existingCode;
        }

        // Generate accessKey
        const accessKey = generateNumericCode(6);

        // Log codes to console
        console.log("Customer Code:", customerCode);
        console.log("Access Key:", accessKey);

        // Hash accessKey
        const salt = await bcrypt.genSalt(10);
        const accessKeyHash = await bcrypt.hash(accessKey, salt);

        // Create new user
        const newUser = new User({
            fullName,
            phone,
            email,
            customerCode,
            accessKeyHash,
            role: 'user',
            // For backward compatibility
            name: fullName.split(' ')[0],
            surname: fullName.split(' ').slice(1).join(' '),
            username: customerCode
        });

        await newUser.save();

        // TODO: SMS və WhatsApp API sonra qoşulacaq
        // Generate WhatsApp link
        // const whatsappLink = notificationService.sendWhatsAppNotification(phone, customerCode, accessKey);

        // Optional: Try to send via Twilio if configured (for future)
        // try {
        //     await notificationService.sendTwilioSMS(phone, customerCode, accessKey);
        // } catch (twilioError) {
        //     console.warn('Twilio SMS failed (expected if not configured):', twilioError.message);
        // }

        const token = jwt.sign({ id: newUser._id, role: newUser.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

        res.status(201).json({ 
            success: true, 
            user: {
                id: newUser._id,
                fullName: newUser.fullName,
                phone: newUser.phone,
                email: newUser.email,
                customerCode: newUser.customerCode,
                role: newUser.role
            }, 
            token,
            accessKey // Show accessKey to user only once
            // whatsappLink // TODO: Add this back when SMS/WhatsApp is enabled
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ success: false, error: 'Server xətası baş verdi.' });
    }
};

const loginUser = async (req, res) => {
    try {
        const { customerCode, accessKey, email, password } = req.body;

        let user;
        let isMatch = false;

        // Check if it's the new customerCode/accessKey login
        if (customerCode && accessKey) {
            console.log('Login attempt for customerCode:', customerCode);
            user = await User.findOne({ customerCode });
            if (user && user.accessKeyHash) {
                isMatch = await bcrypt.compare(accessKey, user.accessKeyHash);
            }
        }
        // Backward compatibility: support old email/password login for admins
        else if (email && password) {
            console.log('Login attempt for email:', email);
            user = await User.findOne({ 
                $or: [
                    { email: email.toLowerCase() },
                    { username: email }
                ] 
            });
            if (user && user.password) {
                isMatch = await bcrypt.compare(password, user.password);
            }
        }

        if (!user) {
            console.log('User not found');
            return res.status(401).json({ success: false, error: 'Müştəri kodu və ya giriş açarı yanlışdır.' });
        }

        if (!isMatch) {
            console.log('Credentials mismatch');
            return res.status(401).json({ success: false, error: 'Müştəri kodu və ya giriş açarı yanlışdır.' });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

        // Prepare user response with backward compatibility
        const userResponse = {
            id: user._id,
            role: user.role
        };
        
        if (user.fullName) userResponse.fullName = user.fullName;
        if (user.phone) userResponse.phone = user.phone;
        if (user.email) userResponse.email = user.email;
        if (user.customerCode) userResponse.customerCode = user.customerCode;
        // Old fields for backward compatibility
        if (user.name) userResponse.name = user.name;
        if (user.surname) userResponse.surname = user.surname;
        if (user.username) userResponse.username = user.username;

        res.status(200).json({ 
            success: true, 
            user: userResponse, 
            token 
        });

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
