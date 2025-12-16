# Sport Selection Feature - Backend Setup Instructions

## Overview
The app now supports multiple racquet sports with sport-specific onboarding questions. This requires a database schema update and backend route update.

## What Changed

### Frontend Changes ✅ (Already Complete)
- Added sport selection as first onboarding step
- Created sport-specific question sets for 6 sports:
  - Tennis
  - Padel
  - Pickleball
  - Squash
  - Badminton
  - Table Tennis
- Updated API service to send `sport` field
- Updated onboarding screens to pass sport data

### Backend Changes ⚠️ (Requires Manual Setup)

## Required Backend Updates

### 1. Database Migration

**File**: `/database/add_sport_column.sql`

Connect to your database and run:

```bash
# SSH into Hetzner server
ssh -i ~/.ssh/hetzner_new_key root@135.181.44.164

# Connect to PostgreSQL
cd /root/cardapp-backend && PGPASSWORD=YAV48nef psql -U cardapp -h localhost -d cardapp

# Run the migration
\i /path/to/add_sport_column.sql

# Or manually run:
ALTER TABLE users ADD COLUMN IF NOT EXISTS sport VARCHAR(50) DEFAULT 'tennis';
UPDATE users SET sport = 'tennis' WHERE sport IS NULL;
```

**Verify the column was added:**
```sql
\d users
-- Should show 'sport' column

SELECT id, email, sport FROM users LIMIT 5;
-- Should show 'tennis' as default for existing users
```

### 2. Update Backend Route

**File**: `/backend/tennis_onboarding_fixed.js`

The updated file is already in your repo. You need to:

1. Copy it to the server:
```bash
# From your local machine
scp -i ~/.ssh/hetzner_new_key backend/tennis_onboarding_fixed.js root@135.181.44.164:/root/cardapp-backend/src/routes/tennis_onboarding.js
```

2. Restart the backend:
```bash
# SSH into server
ssh -i ~/.ssh/hetzner_new_key root@135.181.44.164

# Restart PM2
cd /root/cardapp-backend
pm2 restart cardapp-backend

# Check logs
pm2 logs cardapp-backend --lines 50
```

### 3. Verify Backend Changes

Test the updated endpoint:

```bash
# Get your auth token from the app (check console logs)
# Then test the endpoint:

curl -X POST https://api.heycard.biz/api/tennis/onboarding \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sport": "padel",
    "tennisLevel": "Intermediate",
    "courtPreference": "Clay",
    "playingFrequency": "2-3 times per week",
    "preferredTimes": ["Morning", "Evening"]
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Onboarding completed successfully",
  "user": {
    "id": 123,
    "email": "user@example.com",
    "sport": "padel",
    "tennis_level": "Intermediate",
    ...
  }
}
```

## Data Flow

### Frontend → Backend

**1. User selects sport** (SportSelectionScreen)
```javascript
{ sport: "padel" }
```

**2. User answers sport-specific questions** (LevelAssessmentScreen)
```javascript
{
  sport: "padel",
  tennisLevel: "Intermediate",
  levelScore: "4.2",
  answers: {...}
}
```

**3. User completes onboarding** (CourtPreference + PlayingTime)
```javascript
{
  sport: "padel",
  tennisLevel: "Intermediate",
  courtPreference: "Indoor, Outdoor",
  playingFrequency: "2-3 times per week",
  preferredTimes: ["Morning", "Evening"]
}
```

**4. Data sent to backend** (SignUpScreen or OnboardingScreen)
```javascript
POST /api/tennis/onboarding
{
  "sport": "padel",
  "tennisLevel": "Intermediate",
  "courtPreference": "Indoor, Outdoor",
  "playingFrequency": "2-3 times per week",
  "preferredTimes": ["Morning", "Evening"]
}
```

**5. Backend saves to database**
```sql
UPDATE users SET
  sport = 'padel',
  tennis_level = 'Intermediate',
  court_preference = 'Indoor, Outdoor',
  playing_frequency = '2-3 times per week',
  preferred_times = '["Morning", "Evening"]',
  onboarding_completed = TRUE
WHERE id = 123;
```

## Testing Checklist

- [ ] Database column `sport` added
- [ ] Existing users have default sport = 'tennis'
- [ ] Backend route updated on server
- [ ] PM2 restarted successfully
- [ ] Test POST /api/tennis/onboarding with sport field
- [ ] Test GET /api/tennis/onboarding returns sport field
- [ ] Frontend app can complete onboarding
- [ ] Sport selection appears in user profile
- [ ] Different sports show different questions

## Rollback Plan

If something goes wrong:

```sql
-- Remove the sport column
ALTER TABLE users DROP COLUMN IF EXISTS sport;
```

```bash
# Revert backend file
cd /root/cardapp-backend
git checkout src/routes/tennis_onboarding.js
pm2 restart cardapp-backend
```

## Future Enhancements

- Add sport-specific match tracking
- Add sport-specific stats and leaderboards
- Add sport-specific court/venue types
- Allow users to track multiple sports
- Add sport-specific social features (find players by sport)

## Questions?

If you encounter issues:
1. Check PM2 logs: `pm2 logs cardapp-backend`
2. Check database: `SELECT * FROM users WHERE id = YOUR_USER_ID;`
3. Check frontend console logs for API errors
4. Verify the backend route is receiving the `sport` field

