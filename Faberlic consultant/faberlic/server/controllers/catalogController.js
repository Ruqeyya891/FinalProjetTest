const Catalog = require('../models/Catalog');

// Bütün kataloqları al
const getCatalogs = async (req, res) => {
  try {
    const { isAdmin } = req.query;
    let query = {};
    
    // Əgər admin deyilsə, yalnız aktiv kataloqları göstər
    if (!isAdmin) {
      query.isActive = true;
    }
    
    const catalogs = await Catalog.find(query).sort({ createdAt: -1 });
    res.status(200).json(catalogs);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Yeni kataloq əlavə et
const createCatalog = async (req, res) => {
  try {
    const { name, image, link, isActive } = req.body;
    const newCatalog = new Catalog({ name, image, link, isActive });
    await newCatalog.save();
    res.status(201).json({ success: true, catalog: newCatalog });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Kataloqu yenilə
const updateCatalog = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, image, link, isActive } = req.body;
    const updatedCatalog = await Catalog.findByIdAndUpdate(
      id,
      { name, image, link, isActive },
      { new: true }
    );
    res.status(200).json({ success: true, catalog: updatedCatalog });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Kataloqu sil
const deleteCatalog = async (req, res) => {
  try {
    const { id } = req.params;
    await Catalog.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: 'Kataloq silindi' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getCatalogs,
  createCatalog,
  updateCatalog,
  deleteCatalog
};
