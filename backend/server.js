const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI || MONGO_URI.includes('<username>')) {
  console.error('\n############################################################');
  console.error('ERROR: VALID MONGO_URI NOT FOUND IN .ENV');
  console.error('Please update backend/.env with your MongoDB Atlas or Local URI');
  console.error('############################################################\n');
}

mongoose.connect(MONGO_URI)
.then(() => console.log('✅ MongoDB successfully connected'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  console.error('Make sure your IP is whitelisted in Atlas and credentials are correct.');
});

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const medicineRoutes = require('./routes/medicineRoutes');
const orderRoutes = require('./routes/orderRoutes');
const pharmacyRoutes = require('./routes/pharmacyRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

// Basic route to test connection
app.get('/api/status', (req, res) => {
  res.json({ status: 'API is running', dbState: mongoose.connection.readyState });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/pharmacies', pharmacyRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/analytics', analyticsRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
