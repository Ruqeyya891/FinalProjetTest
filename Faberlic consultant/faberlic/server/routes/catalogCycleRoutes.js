const express = require('express');
const {
  getCatalogCycles,
  getActiveCatalogCycle,
  createCatalogCycle,
  updateCatalogCycle,
  deleteCatalogCycle
} = require('../controllers/catalogCycleController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/active', getActiveCatalogCycle);
router.get('/', getCatalogCycles);

// Admin routes
router.post('/', protect, adminOnly, createCatalogCycle);
router.put('/:id', protect, adminOnly, updateCatalogCycle);
router.delete('/:id', protect, adminOnly, deleteCatalogCycle);

module.exports = router;
