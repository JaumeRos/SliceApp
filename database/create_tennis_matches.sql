-- Tennis Matches Schema
-- This creates tables for tracking tennis matches, stats, and streaks

-- Matches table
CREATE TABLE IF NOT EXISTS tennis_matches (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES tennis_users(id) ON DELETE CASCADE,
  opponent_name VARCHAR(255) NOT NULL,
  match_type VARCHAR(20) NOT NULL CHECK (match_type IN ('singles', 'doubles')),
  result VARCHAR(10) NOT NULL CHECK (result IN ('win', 'loss')),
  player_sets INTEGER NOT NULL DEFAULT 0,
  opponent_sets INTEGER NOT NULL DEFAULT 0,
  sets JSONB NOT NULL, -- Array of {player: "6", opponent: "4"}
  location VARCHAR(255),
  notes TEXT,
  played_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User stats table (aggregated stats for quick access)
CREATE TABLE IF NOT EXISTS tennis_user_stats (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE REFERENCES tennis_users(id) ON DELETE CASCADE,
  total_matches INTEGER DEFAULT 0,
  total_wins INTEGER DEFAULT 0,
  total_losses INTEGER DEFAULT 0,
  win_rate DECIMAL(5,2) DEFAULT 0.00,
  current_streak INTEGER DEFAULT 0, -- Positive for wins, negative for losses
  longest_win_streak INTEGER DEFAULT 0,
  longest_loss_streak INTEGER DEFAULT 0,
  last_match_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tennis_matches_user_id ON tennis_matches(user_id);
CREATE INDEX IF NOT EXISTS idx_tennis_matches_played_at ON tennis_matches(played_at DESC);
CREATE INDEX IF NOT EXISTS idx_tennis_matches_result ON tennis_matches(result);
CREATE INDEX IF NOT EXISTS idx_tennis_user_stats_user_id ON tennis_user_stats(user_id);

-- Function to update user stats after match insert
CREATE OR REPLACE FUNCTION update_tennis_user_stats()
RETURNS TRIGGER AS $$
DECLARE
  v_total_matches INTEGER;
  v_total_wins INTEGER;
  v_total_losses INTEGER;
  v_win_rate DECIMAL(5,2);
  v_current_streak INTEGER;
  v_longest_win_streak INTEGER;
  v_longest_loss_streak INTEGER;
  v_last_result VARCHAR(10);
BEGIN
  -- Calculate totals
  SELECT 
    COUNT(*),
    SUM(CASE WHEN result = 'win' THEN 1 ELSE 0 END),
    SUM(CASE WHEN result = 'loss' THEN 1 ELSE 0 END)
  INTO v_total_matches, v_total_wins, v_total_losses
  FROM tennis_matches
  WHERE user_id = NEW.user_id;

  -- Calculate win rate
  IF v_total_matches > 0 THEN
    v_win_rate := (v_total_wins::DECIMAL / v_total_matches::DECIMAL) * 100;
  ELSE
    v_win_rate := 0;
  END IF;

  -- Calculate current streak
  v_current_streak := 0;
  v_last_result := NULL;
  
  FOR v_last_result IN 
    SELECT result 
    FROM tennis_matches 
    WHERE user_id = NEW.user_id 
    ORDER BY played_at DESC
  LOOP
    IF v_current_streak = 0 THEN
      -- First match in streak
      IF v_last_result = 'win' THEN
        v_current_streak := 1;
      ELSE
        v_current_streak := -1;
      END IF;
    ELSIF (v_current_streak > 0 AND v_last_result = 'win') OR (v_current_streak < 0 AND v_last_result = 'loss') THEN
      -- Continue streak
      IF v_last_result = 'win' THEN
        v_current_streak := v_current_streak + 1;
      ELSE
        v_current_streak := v_current_streak - 1;
      END IF;
    ELSE
      -- Streak broken
      EXIT;
    END IF;
  END LOOP;

  -- Calculate longest streaks (simplified - just look at current)
  IF v_current_streak > 0 THEN
    v_longest_win_streak := GREATEST(v_current_streak, COALESCE((SELECT longest_win_streak FROM tennis_user_stats WHERE user_id = NEW.user_id), 0));
    v_longest_loss_streak := COALESCE((SELECT longest_loss_streak FROM tennis_user_stats WHERE user_id = NEW.user_id), 0);
  ELSE
    v_longest_win_streak := COALESCE((SELECT longest_win_streak FROM tennis_user_stats WHERE user_id = NEW.user_id), 0);
    v_longest_loss_streak := GREATEST(ABS(v_current_streak), COALESCE((SELECT longest_loss_streak FROM tennis_user_stats WHERE user_id = NEW.user_id), 0));
  END IF;

  -- Upsert stats
  INSERT INTO tennis_user_stats (
    user_id, 
    total_matches, 
    total_wins, 
    total_losses, 
    win_rate, 
    current_streak,
    longest_win_streak,
    longest_loss_streak,
    last_match_date,
    updated_at
  ) VALUES (
    NEW.user_id,
    v_total_matches,
    v_total_wins,
    v_total_losses,
    v_win_rate,
    v_current_streak,
    v_longest_win_streak,
    v_longest_loss_streak,
    NEW.played_at,
    CURRENT_TIMESTAMP
  )
  ON CONFLICT (user_id) DO UPDATE SET
    total_matches = v_total_matches,
    total_wins = v_total_wins,
    total_losses = v_total_losses,
    win_rate = v_win_rate,
    current_streak = v_current_streak,
    longest_win_streak = v_longest_win_streak,
    longest_loss_streak = v_longest_loss_streak,
    last_match_date = NEW.played_at,
    updated_at = CURRENT_TIMESTAMP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_tennis_user_stats ON tennis_matches;
CREATE TRIGGER trigger_update_tennis_user_stats
AFTER INSERT ON tennis_matches
FOR EACH ROW
EXECUTE FUNCTION update_tennis_user_stats();

