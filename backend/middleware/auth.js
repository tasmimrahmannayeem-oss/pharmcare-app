const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized to access this route' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = await User.findById(decoded.id).populate('assignedPharmacy');
    if (!req.user) return res.status(404).json({ message: 'No user found with this id' });
    
    // Check if approved (Staff roles: Pharmacist, Assistant, Owner, Super Admin and Customer are approved)
    const isApprovedRole = ['Customer', 'Pharmacist', 'Store Assistant', 'Pharmacy Owner', 'Super Admin', 'pharmacist', 'assistant', 'owner', 'superadmin'].includes(req.user.role);
    if (!isApprovedRole && req.user.isApproved === false) {
      return res.status(403).json({ message: 'Your account is pending approval by an admin.' });
    }

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized to access this route' });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Role ${req.user.role} is not authorized to access this route` });
    }
    next();
  };
};
