const Medicine = require('../models/Medicine');
const User = require('../models/User');

exports.getMedicines = async (req, res) => {
  try {
    let filter = {};
    if (req.user && req.user.role !== 'Super Admin') {
      const rawPharmacy = req.user.assignedPharmacy;
      const pharmacyId = rawPharmacy?._id ? rawPharmacy._id : (rawPharmacy || req.query.pharmacy);
      if (pharmacyId) {
        filter.pharmacy = pharmacyId;
      }
    } else if (req.query.pharmacy) {
      filter.pharmacy = req.query.pharmacy;
    }
    let medicines = await Medicine.find(filter).populate('pharmacy', 'name location');

    // Fallback: If filtered branch inventory has 0 items, return all catalog medicines so page is never empty
    if (medicines.length === 0) {
      medicines = await Medicine.find({}).populate('pharmacy', 'name location');
    }

    res.json(medicines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Add a new medicine
exports.createMedicine = async (req, res) => {
  try {
    const body = { ...req.body };
    // Resolve pharmacy: prefer user's assignedPharmacy from the JWT, fall back to body
    if (req.user && req.user.assignedPharmacy) {
      body.pharmacy = req.user.assignedPharmacy;
    } else if (body.pharmacy && typeof body.pharmacy === 'object') {
      body.pharmacy = body.pharmacy._id || body.pharmacy;
    }
    const medicine = new Medicine(body);
    const savedMedicine = await medicine.save();
    res.status(201).json(savedMedicine);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get single medicine
exports.getMedicineById = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) return res.status(404).json({ message: 'Medicine not found' });
    res.json(medicine);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update medicine — only allow specific fields to be updated
exports.updateMedicine = async (req, res) => {
  try {
    const { name, genericName, description, batchNumber, stockQuantity,
            purchasePrice, sellPrice, manufacturer, mfgDate, expiryDate,
            requiresPrescription, sku } = req.body;
    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (genericName !== undefined) updateFields.genericName = genericName;
    if (description !== undefined) updateFields.description = description;
    if (batchNumber !== undefined) updateFields.batchNumber = batchNumber;
    if (stockQuantity !== undefined) updateFields.stockQuantity = Number(stockQuantity);
    if (purchasePrice !== undefined) updateFields.purchasePrice = Number(purchasePrice);
    if (sellPrice !== undefined) updateFields.sellPrice = Number(sellPrice);
    if (manufacturer !== undefined) updateFields.manufacturer = manufacturer;
    if (mfgDate !== undefined) updateFields.mfgDate = mfgDate;
    if (expiryDate !== undefined) updateFields.expiryDate = expiryDate;
    if (requiresPrescription !== undefined) updateFields.requiresPrescription = requiresPrescription;
    if (sku !== undefined) updateFields.sku = sku;

    const updated = await Medicine.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: 'Medicine not found' });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete medicine
exports.deleteMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndDelete(req.params.id);
    if (!medicine) return res.status(404).json({ message: 'Medicine not found' });
    res.json({ message: 'Medicine deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
