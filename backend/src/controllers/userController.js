const pool = require('../config/database');

const getProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const result = await pool.query('SELECT id, username, email, bio, travel_mode, profile_picture_url, created_at FROM users WHERE id = $1', [userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { username, bio, travel_mode, profile_picture_url } = req.body;
        const userId = req.userId;

        const result = await pool.query(
            'UPDATE users SET username = $1, bio = $2, travel_mode = $3, profile_picture_url = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
            [username, bio, travel_mode, profile_picture_url, userId]
        );

        res.json({ message: 'Profil mis à jour', user: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

const getUserTrips = async (req, res) => {
    try {
        const userId = req.userId;
        const result = await pool.query('SELECT * FROM trips WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

module.exports = { getProfile, updateProfile, getUserTrips };
