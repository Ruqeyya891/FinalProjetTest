const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    description: {
      type: String,
    },

    price_catalog: {
      type: Number,
      required: true,
    },

    price_anbar: {
      type: Number,
      required: true,
      default: 0,
    },

    price_sale: {
      type: Number,
      required: true,
    },

    image: {
      type: String,
      required: true,
      trim: true,
    },

    images: [
      {
        type: String,
      },
    ],

    category: {
      type: String,
      required: true,
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
    },

    usage: {
      type: String,
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
