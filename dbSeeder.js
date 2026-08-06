const User = require('./models/User');
const Pharmacy = require('./models/Pharmacy');
const Medicine = require('./models/Medicine');

const sampleMedicines = [
  {
    name: 'Napa Extra 500mg',
    genericName: 'Paracetamol + Caffeine',
    description: 'Relief from fever, headache, body aches, and mild pain.',
    batchNumber: 'BT-2026-001',
    stockQuantity: 150,
    purchasePrice: 1.80,
    sellPrice: 2.50,
    manufacturer: 'Beximco Pharmaceuticals Ltd.',
    requiresPrescription: false,
    expiryDate: new Date('2027-12-31')
  },
  {
    name: 'Seclo 20mg Capsule',
    genericName: 'Omeprazole',
    description: 'Treatment for acid reflux, heartburn, and stomach ulcers.',
    batchNumber: 'BT-2026-002',
    stockQuantity: 200,
    purchasePrice: 4.50,
    sellPrice: 6.00,
    manufacturer: 'Square Pharmaceuticals Ltd.',
    requiresPrescription: false,
    expiryDate: new Date('2027-10-15')
  },
  {
    name: 'Sergel 20mg Capsule',
    genericName: 'Esomeprazole',
    description: 'Proton pump inhibitor for hyperacidity and GERD relief.',
    batchNumber: 'BT-2026-003',
    stockQuantity: 180,
    purchasePrice: 5.20,
    sellPrice: 7.00,
    manufacturer: 'Incepta Pharmaceuticals Ltd.',
    requiresPrescription: false,
    expiryDate: new Date('2027-11-20')
  },
  {
    name: 'Ace 500mg Tablet',
    genericName: 'Paracetamol',
    description: 'Fast acting pain reliever and fever reducer.',
    batchNumber: 'BT-2026-004',
    stockQuantity: 250,
    purchasePrice: 1.50,
    sellPrice: 2.00,
    manufacturer: 'Square Pharmaceuticals Ltd.',
    requiresPrescription: false,
    expiryDate: new Date('2028-01-30')
  },
  {
    name: 'Ciprocin 500mg Tablet',
    genericName: 'Ciprofloxacin',
    description: 'Broad spectrum antibiotic for bacterial infections.',
    batchNumber: 'BT-2026-005',
    stockQuantity: 80,
    purchasePrice: 11.00,
    sellPrice: 15.00,
    manufacturer: 'Square Pharmaceuticals Ltd.',
    requiresPrescription: true,
    expiryDate: new Date('2027-08-15')
  },
  {
    name: 'Azithrocin 500mg',
    genericName: 'Azithromycin',
    description: 'Antibiotic for respiratory and soft tissue bacterial infections.',
    batchNumber: 'BT-2026-006',
    stockQuantity: 60,
    purchasePrice: 26.00,
    sellPrice: 35.00,
    manufacturer: 'Beximco Pharmaceuticals Ltd.',
    requiresPrescription: true,
    expiryDate: new Date('2027-09-10')
  },
  {
    name: 'Monas 10mg Tablet',
    genericName: 'Montelukast',
    description: 'For asthma prevention and seasonal allergic rhinitis.',
    batchNumber: 'BT-2026-007',
    stockQuantity: 120,
    purchasePrice: 12.00,
    sellPrice: 16.00,
    manufacturer: 'Acme Laboratories Ltd.',
    requiresPrescription: false,
    expiryDate: new Date('2027-07-25')
  },
  {
    name: 'Compathide 50mg',
    genericName: 'Losartan Potassium',
    description: 'Anti-hypertensive medication for blood pressure control.',
    batchNumber: 'BT-2026-008',
    stockQuantity: 90,
    purchasePrice: 7.50,
    sellPrice: 10.00,
    manufacturer: 'Incepta Pharmaceuticals Ltd.',
    requiresPrescription: true,
    expiryDate: new Date('2027-10-05')
  },
  {
    name: 'Becosules Syrup 200ml',
    genericName: 'Vitamin B Complex + Vitamin C',
    description: 'Nutritional supplement to boost immunity and energy.',
    batchNumber: 'BT-2026-009',
    stockQuantity: 40,
    purchasePrice: 90.00,
    sellPrice: 120.00,
    manufacturer: 'Renata Limited',
    requiresPrescription: false,
    expiryDate: new Date('2027-06-30')
  },
  {
    name: 'Fast 500mg Tablet',
    genericName: 'Paracetamol',
    description: 'Rapid onset analgesic and antipyretic.',
    batchNumber: 'BT-2026-010',
    stockQuantity: 200,
    purchasePrice: 1.80,
    sellPrice: 2.50,
    manufacturer: 'Renata Limited',
    requiresPrescription: false,
    expiryDate: new Date('2028-02-14')
  }
];

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
    let pharmacies = await Pharmacy.find();
    if (pharmacies.length === 0) {
      const dhanmondi = await Pharmacy.create({
        name: 'PharMCare - Dhanmondi Branch',
        location: 'Dhanmondi',
        address: 'House 12, Road 5, Dhanmondi, Dhaka 1205',
        contactPhone: '+880 1711-111111'
      });
      const uttara = await Pharmacy.create({
        name: 'PharMCare - Uttara Branch',
        location: 'Uttara',
        address: 'Sector 4, Road 18, Uttara, Dhaka 1230',
        contactPhone: '+880 1711-222222'
      });
      pharmacies = [dhanmondi, uttara];
      console.log('✅ Localized (BD) Pharmacies created.');
    }

    // 3. Seed Medicines for Each Pharmacy
    const medCount = await Medicine.countDocuments();
    if (medCount === 0) {
      for (const pharmacy of pharmacies) {
        const branchMeds = sampleMedicines.map(m => ({
          ...m,
          pharmacy: pharmacy._id
        }));
        await Medicine.insertMany(branchMeds);
      }
      console.log(`✅ Sample medicines seeded for ${pharmacies.length} pharmacy branches.`);
    }
    
    // 4. Seed Historical Orders for AI/ML Validation
    const Order = require('./models/Order');
    const orderCount = await Order.countDocuments();
    if (pharmacies.length > 0) {
      console.log(`📊 Current order count: ${orderCount}. Seeding extra historical AI/ML test data (Orders)...`);
      
      const admin = await User.findOne({ email: 'admin@spmis.com' });
      const medicines = await Medicine.find();
      
      const mockOrders = [];
      const past30Days = [...Array(30).keys()].map(i => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d;
      });

      past30Days.forEach(date => {
        // Create 2-5 random orders per day
        const ordersPerDay = Math.floor(Math.random() * 4) + 2;
        for (let i=0; i<ordersPerDay; i++) {
          const med = medicines[Math.floor(Math.random() * medicines.length)];
          const qty = Math.floor(Math.random() * 5) + 1; // 1 to 5 items
          
          mockOrders.push({
            customer: admin._id,
            pharmacy: med.pharmacy,
            medicines: [{
              medicine: med._id,
              quantity: qty,
              price: med.sellPrice
            }],
            totalAmount: med.sellPrice * qty,
            status: 'Delivered',
            paymentStatus: 'Paid',
            createdAt: date,
            updatedAt: date
          });
        }
      });

      await Order.insertMany(mockOrders);
      console.log(`✅ Inserted ${mockOrders.length} historical orders for AI/ML Smart Insights validation.`);
    }

    console.log('✨ Seeding complete.');
  } catch (err) {
    console.error('❌ Automatic seeding failed:', err.message);
  }
};

module.exports = { seedDatabase };
