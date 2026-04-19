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

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI ? process.env.MONGO_URI.trim() : '';

if (!MONGO_URI || MONGO_URI.includes('<username>')) {
  console.error('\n############################################################');
  console.error('ERROR: VALID MONGO_URI NOT FOUND IN .ENV');
  console.error('Please update backend/.env with your MongoDB Atlas or Local URI');
  console.error('############################################################\n');
}

const { MongoMemoryServer } = require('mongodb-memory-server');
const { seedDatabase } = require('./dbSeeder');

const startServer = async () => {
  try {
    // 1. Try primary connection
    console.log('Attempting to connect to primary MongoDB...');
    try {
      await mongoose.connect(MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
        family: 4
      });
      console.log('✅ MongoDB successfully connected (Atlas)');
    } catch (err) {
      console.warn('⚠️ Atlas connection failed:', err.message);
      console.log('🚀 Falling back to In-Memory MongoDB for local development...');
      
      const mongoServer = await MongoMemoryServer.create();
      const localUri = mongoServer.getUri();
      
      await mongoose.connect(localUri);
      console.log('✅ MongoDB successfully connected (In-Memory)');
      
      // Auto-seed for fresh in-memory DB
      await seedDatabase();
    }

    // 2. Start Express after DB is ready
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log('Ready for authentication and API requests.');
    });
  } catch (criticalErr) {
    console.error('❌ CRITICAL ERROR during server startup:', criticalErr.message);
    process.exit(1);
  }
};

startServer();

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
  res.json({ 
    status: 'API is running', 
    dbState: mongoose.connection.readyState,
    dbName: mongoose.connection.name
  });
});

// Serve uploaded prescription images
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads/prescriptions')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/pharmacies', pharmacyRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/analytics', analyticsRoutes);
