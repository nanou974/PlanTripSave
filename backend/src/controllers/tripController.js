const pool = require('../config/database');

exports.getAllTrips = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM trips WHERE is_published = true ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getTripById = async (req, res) => {
    try {
        const { id } = req.params;
        const tripResult = await pool.query('SELECT * FROM trips WHERE id = $1', [id]);
        
        if (tripResult.rows.length === 0) {
            return res.status(404).json({ error: 'Trip non trouvé' });
        }
        
        const placesResult = await pool.query(
            'SELECT p.*, tp.order_in_trip, tp.estimated_cost FROM trip_places tp JOIN places p ON tp.place_id = p.id WHERE tp.trip_id = $1 ORDER BY tp.order_in_trip',
            [id]
        );
        
        res.json({ trip: tripResult.rows[0], places: placesResult.rows });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createTrip = async (req, res) => {
    try {
        const { title, description, start_location, end_location, travel_mode, budget } = req.body;
        const userId = req.user.id;
        
        const result = await pool.query(
            'INSERT INTO trips (user_id, title, description, start_location, end_location, travel_mode, budget) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [userId, title, description, start_location, end_location, travel_mode, budget]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.updateTrip = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, budget, start_date, end_date, is_published } = req.body;
        
        const result = await pool.query(
            'UPDATE trips SET title = $1, description = $2, budget = $3, start_date = $4, end_date = $5, is_published = $6, updated_at = NOW() WHERE id = $7 RETURNING *',
            [title, description, budget, start_date, end_date, is_published, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Trip non trouvé' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.deleteTrip = async (req, res) => {
    try {
        const { id } = req.params;
        
        await pool.query('DELETE FROM trips WHERE id = $1', [id]);
        res.json({ message: 'Trip supprimé' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
