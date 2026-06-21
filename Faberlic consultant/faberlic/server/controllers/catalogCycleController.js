const CatalogCycle = require('../models/CatalogCycle');

// Get all catalog cycles
const getCatalogCycles = async (req, res) => {
  try {
    const catalogCycles = await CatalogCycle.find().sort({ startDate: -1 });
    res.status(200).json({ success: true, catalogCycles });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get active catalog cycle (based on current date)
const getActiveCatalogCycle = async (req, res) => {
  try {
    const now = new Date();
    const activeCatalog = await CatalogCycle.findOne({
      startDate: { $lte: now },
      endDate: { $gte: now },
      isActive: true,
    });
    res.status(200).json({ success: true, activeCatalog });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create a new catalog cycle
const createCatalogCycle = async (req, res) => {
  try {
    const { catalogNumber, title, startDate, endDate, isActive } = req.body;
    const newCatalogCycle = new CatalogCycle({ catalogNumber, title, startDate, endDate, isActive });
    await newCatalogCycle.save();
    res.status(201).json({ success: true, catalogCycle: newCatalogCycle });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update a catalog cycle
const updateCatalogCycle = async (req, res) => {
  try {
    const { id } = req.params;
    const { catalogNumber, title, startDate, endDate, isActive } = req.body;
    const updatedCatalogCycle = await CatalogCycle.findByIdAndUpdate(
      id,
      { catalogNumber, title, startDate, endDate, isActive },
      { new: true }
    );
    res.status(200).json({ success: true, catalogCycle: updatedCatalogCycle });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete a catalog cycle
const deleteCatalogCycle = async (req, res) => {
  try {
    const { id } = req.params;
    await CatalogCycle.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: 'Kataloq dövrü silindi' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getCatalogCycles,
  getActiveCatalogCycle,
  createCatalogCycle,
  updateCatalogCycle,
  deleteCatalogCycle
};
