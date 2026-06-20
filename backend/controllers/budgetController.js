const Budget = require('../models/Budget');
const Trip = require('../models/Trip');

exports.addExpense = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { category, amount, description, date } = req.body;
    if (!category || amount === undefined) {
      return res.status(400).json({ error: 'Champs obligatoires manquants' });
    }
    const trip = await Trip.findByPk(tripId);
    if (!trip) {
      return res.status(404).json({ error: 'Trip non trouvé' });
    }
    const budget = await Budget.create({
      tripId, category, amount, description,
      date: date || new Date()
    });
    res.status(201).json(budget);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTripExpenses = async (req, res) => {
  try {
    const { tripId } = req.params;
    const expenses = await Budget.findAll({
      where: { tripId },
      order: [['date', 'DESC']]
    });
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    res.json({
      expenses,
      totalExpenses,
      remainingBudget: (await Trip.findByPk(tripId)).budget - totalExpenses
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;
    const { category, amount, description, date } = req.body;
    const expense = await Budget.findByPk(expenseId);
    if (!expense) {
      return res.status(404).json({ error: 'Dépense non trouvée' });
    }
    await expense.update({
      category: category || expense.category,
      amount: amount !== undefined ? amount : expense.amount,
      description: description || expense.description,
      date: date || expense.date
    });
    res.json(expense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;
    const expense = await Budget.findByPk(expenseId);
    if (!expense) {
      return res.status(404).json({ error: 'Dépense non trouvée' });
    }
    await expense.destroy();
    res.json({ message: 'Dépense supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getBudgetSummary = async (req, res) => {
  try {
    const { tripId } = req.params;
    const trip = await Trip.findByPk(tripId);
    if (!trip) {
      return res.status(404).json({ error: 'Trip non trouvé' });
    }
    const expenses = await Budget.findAll({ where: { tripId } });
    const summary = {
      totalBudget: trip.budget,
      totalSpent: expenses.reduce((sum, exp) => sum + exp.amount, 0),
      remaining: trip.budget - expenses.reduce((sum, exp) => sum + exp.amount, 0),
      byCategory: {}
    };
    expenses.forEach(exp => {
      if (!summary.byCategory[exp.category]) {
        summary.byCategory[exp.category] = 0;
      }
      summary.byCategory[exp.category] += exp.amount;
    });
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
