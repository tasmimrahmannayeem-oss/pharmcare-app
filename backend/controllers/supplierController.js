const RestockOrder = require('../models/RestockOrder');
const Medicine = require('../models/Medicine');

// @desc    Get all restock requests for a supplier
exports.getRestockOrders = async (req, res) => {
  try {
    const orders = await RestockOrder.find({ supplier: req.user._id })
      .populate('pharmacy', 'name location')
      .populate('items.medicine', 'name genericName');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Supplier Accept/Reject Restock
exports.updateRestockStatus = async (req, res) => {
  try {
    const { status, estimatedDeliveryDate, notes } = req.body;
    const order = await RestockOrder.findById(req.params.id);
    
    if (!order) return res.status(404).json({ message: 'Restock order not found' });
    if (order.supplier.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }

    order.status = status;
    if (estimatedDeliveryDate) order.estimatedDeliveryDate = estimatedDeliveryDate;
    if (notes) order.notes = notes;

    // If delivered, update pharmacy stock? 
    // In a real flow, this might happen when the pharmacy owner confirms receipt.
    
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Request restock (Pharmacy Owner)
exports.requestRestock = async (req, res) => {
  try {
    const { supplier, items, notes } = req.body;
    const order = await RestockOrder.create({
      pharmacy: req.user.assignedPharmacy,
      supplier,
      items,
      notes
    });
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
