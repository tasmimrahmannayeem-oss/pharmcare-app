const mongoose = require('mongoose');

const restockOrderSchema = new mongoose.Schema({
  pharmacy: { type: mongoose.Schema.Types.ObjectId, ref: 'Pharmacy', required: true },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    medicine: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
    quantity: { type: Number, required: true }
  }],
  status: {
    type: String,
    enum: ['Requested', 'Accepted', 'Rejected', 'Delivered'],
    default: 'Requested'
  },
  estimatedDeliveryDate: { type: Date },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('RestockOrder', restockOrderSchema);
