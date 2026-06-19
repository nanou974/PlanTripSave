const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const pool = require('../config/database');

const router = express.Router();

router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const result = await pool.query('SELECT id, username, email, bio, travel_mode FROM users WHERE id = $1', [req.user.id]);
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/profile', authMiddleware, async (req, res) => {
    try {
        const { bio, travel_mode } = req.body;
        const result = await pool.query(
            'UPDATE users SET bio = $1, travel_mode = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
            [bio, travel_mode, req.user.id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
