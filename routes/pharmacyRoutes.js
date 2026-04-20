const express = require('express');
const router = express.Router();
const { getPharmacies, createPharmacy, updatePharmacy, deletePharmacy, getPharmacyById } = require('../controllers/pharmacyController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', getPharmacies);
router.get('/:id', getPharmacyById);
router.post('/', authorize('Super Admin'), createPharmacy);
router.patch('/:id', authorize('Super Admin', 'Pharmacy Owner'), updatePharmacy);
router.delete('/:id', authorize('Super Admin'), deletePharmacy);

module.exports = router;
