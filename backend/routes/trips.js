const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');
const placeController = require('../controllers/placeController');
const budgetController = require('../controllers/budgetController');
const auth = require('../middleware/auth');

router.post('/', auth, tripController.createTrip);
router.get('/user/:userId', auth, tripController.getUserTrips);
router.get('/:tripId', auth, tripController.getTripById);
router.put('/:tripId', auth, tripController.updateTrip);
router.delete('/:tripId', auth, tripController.deleteTrip);

router.post('/:tripId/places', auth, placeController.addPlace);
router.get('/:tripId/places', auth, placeController.getTripPlaces);
router.put('/places/:placeId', auth, placeController.updatePlace);
router.delete('/places/:placeId', auth, placeController.deletePlace);
router.put('/:tripId/places/reorder', auth, placeController.reorderPlaces);

router.post('/:tripId/expenses', auth, budgetController.addExpense);
router.get('/:tripId/expenses', auth, budgetController.getTripExpenses);
router.put('/expenses/:expenseId', auth, budgetController.updateExpense);
router.delete('/expenses/:expenseId', auth, budgetController.deleteExpense);
router.get('/:tripId/budget-summary', auth, budgetController.getBudgetSummary);

module.exports = router;
