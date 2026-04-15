const Order = require('../models/Order');
const Medicine = require('../models/Medicine');

// @desc    Get all orders
exports.getOrders = async (req, res) => {
  try {
    const filter = {};
    // If not superadmin, maybe filter by pharmacy? (Future improvement)
    const orders = await Order.find(filter)
      .populate('customer', 'name email')
      .populate('pharmacy', 'name location')
      .populate('medicines.medicine', 'name requiresPrescription');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Checkout / Place Order
exports.createOrder = async (req, res) => {
  try {
    let { pharmacy, medicines, totalAmount } = req.body;
    
    // Parse medicines if it's a string (happens with multipart/form-data)
    if (typeof medicines === 'string') {
      try {
        medicines = JSON.parse(medicines);
      } catch (e) {
        return res.status(400).json({ message: 'Invalid medicines data format' });
      }
    }

    // Check if any medicine requires a prescription
    const medsRequiringRx = await Medicine.find({
      _id: { $in: medicines.map(m => m.medicine) },
      requiresPrescription: true
    });

    if (medsRequiringRx.length > 0 && !req.file) {
      return res.status(400).json({ message: 'Order contains prescription-only medicine. Please upload a prescription copy.' });
    }

    const order = new Order({
      customer: req.user._id,
      pharmacy,
      medicines,
      totalAmount,
      prescriptionImage: req.file ? req.file.path : null,
      statusTimeline: [{ status: 'Pending', note: 'Order placed by customer' }]
    });

    const savedOrder = await order.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    POS Sale (Staff Walk-in)
exports.createPOSOrder = async (req, res) => {
  try {
    let { pharmacy, medicines, totalAmount, paymentMethod } = req.body;
    
    // Auto-assign pharmacy from staff if not provided hrdcoded
    if (!pharmacy && req.user.assignedPharmacy) {
      pharmacy = req.user.assignedPharmacy;
    }

    if (!pharmacy) {
      return res.status(400).json({ message: 'No pharmacy branch assigned to this transaction' });
    }
    
    // Decrement stock immediately
    for (const item of medicines) {
      const medicine = await Medicine.findById(item.medicine);
      if (!medicine || medicine.stockQuantity < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${medicine?.name || 'item'}` });
      }
      medicine.stockQuantity -= item.quantity;
      await medicine.save();
    }

    const order = new Order({
      customer: req.user?._id || null, 
      pharmacy,
      medicines,
      totalAmount,
      status: 'Confirmed',
      paymentStatus: 'Paid',
      statusTimeline: [{ status: 'Confirmed', note: `POS Sale completed via ${paymentMethod}` }]
    });

    const savedOrder = await order.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Simulate Payment & Confirm Order
exports.confirmOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.status !== 'Pending') {
      return res.status(400).json({ message: `Cannot confirm order in ${order.status} state` });
    }

    // Atomic stock decrement
    for (const item of order.medicines) {
      const medicine = await Medicine.findById(item.medicine);
      if (medicine.stockQuantity < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${medicine.name}` });
      }
      medicine.stockQuantity -= item.quantity;
      await medicine.save();
    }

    order.status = 'Confirmed';
    order.paymentStatus = 'Paid';
    order.statusTimeline.push({ status: 'Confirmed', note: 'Payment received. Stock allocated.' });
    
    await order.save();
    res.json({ message: 'Payment confirmed and stock updated', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Pharmacist Verification (Approve / Reject)
exports.verifyOrder = async (req, res) => {
  try {
    const { action, note } = req.body; // action: 'Approve' or 'Reject'
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.status !== 'Confirmed') {
      return res.status(400).json({ message: 'Order must be Confirmed before verification' });
    }

    if (action === 'Approve') {
      order.status = 'Being Processed';
      order.statusTimeline.push({ status: 'Being Processed', note: note || 'Pharmacist approved prescription' });
    } else {
      order.status = 'Rejected';
      order.statusTimeline.push({ status: 'Rejected', note: note || 'Prescription rejected by pharmacist' });
      // Logic for refund could go here
    }

    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update Status (Internal Staff)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = status;
    order.statusTimeline.push({ status, note });
    
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email')
      .populate('pharmacy', 'name location')
      .populate('medicines.medicine', 'name requiresPrescription sellPrice');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel Order (Customer)
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (['Dispatched', 'Delivered'].includes(order.status)) {
      return res.status(400).json({ message: 'Cannot cancel order after it has been dispatched' });
    }

    // Restore stock if it was already confirmed
    if (order.status !== 'Pending' && order.status !== 'Cancelled' && order.status !== 'Rejected') {
      for (const item of order.medicines) {
        const medicine = await Medicine.findById(item.medicine);
        medicine.stockQuantity += item.quantity;
        await medicine.save();
      }
    }

    order.status = 'Cancelled';
    order.statusTimeline.push({ status: 'Cancelled', note: 'Order cancelled by customer' });
    
    await order.save();
    res.json({ message: 'Order cancelled and stock restored if applicable', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
