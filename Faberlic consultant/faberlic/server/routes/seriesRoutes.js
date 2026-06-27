
const express = require('express');
const router = express.Router();
const {
  getSeries,
  createSeries
} = require('../controllers/seriesController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', getSeries);
router.post('/', protect, adminOnly, createSeries);

module.exports = router;
