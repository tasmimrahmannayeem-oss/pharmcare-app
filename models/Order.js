const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pharmacy: { type: mongoose.Schema.Types.ObjectId, ref: 'Pharmacy', required: true },
  medicines: [{
    medicine: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true }
  }],
  totalAmount: { type: Number, required: true },
  prescriptionImage: { type: String }, // Path to uploaded image
  requiresPrescription: { type: Boolean, default: false },
  status: { 
    type: String, 
    enum: [
      'Pending',          // Checkout created
      'Confirmed',        // Payment successful
      'Being Processed',  // Pharmacist reviewing / approved
      'Dispatched',       // Out for delivery
      'Delivered',        // Completed
      'Cancelled',        // Cancelled by user
      'Rejected'          // Prescription rejected by pharmacist
    ],
    default: 'Pending'
  },
  paymentMethod: {
    type: String,
    enum: ['Cash on Delivery', 'bKash', 'Nagad', 'Card', 'Cash'],
    default: 'Cash on Delivery'
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed'],
    default: 'Pending'
  },
  statusTimeline: [{
    status: String,
    note: String,
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
