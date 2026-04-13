const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
};

// @desc    Register user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone, address, assignedPharmacy } = req.body;
    
    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    // Auto-approve Customers, others need manual approval
    const isApproved = (role === 'Customer');

    const user = await User.create({
      name, email, password, role, phone, address, assignedPharmacy, isApproved
    });

    if (user) {
      if (!isApproved) {
        return res.status(201).json({ 
          message: 'Registration successful. Please wait for an admin to approve your account.' 
        });
      }
      
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      // Check approval
      if (user.role !== 'Customer' && !user.isApproved) {
        return res.status(403).json({ message: 'Your account is pending approval.' });
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Forgot Password (OTP simulation)
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No user with that email' });

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    user.otpCode = otp;
    user.otpExpire = Date.now() + 60 * 1000; // 1 minute
    await user.save();

    console.log(`[SIMULATION] Verification OTP for ${email}: ${otp}`);
    res.json({ message: 'OTP sent to registered mobile number (Simulated in logs)' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
