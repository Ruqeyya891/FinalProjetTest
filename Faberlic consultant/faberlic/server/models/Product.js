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
    catalogPrices: [
      {
        catalogId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "CatalogCycle",
          required: true,
        },
        catalogPrice: {
          type: Number,
          required: true,
        },
        salePrice: {
          type: Number,
          required: true,
        },
        discountPercent: {
          type: Number,
          default: 0,
        },
        isPromotion: {
          type: Boolean,
          default: false,
        },
        isSuperPrice: {
          type: Boolean,
          default: false,
        },
      },
    ],

    images: {
    type: [String],
    default: []
  },
  commonImages: {
    type: [String],
    default: []
  },

    weight: {
      value: { type: Number, min: 0, default: null },
      unit: { type: String, enum: ['q', 'kq'], default: 'q' }
    },

    volume: {
      value: { type: Number, min: 0, default: null },
      unit: { type: String, enum: ['ml', 'l'], default: 'ml' }
    },
    // Old category fields (backward compatibility)
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
    // New categories array for multiple categories
    categories: [
      {
        categoryName: { type: String, required: true },
        categorySlug: { type: String, required: true },
        subCategoryName: { type: String, default: "" },
        subCategorySlug: { type: String, default: "" },
        childCategoryName: { type: String, default: "" },
        childCategorySlug: { type: String, default: "" }
      }
    ],

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

    variants: [
      {
        sku: { type: String, required: true },
        name: { type: String, required: true },
        image: { type: String, default: "" },
        variantImage: { type: String, default: "" },
        images: { type: [String], default: [] },
        stock: { type: Number, default: 0 },
        status: { 
          type: String, 
          enum: ['active', 'passive', 'out_of_stock'], 
          default: 'active' 
        },
        description: { type: String, default: "" },
        ingredients: { type: String, default: "" },
        usage: { type: String, default: "" },
        weight: {
          value: { type: Number, min: 0, default: null },
          unit: { type: String, enum: ['q', 'kq'], default: 'q' }
        },
        volume: {
          value: { type: Number, min: 0, default: null },
          unit: { type: String, enum: ['ml', 'l'], default: 'ml' }
        }
      }
    ]
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Pre-save middleware: sync isActive, auto-set status, and copy categories to old fields
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

    // Copy first category to old single-category fields for backward compatibility
    if (this.categories && this.categories.length > 0) {
      const firstCat = this.categories[0];
      this.categoryName = firstCat.categoryName;
      this.categorySlug = firstCat.categorySlug;
      this.subCategoryName = firstCat.subCategoryName;
      this.subCategorySlug = firstCat.subCategorySlug;
      this.childCategoryName = firstCat.childCategoryName;
      this.childCategorySlug = firstCat.childCategorySlug;
    }

    next();
  }
});

// Pre-update middleware: sync isActive, auto-set status, and copy categories to old fields
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

      // Copy first category to old single-category fields for backward compatibility
      if (update.categories && update.categories.length > 0) {
        const firstCat = update.categories[0];
        update.categoryName = firstCat.categoryName;
        update.categorySlug = firstCat.categorySlug;
        update.subCategoryName = firstCat.subCategoryName;
        update.subCategorySlug = firstCat.subCategorySlug;
        update.childCategoryName = firstCat.childCategoryName;
        update.childCategorySlug = firstCat.childCategorySlug;
      }
    }
    next();
  }
});

module.exports = mongoose.model("Product", productSchema);
