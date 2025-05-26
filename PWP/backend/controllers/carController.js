const Car = require('../models/Car');

// Create a new car
exports.createCar = async (req, res) => {
  try {
    const { plateNumber, type, model, manufacturingYear, driverPhone, mechanicName } = req.body;

    // Validate input
    if (!plateNumber || !type || !model || !manufacturingYear || !driverPhone || !mechanicName) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if car already exists
    const existingCar = await Car.findByPk(plateNumber);
    if (existingCar) {
      return res.status(400).json({ message: 'Car with this plate number already exists' });
    }

    // Create car
    const car = await Car.create({
      plateNumber,
      type,
      model,
      manufacturingYear,
      driverPhone,
      mechanicName
    });

    res.status(201).json({
      message: 'Car created successfully',
      car
    });
  } catch (error) {
    console.error('Error creating car:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all cars
exports.getAllCars = async (req, res) => {
  try {
    const cars = await Car.findAll();
    res.status(200).json(cars);
  } catch (error) {
    console.error('Error fetching cars:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get car by plate number
exports.getCarByPlateNumber = async (req, res) => {
  try {
    const { plateNumber } = req.params;
    const car = await Car.findByPk(plateNumber);
    
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }
    
    res.status(200).json(car);
  } catch (error) {
    console.error('Error fetching car:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update car
exports.updateCar = async (req, res) => {
  try {
    const { plateNumber } = req.params;
    const { type, model, manufacturingYear, driverPhone, mechanicName } = req.body;
    
    const car = await Car.findByPk(plateNumber);
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }
    
    await car.update({ type, model, manufacturingYear, driverPhone, mechanicName });
    
    res.status(200).json({
      message: 'Car updated successfully',
      car
    });
  } catch (error) {
    console.error('Error updating car:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete car
exports.deleteCar = async (req, res) => {
  try {
    const { plateNumber } = req.params;
    
    const car = await Car.findByPk(plateNumber);
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }
    
    await car.destroy();
    
    res.status(200).json({ message: 'Car deleted successfully' });
  } catch (error) {
    console.error('Error deleting car:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
