const express = require('express');
const router = express.Router();
const { getRestockOrders, updateRestockStatus, requestRestock, getSupplierDashboardData } = require('../controllers/supplierController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/dashboard', authorize('Supplier'), getSupplierDashboardData);
router.get('/orders', authorize('Supplier'), getRestockOrders);
router.patch('/orders/:id', authorize('Supplier'), updateRestockStatus);
router.post('/request', authorize('Pharmacy Owner'), requestRestock);

module.exports = router;
