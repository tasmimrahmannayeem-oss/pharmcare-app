const express = require('express');
const router = express.Router();
const medicineController = require('../controllers/medicineController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', medicineController.getMedicines);
router.get('/:id', medicineController.getMedicineById);

// Protected management routes
router.post('/', authorize('Pharmacist', 'Pharmacy Owner', 'superadmin'), medicineController.createMedicine);
router.patch('/:id', authorize('Pharmacist', 'Pharmacy Owner', 'superadmin'), medicineController.updateMedicine);
router.delete('/:id', authorize('Pharmacist', 'Pharmacy Owner', 'superadmin'), medicineController.deleteMedicine);

module.exports = router;
