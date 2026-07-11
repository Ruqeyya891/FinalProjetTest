
const Series = require('../models/Series');
const slugify = require('../utils/slugify');

// Get all series
const getSeries = async (req, res) => {
  try {
    const series = await Series.find().sort({ order: 1, name: 1 });
    res.json(series);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get popular series
const getPopularSeries = async (req, res) => {
  try {
    const series = await Series.find({ status: 'active', isPopular: true }).sort({ order: 1, name: 1 });
    res.json(series);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get series by slug
const getSeriesBySlug = async (req, res) => {
  try {
    const series = await Series.findOne({ slug: req.params.slug });
    if (!series) {
      return res.status(404).json({ error: 'Series not found' });
    }
    res.json(series);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new series
const createSeries = async (req, res) => {
  try {
    const { name, slug, logo, bannerImage, description, isPopular, status, order } = req.body;
    const existing = await Series.findOne({ name });
    if (existing) {
      return res.json(existing);
    }
    const series = new Series({
      name,
      slug: slug || slugify(name),
      logo,
      bannerImage,
      description,
      isPopular: isPopular || false,
      status: status || 'active',
      order: order || 0
    });
    await series.save();
    res.status(201).json(series);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update series
const updateSeries = async (req, res) => {
  try {
    const { name, slug, logo, bannerImage, description, isPopular, status, order } = req.body;
    const series = await Series.findByIdAndUpdate(
      req.params.id,
      {
        name,
        slug: slug || slugify(name),
        logo,
        bannerImage,
        description,
        isPopular,
        status,
        order
      },
      { new: true, runValidators: true }
    );
    if (!series) {
      return res.status(404).json({ error: 'Series not found' });
    }
    res.json(series);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete series
const deleteSeries = async (req, res) => {
  try {
    const series = await Series.findByIdAndDelete(req.params.id);
    if (!series) {
      return res.status(404).json({ error: 'Series not found' });
    }
    res.json({ message: 'Series deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get or create series by name
const getOrCreateSeries = async (name) => {
  try {
    let series = await Series.findOne({ name });
    if (!series) {
      series = new Series({
        name,
        slug: slugify(name),
        status: 'active'
      });
      await series.save();
    }
    return series;
  } catch (error) {
    console.error('Error getting/creating series:', error);
    throw error;
  }
};

module.exports = {
  getSeries,
  getPopularSeries,
  getSeriesBySlug,
  createSeries,
  updateSeries,
  deleteSeries,
  getOrCreateSeries
};
