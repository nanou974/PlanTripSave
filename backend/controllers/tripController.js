const Trip = require('../models/Trip');
const Place = require('../models/Place');
const Budget = require('../models/Budget');
const { calculateOptimalRoute } = require('../utils/routeOptimizer');

exports.createTrip = async (req, res) => {
  try {
    const { name, startDate, endDate, budget, userId } = req.body;
    if (!name || !startDate || !endDate || !userId) {
      return res.status(400).json({ error: 'Champs obligatoires manquants' });
    }
    const trip = await Trip.create({
      name, startDate, endDate, budget, userId, status: 'planning'
    });
    res.status(201).json(trip);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserTrips = async (req, res) => {
  try {
    const { userId } = req.params;
    const trips = await Trip.findAll({
      where: { userId },
      include: [
        { model: Place, as: 'places' },
        { model: Budget, as: 'budgets' }
      ],
      order: [['startDate', 'DESC']]
    });
    res.json(trips);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTripById = async (req, res) => {
  try {
    const { tripId } = req.params;
    const trip = await Trip.findByPk(tripId, {
      include: [
        { model: Place, as: 'places' },
        { model: Budget, as: 'budgets' }
      ]
    });
    if (!trip) {
      return res.status(404).json({ error: 'Trip non trouvé' });
    }
    res.json(trip);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { name, startDate, endDate, budget, status } = req.body;
    const trip = await Trip.findByPk(tripId);
    if (!trip) {
      return res.status(404).json({ error: 'Trip non trouvé' });
    }
    await trip.update({
      name: name || trip.name,
      startDate: startDate || trip.startDate,
      endDate: endDate || trip.endDate,
      budget: budget || trip.budget,
      status: status || trip.status
    });
    res.json(trip);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const trip = await Trip.findByPk(tripId);
    if (!trip) {
      return res.status(404).json({ error: 'Trip non trouvé' });
    }
    await trip.destroy();
    res.json({ message: 'Trip supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
