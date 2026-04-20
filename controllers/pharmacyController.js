const Pharmacy = require('../models/Pharmacy');

// @desc    Get all pharmacies
exports.getPharmacies = async (req, res) => {
  try {
    const pharmacies = await Pharmacy.find().populate('owner', 'name email');
    res.json(pharmacies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single pharmacy by ID
exports.getPharmacyById = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findById(req.params.id);
    if (!pharmacy) return res.status(404).json({ message: 'Pharmacy not found' });
    res.json(pharmacy);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a pharmacy (System Owner only)
exports.createPharmacy = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.create(req.body);
    res.status(201).json(pharmacy);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update pharmacy settings
exports.updatePharmacy = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(pharmacy);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete pharmacy
exports.deletePharmacy = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findByIdAndDelete(req.params.id);
    if (!pharmacy) return res.status(404).json({ message: 'Pharmacy not found' });
    res.json({ message: 'Pharmacy deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
