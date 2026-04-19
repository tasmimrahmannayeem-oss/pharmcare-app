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

// @desc    Get real-time dashboard analytics for Supplier
exports.getSupplierDashboardData = async (req, res) => {
  try {
    const supplierId = req.user._id;

    // 1. Fetch all orders for this supplier
    const orders = await RestockOrder.find({ supplier: supplierId })
      .populate('pharmacy', 'name location')
      .populate('items.medicine', 'name genericName purchasePrice');

    // 2. Fetch Low Stock Alerts (medicines supplied by this supplier)
    const lowStockMedicines = await Medicine.find({
      supplier: supplierId,
      stockQuantity: { $lte: 20 }
    }).populate('pharmacy', 'name');

    // MTD Revenue Calculation
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    let mtdRevenue = 0;
    const recentOrders = [];
    let activeCount = 0;
    const uniqueClients = new Set();

    orders.forEach(o => {
      if (o.pharmacy) uniqueClients.add(o.pharmacy._id.toString());
      
      let orderValue = 0;
      let orderItemsDesc = '';

      o.items.forEach((item, index) => {
        const med = item.medicine;
        if (med) {
          orderValue += item.quantity * (med.purchasePrice || 0);
          if (index < 2) {
             orderItemsDesc += `${med.name} ×${item.quantity}${index === 0 && o.items.length > 1 ? ', ' : ''}`;
          }
        }
      });
      if (o.items.length > 2) orderItemsDesc += ` +${o.items.length - 2} more`;

      // Add to MTD revenue if delivered this month
      // if (o.status === 'Delivered' && new Date(o.updatedAt) >= firstDayOfMonth) {
      // Actually we'll count all accepted or delivered this month for now
      if (['Accepted', 'Delivered'].includes(o.status) && new Date(o.createdAt) >= firstDayOfMonth) {
        mtdRevenue += orderValue;
      }

      if (['Requested', 'Accepted'].includes(o.status)) {
        activeCount++;
      }

      recentOrders.push({
        id: `PO-${o._id.toString().slice(-6).toUpperCase()}`,
        _rawId: o._id,
        items: orderItemsDesc || 'No items',
        status: o.status,
        date: new Date(o.createdAt).toLocaleDateString(),
        value: orderValue,
        rawDate: new Date(o.createdAt)
      });
    });

    // Sort recent orders descending
    recentOrders.sort((a,b) => b.rawDate - a.rawDate);

    // Format Low Stock
    const stockAlerts = lowStockMedicines.map(m => ({
      name: m.name,
      client: m.pharmacy ? m.pharmacy.name : 'Unknown Branch',
      stock: m.stockQuantity,
      threshold: 20
    }));

    res.json({
      revenueMTD: mtdRevenue,
      activeOrdersCount: activeCount,
      clientCount: uniqueClients.size,
      recentOrders: recentOrders.slice(0, 5),
      stockAlerts
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
