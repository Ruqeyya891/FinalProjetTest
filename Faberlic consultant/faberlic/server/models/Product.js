const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      default: "",
    },

    price_catalog: {
      type: Number,
      default: 0,
    },

    price_anbar: {
      type: Number,
      default: 0,
    },

    price_sale: {
      type: Number,
      required: true,
    },
    discountPercent: {
      type: Number,
      default: 0,
    },

    images: {
      type: [String],
      default: [],
      validate: [
        {
          validator: function(v) {
            return Array.isArray(v) && v.length > 0;
          },
          message: 'Ən azı 1 şəkil məcburidir'
        }
      ]
    },

    weight: {
      value: { type: Number, min: 0, default: null },
      unit: { type: String, enum: ['q', 'kq'], default: 'q' }
    },

    volume: {
      value: { type: Number, min: 0, default: null },
      unit: { type: String, enum: ['ml', 'l'], default: 'ml' }
    },
    categorySlug: {
      type: String,
      default: "",
    },
    subCategoryName: {
      type: String,
      default: "",
    },
    subCategorySlug: {
      type: String,
      default: "",
    },
    childCategoryName: {
      type: String,
      default: "",
    },
    childCategorySlug: {
      type: String,
      default: "",
    },

    // New filter fields
    isInStock: { type: Boolean, default: true }, // Anbarda var
    isSuperPrice: { type: Boolean, default: false }, // Superqiymət
    isNew: { type: Boolean, default: false }, // Yeniliklər
    isDiscount: { type: Boolean, default: false }, // Endirim
    isPromotion: { type: Boolean, default: false }, // Aksiyalar
    isHit: { type: Boolean, default: false }, // HİT
    
    collection: { type: String, default: "" }, // Seriya, Kolleksiya
    seriesName: { type: String, default: "" }, // Seriya adı
    seriesSlug: { type: String, default: "" }, // Seriya slug
    productType: { type: String, default: "" }, // Məhsulun növü
    productEffect: { type: String, default: "" }, // Məhsulun təsiri
    skinType: { type: String, default: "" }, // Dərinin tipi
    hairType: { type: String, default: "" }, // Saçın tipi

    targetType: [
      {
        type: String,
      },
    ],

    concerns: [
      {
        type: String,
      },
    ],

    ingredients: {
      type: String,
      default: "",
    },

    usage: {
      type: String,
      default: "",
    },

    stock: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ['active', 'passive', 'out_of_stock'],
      default: 'active',
    },
    sku: {
      type: String,
      unique: true,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Pre-save middleware: sync isActive and auto-set status based on stock
productSchema.pre('save', function(next) {
  if (typeof next === 'function') {
    if (this.stock > 0 && this.status !== 'passive') {
      this.status = 'active';
      this.isActive = true;
    } else if (this.stock <= 0 && this.status !== 'passive') {
      this.status = 'out_of_stock';
      this.isActive = false;
    } else if (this.status === 'passive') {
      this.isActive = false;
    }
    next();
  }
});

// Pre-update middleware: sync isActive and auto-set status based on stock
productSchema.pre('findOneAndUpdate', function(next) {
  if (typeof next === 'function') {
    const update = this.getUpdate();
    if (update) {
      // If status is explicitly set, use that
      if (update.status) {
        if (update.status === 'active') {
          update.isActive = true;
        } else {
          update.isActive = false;
        }
      }
      // If stock is being updated, auto-set status if not explicitly set
      else if (update.stock !== undefined) {
        if (update.stock > 0) {
          update.status = 'active';
          update.isActive = true;
        } else {
          update.status = 'out_of_stock';
          update.isActive = false;
        }
      }
    }
    next();
  }
});

module.exports = mongoose.model("Product", productSchema);
