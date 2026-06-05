const express = require('express');
const router = express.Router();
const {
    getProducts,
    getProductById,
    syncProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    importProducts
} = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/auth');
const uploadCSV = require('../middleware/uploadCSV');

// Public routes
router.get('/', getProducts);
router.get('/:id', getProductById);

// Admin routes
router.post('/', protect, adminOnly, createProduct);
router.put('/:id', protect, adminOnly, updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);
router.post('/sync', protect, adminOnly, syncProducts);
router.post('/import', protect, adminOnly, uploadCSV.single('csvFile'), importProducts);

module.exports = router;
