const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
            
            const user = await User.findById(decoded.id).select('-password');
            if (!user) {
                return res.status(401).json({ success: false, error: 'İstifadəçi tapılmadı' });
            }

            // Role normalization (trim spaces/newlines)
            const normalizedRole = user.role?.trim();
            const isAdmin = normalizedRole === "admin";
            
            console.log(`User: ${user.email}, Role: "${user.role}", Normalized: "${normalizedRole}", Is Admin: ${isAdmin}`);

            req.user = user;
            req.user.role = normalizedRole; // Update role in req.user for consistency
            
            return next();
        } catch (error) {
            return res.status(401).json({ success: false, error: 'Yetkisiz giriş, token səhvdir' });
        }
    }

    if (!token) {
        return res.status(401).json({ success: false, error: 'Yetkisiz giriş, token tapılmadı' });
    }
};

const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ success: false, error: 'Bu əməliyyat üçün admin yetkisi lazımdır' });
    }
};

module.exports = { protect, adminOnly };
