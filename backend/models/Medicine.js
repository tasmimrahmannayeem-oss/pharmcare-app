const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  genericName: { type: String },
  description: { type: String },
  batchNumber: { type: String, required: true },
  stockQuantity: { type: Number, required: true, default: 0 },
  purchasePrice: { type: Number, required: true },
  sellPrice: { type: Number, required: true },
  manufacturer: { type: String },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  pharmacy: { type: mongoose.Schema.Types.ObjectId, ref: 'Pharmacy', required: true },
  mfgDate: { type: Date },
  expiryDate: { type: Date, required: true },
  requiresPrescription: { type: Boolean, default: false },
  sku: { type: String } // Optional SKU
}, { timestamps: true });

// Index for searches
medicineSchema.index({ name: 'text', genericName: 'text' });

module.exports = mongoose.model('Medicine', medicineSchema);
