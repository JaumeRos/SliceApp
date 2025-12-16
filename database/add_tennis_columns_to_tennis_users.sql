-- Add tennis-specific columns to tennis_users table
-- This makes tennis_users independent from the CardApp users table

ALTER TABLE tennis_users ADD COLUMN IF NOT EXISTS sport VARCHAR(50) DEFAULT 'tennis';
ALTER TABLE tennis_users ADD COLUMN IF NOT EXISTS tennis_level VARCHAR(50);
ALTER TABLE tennis_users ADD COLUMN IF NOT EXISTS court_preference TEXT;
ALTER TABLE tennis_users ADD COLUMN IF NOT EXISTS playing_frequency VARCHAR(50);
ALTER TABLE tennis_users ADD COLUMN IF NOT EXISTS preferred_times JSONB;
ALTER TABLE tennis_users ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Add comments
COMMENT ON COLUMN tennis_users.sport IS 'Primary racquet sport: tennis, padel, pickleball, squash, badminton, or table-tennis';
COMMENT ON COLUMN tennis_users.onboarding_completed IS 'Whether the user has completed the onboarding flow';

-- Create index for faster onboarding queries
CREATE INDEX IF NOT EXISTS idx_tennis_users_onboarding ON tennis_users(onboarding_completed);

