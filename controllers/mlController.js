const mongoose = require('mongoose');
const Order = require('../models/Order');
const Medicine = require('../models/Medicine');
const {
  generateSalesForecast,
  generateRestockPredictions,
  detectSeasonalTrends,
  getTopPredictedProducts
} = require('../services/forecastService');

exports.getSalesForecast = async (req, res) => {
  try {
    let pharmacyId = req.query.pharmacyId;
    if (req.user && req.user.assignedPharmacy) {
      pharmacyId = req.user.assignedPharmacy;
    }
    const days = parseInt(req.query.days) || 7;

    const query = {};
    if (pharmacyId) {
      query.pharmacy = pharmacyId;
    }

    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    query.createdAt = { $gte: ninetyDaysAgo };

    const orders = await Order.find(query).sort({ createdAt: 1 });

    const forecastData = generateSalesForecast(orders, days);
    const seasonalTrends = detectSeasonalTrends(orders);
    const topPredictedProducts = getTopPredictedProducts(orders);

    res.json({
      success: true,
      data: {
        ...forecastData,
        seasonalTrends,
        topPredictedProducts
      }
    });

  } catch (error) {
    console.error('Error generating sales forecast:', error);
    res.status(500).json({ success: false, message: 'Failed to generate forecast' });
  }
};

exports.getRestockPredictions = async (req, res) => {
  try {
    let pharmacyId = req.query.pharmacyId;
    if (req.user && req.user.assignedPharmacy) {
      pharmacyId = req.user.assignedPharmacy;
    }

    const medicineQuery = {};
    const orderQuery = {};
    if (pharmacyId) {
      medicineQuery.pharmacy = pharmacyId;
      orderQuery.pharmacy = pharmacyId;
    }

    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    orderQuery.createdAt = { $gte: sixtyDaysAgo };

    const medicines = await Medicine.find(medicineQuery);
    const orders = await Order.find(orderQuery).sort({ createdAt: 1 });

    const predictions = generateRestockPredictions(medicines, orders);

    res.json({
      success: true,
      data: predictions
    });

  } catch (error) {
    console.error('Error generating restock predictions:', error);
    res.status(500).json({ success: false, message: 'Failed to generate restock predictions' });
  }
};

exports.getSmartInsights = async (req, res) => {
  try {
    let pharmacyId = req.query.pharmacyId;
    if (req.user && req.user.assignedPharmacy) {
      pharmacyId = req.user.assignedPharmacy;
    }

    const medicineQuery = {};
    const orderQuery = {};
    if (pharmacyId) {
      medicineQuery.pharmacy = pharmacyId;
      orderQuery.pharmacy = pharmacyId;
    }

    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    orderQuery.createdAt = { $gte: ninetyDaysAgo };

    const medicines = await Medicine.find(medicineQuery);
    const orders = await Order.find(orderQuery).sort({ createdAt: 1 });

    const forecastData = generateSalesForecast(orders, 7);
    const predictions = generateRestockPredictions(medicines, orders);
    const seasonalTrends = detectSeasonalTrends(orders);
    const topPredictedProducts = getTopPredictedProducts(orders);

    const itemsNeedingRestock = predictions.filter(p => p.urgency !== 'healthy').length;
    const criticalAlertsCount = predictions.filter(p => p.urgency === 'critical').length;

    res.json({
      success: true,
      data: {
        forecast: forecastData,
        restock: predictions,
        seasonalTrends,
        topPredictedProducts,
        summaryStats: {
          totalPredictedRevenueWeekly: forecastData.predictedRevenue.weekly,
          totalPredictedRevenueMonthly: forecastData.predictedRevenue.monthly,
          itemsNeedingRestock,
          criticalAlertsCount
        }
      }
    });

  } catch (error) {
    console.error('Error generating smart insights:', error);
    res.status(500).json({ success: false, message: 'Failed to generate smart insights' });
  }
};
