const Medicine = require('../models/Medicine');

exports.getMedicines = async (req, res) => {
  try {
    const filter = {};
    
    // 1. If pharmacy is explicitly requested via query (Customer flow)
    if (req.query.pharmacy) {
      filter.pharmacy = req.query.pharmacy;
    } 
    // 2. Otherwise, if staff is logged in, restrict to their assigned pharmacy
    else if (req.user && req.user.role !== 'Super Admin' && req.user.assignedPharmacy) {
      filter.pharmacy = req.user.assignedPharmacy;
    }
    
    const medicines = await Medicine.find(filter);
    res.json(medicines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add a new medicine
exports.createMedicine = async (req, res) => {
  try {
    const medicine = new Medicine(req.body);
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

// Update medicine
exports.updateMedicine = async (req, res) => {
  try {
    const updated = await Medicine.findByIdAndUpdate(req.params.id, req.body, { new: true });
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
