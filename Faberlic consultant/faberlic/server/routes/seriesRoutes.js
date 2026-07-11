
const express = require('express');
const router = express.Router();
const {
  getSeries,
  getPopularSeries,
  getSeriesBySlug,
  createSeries,
  updateSeries,
  deleteSeries
} = require('../controllers/seriesController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', getSeries);
router.get('/popular', getPopularSeries);
router.get('/:slug', getSeriesBySlug);
router.post('/', protect, adminOnly, createSeries);
router.put('/:id', protect, adminOnly, updateSeries);
router.delete('/:id', protect, adminOnly, deleteSeries);

module.exports = router;
