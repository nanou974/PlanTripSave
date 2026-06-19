const pool = require('../config/database');

const getPlaces = async (req, res) => {
    try {
        const { lat, lon, radius = 50, type, page = 1, limit = 20 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        let query = 'SELECT * FROM places WHERE is_validated = true';
        const params = [];

        if (type) {
            query += ' AND type = $' + (params.length + 1);
            params.push(type);
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

const createPlace = async (req, res) => {
    try {
        const { name, description, type, latitude, longitude } = req.body;

        const result = await pool.query(
            'INSERT INTO places (name, description, type, latitude, longitude, is_validated) VALUES ($1, $2, $3, $4, $5, false) RETURNING *',
            [name, description, type, latitude, longitude]
        );

        res.status(201).json({ message: 'Lieu créé en attente de validation', place: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

module.exports = { getPlaces, createPlace };
