const express = require('express');
const placeController = require('../controllers/placeController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', placeController.getAllPlaces);
router.get('/:id', placeController.getPlaceById);
router.post('/add-to-trip', authMiddleware, placeController.addPlaceToTrip);

module.exports = router;
