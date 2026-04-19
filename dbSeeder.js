const User = require('./models/User');
const Pharmacy = require('./models/Pharmacy');

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting automatic database seeding...');
    
    // 1. Create System Owner (Super Admin)
    const adminExists = await User.findOne({ role: 'Super Admin' });
    if (!adminExists) {
      await User.create({
        name: 'System Owner',
        email: 'admin@spmis.com',
        password: 'admin123',
        role: 'Super Admin',
        isApproved: true
      });
      console.log('✅ Default Super Admin created: admin@spmis.com / admin123');
    }

    // 2. Create Default Pharmacies
    const pharmacyCount = await Pharmacy.countDocuments();
    if (pharmacyCount === 0) {
      await Pharmacy.create({
        name: 'PharMCare - Dhanmondi Branch',
        location: 'Dhanmondi',
        address: 'House 12, Road 5, Dhanmondi, Dhaka 1205',
        contactPhone: '+880 1711-111111'
      });
      await Pharmacy.create({
        name: 'PharMCare - Uttara Branch',
        location: 'Uttara',
        address: 'Sector 4, Road 18, Uttara, Dhaka 1230',
        contactPhone: '+880 1711-222222'
      });
      console.log('✅ Localized (BD) Pharmacies created.');
    }
    
    console.log('✨ Seeding complete.');
  } catch (err) {
    console.error('❌ Automatic seeding failed:', err.message);
  }
};

module.exports = { seedDatabase };
