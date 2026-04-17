const User = require('../models/User');

// Get all users
exports.getUsers = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role !== 'Super Admin' && req.user.assignedPharmacy) {
      filter.assignedPharmacy = req.user.assignedPharmacy;
    }
    const users = await User.find(filter).select('-password').populate('assignedPharmacy', 'name');
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
    const filter = { isApproved: false };
    if (req.user.role !== 'Super Admin' && req.user.assignedPharmacy) {
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

// @desc    Admin forceful password reset
exports.adminResetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.password = newPassword;
    await user.save(); // Triggers the schema pre-save bcrypt hashing hook

    res.json({ message: 'Password has been successfully reset' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
