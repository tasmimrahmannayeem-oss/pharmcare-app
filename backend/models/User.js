const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    required: true,
    enum: ['Super Admin', 'Pharmacy Owner', 'Pharmacist', 'Store Assistant', 'Customer', 'Supplier'],
    default: 'Customer'
  },
  phone: { type: String },
  address: { type: String },
  assignedPharmacy: { type: mongoose.Schema.Types.ObjectId, ref: 'Pharmacy' },
  isApproved: { type: Boolean, default: false }, // Staff and Suppliers need approval
  
  // Password Recovery
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  otpCode: String,
  otpExpire: Date,
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
