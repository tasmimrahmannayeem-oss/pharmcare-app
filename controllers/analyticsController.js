const Order = require('../models/Order');
const Medicine = require('../models/Medicine');
const User = require('../models/User');
const Pharmacy = require('../models/Pharmacy');
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
    // 1. Overall System Stats
    const totalUsers = await User.countDocuments();
    const totalPharmacies = await Pharmacy.countDocuments();
    const totalRevenueData = await Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = totalRevenueData[0]?.total || 0;

    // 2. Daily Stats (Rx Today)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const rxTodayData = await Order.aggregate([
      { $match: { createdAt: { $gte: todayStart }, status: { $ne: 'Cancelled' } } },
      { $group: { _id: '$pharmacy', count: { $sum: 1 } } }
    ]);

    // 3. Alerts (Low stock or expiring)
    // For simplicity, we assume global thresholds if branch-specific ones aren't easily accessible in aggregation
    const alertsData = await Medicine.aggregate([
      { 
        $match: { 
          $or: [
            { stockQuantity: { $lte: 10 } }, // Default low stock
            { expiryDate: { $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } } // Expiring in 30 days
          ]
        }
      },
      { $group: { _id: '$pharmacy', count: { $sum: 1 } } }
    ]);

    // 4. Pharmacy Network detailed Breakdown
    const pharmacyStats = await Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      { 
        $group: { 
          _id: '$pharmacy', 
          revenue: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 }
        } 
      },
      {
        $lookup: {
          from: 'pharmacies',
          localField: '_id',
          foreignField: '_id',
          as: 'details'
        }
      },
      { $unwind: '$details' },
      {
        $lookup: {
          from: 'users',
          localField: 'details.owner',
          foreignField: '_id',
          as: 'owner'
        }
      },
      { 
        $project: {
          name: '$details.name',
          location: '$details.location',
          ownerName: { $ifNull: [{ $arrayElemAt: ['$owner.name', 0] }, 'N/A'] },
          revenue: 1,
          orderCount: 1,
          status: { $literal: 'Online' } // Placeholder status
        }
      }
    ]);

    // Map rxToday and alerts to pharmacyStats
    const finalStats = pharmacyStats.map(stat => {
      const rxToday = rxTodayData.find(r => r._id.toString() === stat._id.toString())?.count || 0;
      const alerts = alertsData.find(a => a._id.toString() === stat._id.toString())?.count || 0;
      return { ...stat, rxToday, alerts };
    });

    // Also include pharmacies with NO orders yet
    const allPharmacies = await Pharmacy.find().populate('owner', 'name');
    allPharmacies.forEach(p => {
      if (!finalStats.find(s => s._id.toString() === p._id.toString())) {
        finalStats.push({
          _id: p._id,
          name: p.name,
          location: p.location,
          ownerName: p.owner?.name || 'N/A',
          revenue: 0,
          orderCount: 0,
          status: 'Online',
          rxToday: 0,
          alerts: 0
        });
      }
    });

    res.json({
      summary: {
        totalRevenue,
        totalPharmacies,
        totalUsers,
        systemFlags: alertsData.reduce((acc, curr) => acc + curr.count, 0)
      },
      pharmacies: finalStats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
