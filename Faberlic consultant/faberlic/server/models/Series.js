const mongoose = require('mongoose');

const seriesSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  logo: { type: String, default: "" },
  bannerImage: { type: String, default: "" },
  description: { type: String, default: "" },
  isPopular: { type: Boolean, default: false },
  status: { type: String, enum: ['active', 'passive'], default: 'active' },
  order: { type: Number, default: 0 }
}, {
  timestamps: true
});

module.exports = mongoose.model('Series', seriesSchema);
