const Service = require('../models/Service');

// Create a new service
exports.createService = async (req, res) => {
  try {
    const { serviceCode, serviceName, servicePrice } = req.body;

    // Validate input
    if (!serviceCode || !serviceName || !servicePrice) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if service already exists
    const existingService = await Service.findByPk(serviceCode);
    if (existingService) {
      return res.status(400).json({ message: 'Service with this code already exists' });
    }

    // Create service
    const service = await Service.create({
      serviceCode,
      serviceName,
      servicePrice
    });

    res.status(201).json({
      message: 'Service created successfully',
      service
    });
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all services
exports.getAllServices = async (req, res) => {
  try {
    const services = await Service.findAll();
    res.status(200).json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get service by code
exports.getServiceByCode = async (req, res) => {
  try {
    const { serviceCode } = req.params;
    const service = await Service.findByPk(serviceCode);
    
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    res.status(200).json(service);
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update service
exports.updateService = async (req, res) => {
  try {
    const { serviceCode } = req.params;
    const { serviceName, servicePrice } = req.body;
    
    const service = await Service.findByPk(serviceCode);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    await service.update({ serviceName, servicePrice });
    
    res.status(200).json({
      message: 'Service updated successfully',
      service
    });
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete service
exports.deleteService = async (req, res) => {
  try {
    const { serviceCode } = req.params;
    
    const service = await Service.findByPk(serviceCode);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    await service.destroy();
    
    res.status(200).json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
