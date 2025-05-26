const Doctor = require('../models/Doctor');

// Create doctor
exports.createDoctor = async (req, res) => {
  try {
    const { name, specialization, phone, email } = req.body;

    const existing = await Doctor.findOne({ where: { email } });
    if (existing) return res.status(400).json({ message: 'Doctor already exists with this email' });

    const doctor = await Doctor.create({ name, specialization, phone, email });
    res.status(201).json({ message: 'Doctor created', doctor });
  } catch (error) {
    console.error('Create doctor error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all doctors
exports.getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.findAll();
    res.status(200).json(doctors);
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update doctor
exports.updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, specialization, phone, email } = req.body;

    const doctor = await Doctor.findByPk(id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    await doctor.update({ name, specialization, phone, email });
    res.status(200).json({ message: 'Doctor updated', doctor });
  } catch (error) {
    console.error('Update doctor error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete doctor
exports.deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await Doctor.findByPk(id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    await doctor.destroy();
    res.status(200).json({ message: 'Doctor deleted' });
  } catch (error) {
    console.error('Delete doctor error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
