const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/postgres'
});

const initDatabase = async () => {
    try {
        console.log('🔄 Connexion à PostgreSQL...');
        const sqlPath = path.join(__dirname, 'database.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        console.log('📝 Exécution du schéma...');
        const queries = sql.split(';').filter(q => q.trim());
        
        for (const query of queries) {
            try {
                await pool.query(query);
                console.log('✅ Requête exécutée');
            } catch (error) {
                console.warn('⚠️ Requête déjà existante ou erreur mineure');
            }
        }
        
        console.log('✨ Base de données initialisée!');
        await pool.end();
    } catch (error) {
        console.error('❌ Erreur:', error);
        process.exit(1);
    }
};

initDatabase();
