-- Create subscribers table
CREATE TABLE IF NOT EXISTS subscribers (
    email TEXT PRIMARY KEY,
    token TEXT UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
