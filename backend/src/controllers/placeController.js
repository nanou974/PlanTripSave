const pool = require('../config/database');

exports.getAllPlaces = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM places WHERE is_validated = true');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getPlaceById = async (req, res) => {
    try {
        const { id } = req.params;
        const placeResult = await pool.query('SELECT * FROM places WHERE id = $1', [id]);
        
        if (placeResult.rows.length === 0) {
            return res.status(404).json({ error: 'Place non trouvée' });
        }
        
        const reviewsResult = await pool.query(
            'SELECT * FROM reviews WHERE place_id = $1 AND is_approved = true',
            [id]
        );
        
        res.json({ place: placeResult.rows[0], reviews: reviewsResult.rows });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.addPlaceToTrip = async (req, res) => {
    try {
        const { trip_id, place_id, order_in_trip, estimated_cost } = req.body;
        
        const result = await pool.query(
            'INSERT INTO trip_places (trip_id, place_id, order_in_trip, estimated_cost) VALUES ($1, $2, $3, $4) RETURNING *',
            [trip_id, place_id, order_in_trip, estimated_cost]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
