const pool = require('../config/database');

const createTrip = async (req, res) => {
    try {
        const { title, description, start_location, end_location, travel_mode, budget, start_date, end_date } = req.body;
        const userId = req.userId;

        const result = await pool.query(
            'INSERT INTO trips (user_id, title, description, start_location, end_location, travel_mode, budget, start_date, end_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
            [userId, title, description, start_location, end_location, travel_mode, budget, start_date, end_date]
        );

        res.status(201).json({ message: 'Trip créé', trip: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

const getTrips = async (req, res) => {
    try {
        const { travel_mode, page = 1, limit = 10 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        let query = 'SELECT * FROM trips';
        const params = [];

        if (travel_mode) {
            query += ' WHERE travel_mode = $1';
            params.push(travel_mode);
        }

        query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

const getTripById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM trips WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Trip non trouvé' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

const updateTrip = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, budget } = req.body;
        const userId = req.userId;

        const tripCheck = await pool.query('SELECT * FROM trips WHERE id = $1 AND user_id = $2', [id, userId]);
        if (tripCheck.rows.length === 0) {
            return res.status(403).json({ error: 'Non autorisé' });
        }

        const result = await pool.query(
            'UPDATE trips SET title = $1, description = $2, budget = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
            [title, description, budget, id]
        );

        res.json({ message: 'Trip mis à jour', trip: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

const deleteTrip = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        const tripCheck = await pool.query('SELECT * FROM trips WHERE id = $1 AND user_id = $2', [id, userId]);
        if (tripCheck.rows.length === 0) {
            return res.status(403).json({ error: 'Non autorisé' });
        }

        await pool.query('DELETE FROM trips WHERE id = $1', [id]);
        res.json({ message: 'Trip supprimé' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

module.exports = { createTrip, getTrips, getTripById, updateTrip, deleteTrip };
