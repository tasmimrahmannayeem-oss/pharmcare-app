const express = require('express');
const router = express.Router();

console.log('🔧 mlRoutes loaded');

const {
  getSalesForecast,
  getRestockPredictions,
  getSmartInsights
} = require('../controllers/mlController');

const { protect, authorize } = require('../middleware/auth');

router.get(
  '/forecast',
  protect,
  authorize('Pharmacy Owner', 'Pharmacist', 'Super Admin'),
  getSalesForecast
);

router.get(
  '/restock',
  protect,
  authorize(
    'Pharmacy Owner',
    'Pharmacist',
    'Super Admin',
    'Store Assistant'
  ),
  getRestockPredictions
);

router.get('/insights', getSmartInsights);

module.exports = router;