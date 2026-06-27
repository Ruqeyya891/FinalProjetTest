
const Series = require('../models/Series');
const slugify = require('../utils/slugify');

// Get all series
const getSeries = async (req, res) => {
  try {
    const series = await Series.find().sort({ name: 1 });
    res.json(series);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new series
const createSeries = async (req, res) => {
  try {
    const { name } = req.body;
    const existing = await Series.findOne({ name });
    if (existing) {
      return res.json(existing);
    }
    const series = new Series({
      name,
      slug: slugify(name)
    });
    await series.save();
    res.status(201).json(series);
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
        slug: slugify(name)
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
  createSeries,
  getOrCreateSeries
};
