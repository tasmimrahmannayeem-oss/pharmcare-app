const express = require('express');
const router = express.Router();
const { getPharmacyOwnerAnalytics, getSystemWideAnalytics } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/owner', authorize('Pharmacy Owner'), getPharmacyOwnerAnalytics);
router.get('/system', authorize('Super Admin'), getSystemWideAnalytics);

module.exports = router;
