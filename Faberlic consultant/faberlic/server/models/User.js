const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    customerCode: {
      type: String,
      required: true,
      unique: true,
      match: /^\d+$/, // Only digits
    },

    accessKeyHash: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      default: "user",
      enum: ["user", "admin"],
    },

    // Keep old fields for backward compatibility
    name: String,
    surname: String,
    username: String,
    password: String,
    gender: {
      type: String,
      enum: ["female"],
      default: "female"
    },

    cart: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        variantSku: {
          type: String,
          default: null,
        },
        variantName: {
          type: String,
          default: null,
        },
        quantity: {
          type: Number,
          default: 1,
        },
      },
    ],
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("User", userSchema);
