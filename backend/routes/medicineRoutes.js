const express = require('express');
const router = express.Router();
const medicineController = require('../controllers/medicineController');

router.get('/', medicineController.getMedicines);
router.post('/', medicineController.createMedicine);
router.get('/:id', medicineController.getMedicineById);
router.patch('/:id', medicineController.updateMedicine);
router.delete('/:id', medicineController.deleteMedicine);

module.exports = router;
