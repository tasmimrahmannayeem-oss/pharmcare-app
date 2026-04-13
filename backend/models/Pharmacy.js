const mongoose = require('mongoose');

const pharmacySchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  address: { type: String },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  contactPhone: { type: String },
  settings: {
    expiryAlertThresholdDays: { type: Number, default: 30 },
    lowStockThreshold: { type: Number, default: 10 }
  }
}, { timestamps: true });

module.exports = mongoose.model('Pharmacy', pharmacySchema);
