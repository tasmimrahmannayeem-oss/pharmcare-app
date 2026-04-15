const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect); // All order routes require login

router.get('/', orderController.getOrders);
router.post('/', upload.single('prescriptionImage'), orderController.createOrder);
router.post('/pos', authorize('Pharmacist', 'Store Assistant', 'Pharmacy Owner'), orderController.createPOSOrder);
router.get('/:id', orderController.getOrderById);

// Order Lifecycle
router.patch('/:id/confirm', orderController.confirmOrder);
router.patch('/:id/verify', authorize('Pharmacist', 'Pharmacy Owner'), orderController.verifyOrder);
router.patch('/:id/status', authorize('Pharmacist', 'Store Assistant', 'Pharmacy Owner'), orderController.updateOrderStatus);
router.delete('/:id/cancel', orderController.cancelOrder);

module.exports = router;
