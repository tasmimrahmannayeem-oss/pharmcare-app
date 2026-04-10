const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Should be hashed in production
  role: { 
    type: String, 
    required: true,
    enum: ['Super Admin', 'Pharmacy Owner', 'Pharmacist', 'Store Assistant', 'Customer', 'Supplier'],
    default: 'Customer'
  },
  contactInfo: {
    phone: { type: String },
    address: { type: String }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
