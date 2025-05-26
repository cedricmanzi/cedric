const Patient = require('../models/Patient');

// Create a new patient
exports.createPatient = async (req, res) => {
  try {
    const patient = await Patient.create(req.body);
    res.status(201).json(patient);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create patient', error: error.message });
  }
};

// Get all patients
exports.getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.findAll();
    res.status(200).json(patients);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch patients', error: error.message });
  }
};

// Get a single patient by ID
exports.getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findByPk(req.params.id);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    res.status(200).json(patient);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch patient', error: error.message });
  }
};

// Update a patient
exports.updatePatient = async (req, res) => {
  try {
    const patient = await Patient.findByPk(req.params.id);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    await patient.update(req.body);
    res.status(200).json(patient);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update patient', error: error.message });
  }
};

// Delete a patient
exports.deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findByPk(req.params.id);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    await patient.destroy();
    res.status(200).json({ message: 'Patient deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete patient', error: error.message });
  }
};
