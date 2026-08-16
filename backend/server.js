console.log("RUNNING SERVER:", __filename);
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded prescription images as static files
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI || MONGO_URI.includes('YOUR')) {
    console.error('\n############################################################');
    console.error('ERROR: VALID MONGO_URI NOT FOUND IN .ENV');
    console.error('Please update backend/.env with your MongoDB Atlas or Local URI');
    console.error('############################################################\n');
}

mongoose
    .connect(MONGO_URI)
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
const mlRoutes = require('./routes/mlRoutes');

// Status Route
app.get('/api/status', (req, res) => {
    res.json({
        status: 'API is running',
        dbState: mongoose.connection.readyState,
        dbName: mongoose.connection.name
    });
});

// Direct test route
app.get('/api/ml/test2', (req, res) => {
    res.json({
        success: true,
        message: 'DIRECT SERVER ROUTE WORKS'
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/pharmacies', pharmacyRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ml', mlRoutes);

console.log('✅ Mounted /api/ml');

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
