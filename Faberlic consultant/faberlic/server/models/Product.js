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

    price_catalog: {
      type: String,
      default: "",
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

module.exports = mongoose.model("Product", productSchema);
