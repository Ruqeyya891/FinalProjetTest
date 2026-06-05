const express = require('express');
const {
  getCatalogs,
  createCatalog,
  updateCatalog,
  deleteCatalog
} = require('../controllers/catalogController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Hamının görə biləcəyi route
router.get('/', getCatalogs);

// Admin üçün route-lar
router.post('/', protect, adminOnly, createCatalog);
router.put('/:id', protect, adminOnly, updateCatalog);
router.delete('/:id', protect, adminOnly, deleteCatalog);

module.exports = router;
