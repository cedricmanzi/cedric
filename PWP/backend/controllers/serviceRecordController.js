const ServiceRecord = require('../models/ServiceRecord');
const Car = require('../models/Car');
const Service = require('../models/Service');
const User = require('../models/User');

// Create a new service record
exports.createServiceRecord = async (req, res) => {
  try {
    const { plateNumber, serviceCode, amountPaid, paymentDate, receivedBy, userId } = req.body;

    // Validate input
    if (!plateNumber || !serviceCode || !amountPaid || !receivedBy || !userId) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if car exists
    const car = await Car.findByPk(plateNumber);
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    // Check if service exists
    const service = await Service.findByPk(serviceCode);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create service record
    const serviceRecord = await ServiceRecord.create({
      plateNumber,
      serviceCode,
      amountPaid,
      paymentDate: paymentDate || new Date(),
      receivedBy,
      userId
    });

    // Fetch the created record with associations
    const createdRecord = await ServiceRecord.findByPk(serviceRecord.recordNumber, {
      include: [
        { model: Car },
        { model: Service },
        { model: User, attributes: ['id', 'username', 'fullName'] }
      ]
    });

    res.status(201).json({
      message: 'Service record created successfully',
      serviceRecord: createdRecord
    });
  } catch (error) {
    console.error('Error creating service record:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all service records
exports.getAllServiceRecords = async (req, res) => {
  try {
    const serviceRecords = await ServiceRecord.findAll({
      include: [
        { model: Car },
        { model: Service },
        { model: User, attributes: ['id', 'username', 'fullName'] }
      ]
    });
    res.status(200).json(serviceRecords);
  } catch (error) {
    console.error('Error fetching service records:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get service record by ID
exports.getServiceRecordById = async (req, res) => {
  try {
    const { id } = req.params;
    const serviceRecord = await ServiceRecord.findByPk(id, {
      include: [
        { model: Car },
        { model: Service },
        { model: User, attributes: ['id', 'username', 'fullName'] }
      ]
    });
    
    if (!serviceRecord) {
      return res.status(404).json({ message: 'Service record not found' });
    }
    
    res.status(200).json(serviceRecord);
  } catch (error) {
    console.error('Error fetching service record:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update service record
exports.updateServiceRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { plateNumber, serviceCode, amountPaid, paymentDate, receivedBy, userId } = req.body;
    
    const serviceRecord = await ServiceRecord.findByPk(id);
    if (!serviceRecord) {
      return res.status(404).json({ message: 'Service record not found' });
    }
    
    // Check if car exists if provided
    if (plateNumber) {
      const car = await Car.findByPk(plateNumber);
      if (!car) {
        return res.status(404).json({ message: 'Car not found' });
      }
    }

    // Check if service exists if provided
    if (serviceCode) {
      const service = await Service.findByPk(serviceCode);
      if (!service) {
        return res.status(404).json({ message: 'Service not found' });
      }
    }

    // Check if user exists if provided
    if (userId) {
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
    }
    
    await serviceRecord.update({ 
      plateNumber, 
      serviceCode, 
      amountPaid, 
      paymentDate, 
      receivedBy,
      userId
    });
    
    // Fetch the updated record with associations
    const updatedRecord = await ServiceRecord.findByPk(id, {
      include: [
        { model: Car },
        { model: Service },
        { model: User, attributes: ['id', 'username', 'fullName'] }
      ]
    });
    
    res.status(200).json({
      message: 'Service record updated successfully',
      serviceRecord: updatedRecord
    });
  } catch (error) {
    console.error('Error updating service record:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete service record
exports.deleteServiceRecord = async (req, res) => {
  try {
    const { id } = req.params;
    
    const serviceRecord = await ServiceRecord.findByPk(id);
    if (!serviceRecord) {
      return res.status(404).json({ message: 'Service record not found' });
    }
    
    await serviceRecord.destroy();
    
    res.status(200).json({ message: 'Service record deleted successfully' });
  } catch (error) {
    console.error('Error deleting service record:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Generate bill for a service record
exports.generateBill = async (req, res) => {
  try {
    const { id } = req.params;
    
    const serviceRecord = await ServiceRecord.findByPk(id, {
      include: [
        { model: Car },
        { model: Service },
        { model: User, attributes: ['id', 'username', 'fullName'] }
      ]
    });
    
    if (!serviceRecord) {
      return res.status(404).json({ message: 'Service record not found' });
    }
    
    // Create bill object
    const bill = {
      billNumber: `BILL-${serviceRecord.recordNumber}`,
      date: serviceRecord.paymentDate,
      car: {
        plateNumber: serviceRecord.Car.plateNumber,
        type: serviceRecord.Car.type,
        model: serviceRecord.Car.model
      },
      service: {
        name: serviceRecord.Service.serviceName,
        price: serviceRecord.Service.servicePrice
      },
      amountPaid: serviceRecord.amountPaid,
      receivedBy: serviceRecord.receivedBy,
      mechanicName: serviceRecord.Car.mechanicName
    };
    
    res.status(200).json(bill);
  } catch (error) {
    console.error('Error generating bill:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
