-- Création de la base de données
CREATE DATABASE plantripsave;

-- Table Users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    bio TEXT,
    travel_mode VARCHAR(50),
    profile_picture_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table Trips
CREATE TABLE trips (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    start_location VARCHAR(150) NOT NULL,
    end_location VARCHAR(150) NOT NULL,
    travel_mode VARCHAR(50) NOT NULL,
    budget DECIMAL(10, 2),
    start_date DATE,
    end_date DATE,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table Places
CREATE TABLE places (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    type VARCHAR(50),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    address VARCHAR(255),
    is_validated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table Trip_Places
CREATE TABLE trip_places (
    id SERIAL PRIMARY KEY,
    trip_id INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    place_id INTEGER NOT NULL REFERENCES places(id) ON DELETE CASCADE,
    order_in_trip INTEGER,
    estimated_cost DECIMAL(10, 2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table Reviews
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    place_id INTEGER NOT NULL REFERENCES places(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table Favorites
CREATE TABLE favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    place_id INTEGER NOT NULL REFERENCES places(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, place_id)
);

-- Table Budget_Expenses
CREATE TABLE budget_expenses (
    id SERIAL PRIMARY KEY,
    trip_id INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    amount DECIMAL(10, 2) NOT NULL,
    date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour performances
CREATE INDEX idx_trips_user_id ON trips(user_id);
CREATE INDEX idx_trip_places_trip_id ON trip_places(trip_id);
CREATE INDEX idx_reviews_place_id ON reviews(place_id);
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_expenses_trip_id ON budget_expenses(trip_id);

-- Données de test
INSERT INTO users (username, email, password, bio, travel_mode) VALUES
('nanou974', 'nanou@example.com', '\$2a\$10\$abcdef123456', 'Voyageur passionné', 'Camping-car'),
('jean_voyageur', 'jean@example.com', '\$2a\$10\$abcdef123456', 'Backpacker', 'Backpacker'),
('marie_vsp', 'marie@example.com', '\$2a\$10\$abcdef123456', 'VSP fan', 'Voiture sans permis');

INSERT INTO places (name, description, type, latitude, longitude, address, is_validated) VALUES
('Parc National de la Réunion', 'Magnifique parc avec sentiers', 'Nature', -21.2450, 55.4920, 'Saint-Denis, Réunion', TRUE),
('Plage de Saint-Gilles', 'Plage populaire avec lagon', 'Plage', -21.0550, 55.2350, 'Saint-Gilles, Réunion', TRUE),
('Camping du Lagon', 'Camping confortable', 'Camping', -21.0600, 55.2400, 'Saint-Gilles, Réunion', TRUE),
('Gîte de la Montagne', 'Gîte avec vue volcans', 'Gite', -21.1200, 55.5100, 'Piton de la Fournaise, Réunion', TRUE);

INSERT INTO trips (user_id, title, description, start_location, end_location, travel_mode, budget, start_date, end_date, is_published) VALUES
(1, 'Tour de la Réunion en camping-car', 'Tour complet de l''île', 'Saint-Denis', 'Saint-Denis', 'Camping-car', 2500.00, '2024-07-01', '2024-07-15', TRUE),
(2, 'Backpacking Réunion', 'Découvrir avec petit budget', 'Piton de la Fournaise', 'Lagon', 'Backpacker', 800.00, '2024-06-01', '2024-06-10', TRUE);
