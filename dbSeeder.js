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

const createBranchMedicines = (pharmacyId, branchCode) => [
  {
    pharmacy: pharmacyId,
    name: 'Napa Extra 500mg',
    genericName: 'Paracetamol + Caffeine',
    description: 'Relief from fever, headache, body aches, and mild pain.',
    batchNumber: `${branchCode}-2026-001`,
    stockQuantity: branchCode === 'DHN' ? 180 : (branchCode === 'UTR' ? 35 : 8),
    purchasePrice: 1.80,
    sellPrice: 2.50,
    manufacturer: 'Beximco Pharmaceuticals Ltd.',
    requiresPrescription: false,
    expiryDate: new Date('2027-12-31')
  },
  {
    pharmacy: pharmacyId,
    name: 'Seclo 20mg Capsule',
    genericName: 'Omeprazole',
    description: 'Treatment for acid reflux, heartburn, and stomach ulcers.',
    batchNumber: `${branchCode}-2026-002`,
    stockQuantity: branchCode === 'DHN' ? 220 : (branchCode === 'UTR' ? 85 : 190),
    purchasePrice: 4.50,
    sellPrice: 6.00,
    manufacturer: 'Square Pharmaceuticals Ltd.',
    requiresPrescription: false,
    expiryDate: new Date('2027-10-15')
  },
  {
    pharmacy: pharmacyId,
    name: 'Sergel 20mg Capsule',
    genericName: 'Esomeprazole',
    description: 'Proton pump inhibitor for hyperacidity and GERD relief.',
    batchNumber: `${branchCode}-2026-003`,
    stockQuantity: branchCode === 'DHN' ? 140 : (branchCode === 'UTR' ? 12 : 65),
    purchasePrice: 5.20,
    sellPrice: 7.00,
    manufacturer: 'Incepta Pharmaceuticals Ltd.',
    requiresPrescription: false,
    expiryDate: new Date('2027-11-20')
  },
  {
    pharmacy: pharmacyId,
    name: 'Ace 500mg Tablet',
    genericName: 'Paracetamol',
    description: 'Fast acting pain reliever and fever reducer.',
    batchNumber: `${branchCode}-2026-004`,
    stockQuantity: branchCode === 'DHN' ? 310 : (branchCode === 'UTR' ? 175 : 0),
    purchasePrice: 1.50,
    sellPrice: 2.00,
    manufacturer: 'Square Pharmaceuticals Ltd.',
    requiresPrescription: false,
    expiryDate: new Date('2028-01-30')
  },
  {
    pharmacy: pharmacyId,
    name: 'Ciprocin 500mg Tablet',
    genericName: 'Ciprofloxacin',
    description: 'Broad spectrum antibiotic for bacterial infections.',
    batchNumber: `${branchCode}-2026-005`,
    stockQuantity: branchCode === 'DHN' ? 95 : (branchCode === 'UTR' ? 40 : 110),
    purchasePrice: 11.00,
    sellPrice: 15.00,
    manufacturer: 'Square Pharmaceuticals Ltd.',
    requiresPrescription: true,
    expiryDate: new Date('2027-08-15')
  },
  {
    pharmacy: pharmacyId,
    name: 'Azithrocin 500mg',
    genericName: 'Azithromycin',
    description: 'Antibiotic for respiratory and soft tissue bacterial infections.',
    batchNumber: `${branchCode}-2026-006`,
    stockQuantity: branchCode === 'DHN' ? 50 : (branchCode === 'UTR' ? 95 : 20),
    purchasePrice: 26.00,
    sellPrice: 35.00,
    manufacturer: 'Beximco Pharmaceuticals Ltd.',
    requiresPrescription: true,
    expiryDate: new Date('2027-09-10')
  },
  {
    pharmacy: pharmacyId,
    name: 'Monas 10mg Tablet',
    genericName: 'Montelukast',
    description: 'For asthma prevention and seasonal allergic rhinitis.',
    batchNumber: `${branchCode}-2026-007`,
    stockQuantity: branchCode === 'DHN' ? 130 : (branchCode === 'UTR' ? 60 : 150),
    purchasePrice: 12.00,
    sellPrice: 16.00,
    manufacturer: 'Acme Laboratories Ltd.',
    requiresPrescription: false,
    expiryDate: new Date('2027-07-25')
  },
  {
    pharmacy: pharmacyId,
    name: 'Compathide 50mg',
    genericName: 'Losartan Potassium',
    description: 'Anti-hypertensive medication for blood pressure control.',
    batchNumber: `${branchCode}-2026-008`,
    stockQuantity: branchCode === 'DHN' ? 75 : (branchCode === 'UTR' ? 140 : 45),
    purchasePrice: 7.50,
    sellPrice: 10.00,
    manufacturer: 'Incepta Pharmaceuticals Ltd.',
    requiresPrescription: true,
    expiryDate: new Date('2027-10-05')
  },
  {
    pharmacy: pharmacyId,
    name: 'Becosules Syrup 200ml',
    genericName: 'Vitamin B Complex + Vitamin C',
    description: 'Nutritional supplement to boost immunity and energy.',
    batchNumber: `${branchCode}-2026-009`,
    stockQuantity: branchCode === 'DHN' ? 60 : (branchCode === 'UTR' ? 25 : 80),
    purchasePrice: 90.00,
    sellPrice: 120.00,
    manufacturer: 'Renata Limited',
    requiresPrescription: false,
    expiryDate: new Date('2027-06-30')
  },
  {
    pharmacy: pharmacyId,
    name: 'Fast 500mg Tablet',
    genericName: 'Paracetamol',
    description: 'Rapid onset analgesic and antipyretic.',
    batchNumber: `${branchCode}-2026-010`,
    stockQuantity: branchCode === 'DHN' ? 240 : (branchCode === 'UTR' ? 110 : 300),
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
        name: 'SPMIS - Dhanmondi Branch',
        location: 'Dhanmondi',
        address: 'House 12, Road 5, Dhanmondi, Dhaka 1205',
        contactPhone: '+880 1711-111111'
      });
      const uttara = await Pharmacy.create({
        name: 'SPMIS - Uttara Branch',
        location: 'Uttara',
        address: 'Sector 4, Road 18, Uttara, Dhaka 1230',
        contactPhone: '+880 1711-222222'
      });
      pharmacies = [dhanmondi, uttara];
      console.log('✅ Localized (BD) Pharmacies created.');
    }

    // 3. Seed or Update Medicines for Each Pharmacy with Branch-Unique Data
    for (const pharmacy of pharmacies) {
      const pName = pharmacy.name || '';
      const branchCode = pName.includes('Uttara') ? 'UTR' : (pName.includes('Ananda') ? 'AND' : 'DHN');
      
      const count = await Medicine.countDocuments({ pharmacy: pharmacy._id });
      if (count === 0) {
        const branchMeds = createBranchMedicines(pharmacy._id, branchCode);
        await Medicine.insertMany(branchMeds);
        console.log(`✅ Branch-unique inventory created for ${pharmacy.name}`);
      } else {
        // Ensure existing medicine batch numbers use branchCode so inventory is visibly distinct
        const existing = await Medicine.find({ pharmacy: pharmacy._id });
        for (const med of existing) {
          if (!med.batchNumber || !med.batchNumber.startsWith(branchCode)) {
            const num = (med.batchNumber || '').slice(-3) || '001';
            med.batchNumber = `${branchCode}-2026-${num}`;
            if (branchCode === 'UTR') med.stockQuantity = Math.max(5, Math.round(med.stockQuantity * 0.4));
            if (branchCode === 'AND') med.stockQuantity = Math.max(0, Math.round(med.stockQuantity * 0.7));
            await med.save();
          }
        }
      }
    }

    console.log('✨ Seeding complete.');
  } catch (err) {
    console.error('❌ Automatic seeding failed:', err.message);
  }
};

module.exports = { seedDatabase };
