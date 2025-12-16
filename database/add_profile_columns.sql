-- Add profile columns to tennis_users table
ALTER TABLE tennis_users 
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS link VARCHAR(500),
ADD COLUMN IF NOT EXISTS sex VARCHAR(50),
ADD COLUMN IF NOT EXISTS birthday DATE;

-- Add index on commonly queried fields
CREATE INDEX IF NOT EXISTS idx_tennis_users_full_name ON tennis_users(full_name);

