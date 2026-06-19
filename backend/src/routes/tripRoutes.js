const express = require('express');
const { createTrip, getTrips, getTripById, updateTrip, deleteTrip } = require('../controllers/tripController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, createTrip);
router.get('/', getTrips);
router.get('/:id', getTripById);
router.put('/:id', authMiddleware, updateTrip);
router.delete('/:id', authMiddleware, deleteTrip);

module.exports = router;
