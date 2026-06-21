const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: { type: String, required: true },
        sku: { type: String },
        image: { type: String },
        price: { type: Number, required: true },
        quantity: { type: Number, default: 1, required: true },
        total: { type: Number, required: true }
    }],
    // Keep products array for backward compatibility
    products: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: { type: Number, default: 1 },
        price: { type: Number }
    }],
    totalAmount: { type: Number, required: true },
    catalogId: { type: mongoose.Schema.Types.ObjectId, ref: 'CatalogCycle' },
    catalogNumber: { type: String },
    catalogStartDate: { type: Date },
    catalogEndDate: { type: Date },
    paymentDeadline: { type: Date },
    orderStatus: { type: String, enum: ['pending_payment', 'paid', 'preparing', 'shipped', 'delivered', 'cancelled'], default: 'pending_payment' },
    paymentStatus: { type: String, enum: ['unpaid', 'paid'], default: 'unpaid' },
    paymentMethod: { type: String, enum: ['card_transfer', 'whatsapp_confirmation'], required: true },
    contactMethod: { type: String, enum: ['whatsapp', 'instagram'], required: true },
    notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
