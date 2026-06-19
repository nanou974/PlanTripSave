const express = require('express');
const tripController = require('../controllers/tripController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', tripController.getAllTrips);
router.get('/:id', tripController.getTripById);
router.post('/', authMiddleware, tripController.createTrip);
router.put('/:id', authMiddleware, tripController.updateTrip);
router.delete('/:id', authMiddleware, tripController.deleteTrip);

module.exports = router;
