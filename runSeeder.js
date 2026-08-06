const mongoose = require('mongoose');
require('dotenv').config();
const { seedDatabase } = require('./dbSeeder.js');

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/pharmcare');
    console.log('Connected to MongoDB for seeding');
    await seedDatabase();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
