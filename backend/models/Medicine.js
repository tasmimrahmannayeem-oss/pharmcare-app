const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  sku: { type: String, required: true, unique: true },
  price: { type: Number, required: true },
  stockQuantity: { type: Number, required: true, default: 0 },
  manufacturer: { type: String },
  requiresPrescription: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Medicine', medicineSchema);
