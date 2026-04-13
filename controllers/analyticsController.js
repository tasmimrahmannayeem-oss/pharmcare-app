const Order = require('../models/Order');
const Medicine = require('../models/Medicine');
const mongoose = require('mongoose');

// @desc    Pharmacy Owner Analytics
exports.getPharmacyOwnerAnalytics = async (req, res) => {
  try {
    const pharmacyId = req.user.assignedPharmacy;
    if (!pharmacyId) return res.status(400).json({ message: 'User not assigned to a pharmacy' });

    // 1. Total Sales & Profit Aggregation
    const salesData = await Order.aggregate([
      { $match: { pharmacy: new mongoose.Types.ObjectId(pharmacyId), status: { $ne: 'Cancelled' } } },
      { $unwind: '$medicines' },
      {
        $lookup: {
          from: 'medicines',
          localField: 'medicines.medicine',
          foreignField: '_id',
          as: 'medDetail'
        }
      },
      { $unwind: '$medDetail' },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$totalAmount' },
          totalProfit: { $sum: { $multiply: [ { $subtract: ['$medicines.price', '$medDetail.purchasePrice'] }, '$medicines.quantity' ] } }
        }
      }
    ]);

    // 2. Top Selling Meds
    const topMeds = await Order.aggregate([
      { $match: { pharmacy: new mongoose.Types.ObjectId(pharmacyId), status: { $ne: 'Cancelled' } } },
      { $unwind: '$medicines' },
      {
        $group: {
          _id: '$medicines.medicine',
          soldCount: { $sum: '$medicines.quantity' }
        }
      },
      { $sort: { soldCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'medicines',
          localField: '_id',
          foreignField: '_id',
          as: 'details'
        }
      }
    ]);

    res.json({
      summary: salesData[0] || { totalSales: 0, totalProfit: 0 },
      topMeds
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    System Owner Aggregated Analytics
exports.getSystemWideAnalytics = async (req, res) => {
  try {
    const aggregateData = await Order.aggregate([
        { $match: { status: { $ne: 'Cancelled' } } },
        { 
            $group: { 
                _id: '$pharmacy', 
                totalSales: { $sum: '$totalAmount' },
                orderCount: { $sum: 1 }
            } 
        },
        {
            $lookup: {
                from: 'pharmacies',
                localField: '_id',
                foreignField: '_id',
                as: 'pharmacyDetails'
            }
        }
    ]);

    res.json(aggregateData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
