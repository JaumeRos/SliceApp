-- Add sport column to users table
-- This allows users to select their primary racquet sport

ALTER TABLE users ADD COLUMN IF NOT EXISTS sport VARCHAR(50) DEFAULT 'tennis';

-- Add comment to document the column
COMMENT ON COLUMN users.sport IS 'Primary racquet sport: tennis, padel, pickleball, squash, badminton, or table-tennis';

-- Optional: Update existing users to have 'tennis' as default if NULL
UPDATE users SET sport = 'tennis' WHERE sport IS NULL;

