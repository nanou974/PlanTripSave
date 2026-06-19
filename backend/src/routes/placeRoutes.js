const express = require('express');
const { getPlaces, createPlace } = require('../controllers/placeController');

const router = express.Router();

router.get('/', getPlaces);
router.post('/', createPlace);

module.exports = router;
