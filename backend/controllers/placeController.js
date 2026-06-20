const Place = require('../models/Place');
const Trip = require('../models/Trip');

exports.addPlace = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { name, latitude, longitude, description, visitDate, estimatedCost } = req.body;
    if (!name || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ error: 'Champs obligatoires manquants' });
    }
    const trip = await Trip.findByPk(tripId);
    if (!trip) {
      return res.status(404).json({ error: 'Trip non trouvé' });
    }
    const place = await Place.create({
      tripId, name, latitude, longitude, description, visitDate,
      estimatedCost: estimatedCost || 0, order: 0
    });
    res.status(201).json(place);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTripPlaces = async (req, res) => {
  try {
    const { tripId } = req.params;
    const places = await Place.findAll({
      where: { tripId },
      order: [['order', 'ASC']]
    });
    res.json(places);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updatePlace = async (req, res) => {
  try {
    const { placeId } = req.params;
    const { name, latitude, longitude, description, visitDate, estimatedCost, order } = req.body;
    const place = await Place.findByPk(placeId);
    if (!place) {
      return res.status(404).json({ error: 'Lieu non trouvé' });
    }
    await place.update({
      name: name || place.name,
      latitude: latitude !== undefined ? latitude : place.latitude,
      longitude: longitude !== undefined ? longitude : place.longitude,
      description: description || place.description,
      visitDate: visitDate || place.visitDate,
      estimatedCost: estimatedCost !== undefined ? estimatedCost : place.estimatedCost,
      order: order !== undefined ? order : place.order
    });
    res.json(place);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deletePlace = async (req, res) => {
  try {
    const { placeId } = req.params;
    const place = await Place.findByPk(placeId);
    if (!place) {
      return res.status(404).json({ error: 'Lieu non trouvé' });
    }
    await place.destroy();
    res.json({ message: 'Lieu supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.reorderPlaces = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { places } = req.body;
    for (const place of places) {
      await Place.update(
        { order: place.order },
        { where: { id: place.id, tripId } }
      );
    }
    const updatedPlaces = await Place.findAll({
      where: { tripId },
      order: [['order', 'ASC']]
    });
    res.json(updatedPlaces);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
