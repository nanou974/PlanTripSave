const express = require('express');
const { getProfile, updateProfile, getUserTrips } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.get('/trips', authMiddleware, getUserTrips);

module.exports = router;
