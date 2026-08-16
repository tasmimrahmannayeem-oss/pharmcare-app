const User = require('../models/User');

// Get all users (Super Admin sees all; Pharmacy Owner sees only their pharmacy's staff)
exports.getUsers = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'Pharmacy Owner') {
      // Only show users belonging to the same pharmacy as the logged-in owner
      filter.assignedPharmacy = req.user.assignedPharmacy;
    }
    const users = await User.find(filter).select('-password').populate('assignedPharmacy', 'name location address');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve/Reject User Registration
exports.approveUser = async (req, res) => {
  try {
    const { status } = req.body; // true or false
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isApproved = status;
    await user.save();
    
    res.json({ message: `User ${user.name} has been ${status ? 'Approved' : 'Rejected/Pending'}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get pending registrations
exports.getPendingUsers = async (req, res) => {
  try {
    let filter = { isApproved: false };
    if (req.user.role === 'Pharmacy Owner') {
      // Pharmacy Owners only see pending users from their own pharmacy
      filter.assignedPharmacy = req.user.assignedPharmacy;
    }
    const users = await User.find(filter).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
    if (!updated) return res.status(404).json({ message: 'User not found' });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Reset user password (Super Admin only)
exports.resetUserPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.password = newPassword; // pre('save') hook will hash it
    await user.save();
    res.json({ message: 'Password reset successful.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
