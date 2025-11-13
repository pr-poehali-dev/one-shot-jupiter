CREATE TABLE IF NOT EXISTS t_p2318644_one_shot_jupiter.messages (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL DEFAULT 'Аноним',
    message TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_messages_created_at ON t_p2318644_one_shot_jupiter.messages(created_at DESC);