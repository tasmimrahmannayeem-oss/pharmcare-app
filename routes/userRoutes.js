const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', authorize('Super Admin', 'Pharmacy Owner'), userController.getUsers);
router.get('/pending', authorize('Super Admin', 'Pharmacy Owner'), userController.getPendingUsers);
router.get('/:id', userController.getUserById);
router.patch('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.patch('/:id/approve', authorize('Super Admin', 'Pharmacy Owner'), userController.approveUser);

module.exports = router;
