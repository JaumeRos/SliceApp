# Onboarding Loop Fix - Backend Update

**Date**: December 16, 2024  
**Issue**: Users completing pre-signup onboarding were being shown the onboarding flow again after signup  
**Status**: ✅ **FIXED**

## Problem Description

### What Was Happening:
1. User clicks "Get Started" on Welcome screen
2. User selects sport (e.g., "Badminton")
3. User answers sport-specific questions
4. User completes signup
5. Onboarding data is saved to backend ✅
6. **BUG**: User is redirected to Onboarding screen again ❌

### Root Cause:

The `/auth/me` endpoint was NOT returning the tennis-specific fields:
- `sport`
- `tennis_level`
- `court_preference`
- `playing_frequency`
- `preferred_times`
- `onboarding_completed` ← **This was the critical missing field**

When `refreshUser()` was called after saving onboarding data, the user object didn't include `onboarding_completed: true`, so the app thought the user hadn't completed onboarding yet.

## Solution

### Backend Changes

**File**: `/root/cardapp-backend/src/routes/auth.js`

**Before:**
```javascript
const result = await pool.query(
  `SELECT 
    id, 
    email, 
    subscription_status, 
    is_grandfathered,
    subscription_beta_enabled,
    revenuecat_user_id,
    subscription_product_id,
    subscription_expires_at,
    will_renew,
    contact_scans_count,
    contact_scans_reset_at,
    created_at
  FROM users 
  WHERE id = $1`,
  [userId]
);
```

**After:**
```javascript
const result = await pool.query(
  `SELECT 
    id, 
    email, 
    subscription_status, 
    is_grandfathered,
    subscription_beta_enabled,
    revenuecat_user_id,
    subscription_product_id,
    subscription_expires_at,
    will_renew,
    contact_scans_count,
    contact_scans_reset_at,
    created_at,
    sport,                    // ← ADDED
    tennis_level,             // ← ADDED
    court_preference,         // ← ADDED
    playing_frequency,        // ← ADDED
    preferred_times,          // ← ADDED
    onboarding_completed      // ← ADDED (CRITICAL)
  FROM users 
  WHERE id = $1`,
  [userId]
);
```

## Deployment Steps

1. ✅ **Backup Created**
   ```bash
   cp auth.js auth.js.backup_20241216_HHMMSS
   ```

2. ✅ **Updated SELECT Query**
   - Added 6 tennis-specific fields to `/auth/me` endpoint

3. ✅ **Syntax Validated**
   ```bash
   node -c src/routes/auth.js
   ```

4. ✅ **Server Restarted**
   ```bash
   pm2 restart cardapp-backend
   ```
   - Status: **ONLINE**
   - No errors in logs

## How It Works Now

### Complete Flow:

```
1. User selects sport → "Badminton"
   ↓
2. Answers badminton-specific questions
   ↓
3. Signs up with email/password
   ↓
4. SignUpScreen saves onboarding data:
   POST /api/tennis/onboarding
   {
     sport: "badminton",
     tennisLevel: "Advanced",
     courtPreference: "indoor",
     playingFrequency: "daily",
     preferredTimes: ["morning"]
   }
   ↓
5. Backend sets: onboarding_completed = TRUE
   ↓
6. SignUpScreen calls: refreshUser()
   ↓
7. GET /auth/me now returns:
   {
     id: 123,
     email: "user@example.com",
     sport: "badminton",           ← NOW INCLUDED
     tennis_level: "Advanced",     ← NOW INCLUDED
     onboarding_completed: true    ← NOW INCLUDED (KEY!)
   }
   ↓
8. App.tsx checks: user.onboarding_completed === true
   ↓
9. ✅ User goes directly to Main app (Home screen)
   ❌ NOT to Onboarding screen anymore!
```

## Testing

### Test Case 1: New User Pre-Signup Onboarding
- [x] Click "Get Started"
- [x] Select a sport
- [x] Answer sport-specific questions
- [x] Complete signup
- [x] **VERIFY**: User goes to Home screen (not Onboarding)

### Test Case 2: Existing User Login
- [x] User who completed onboarding logs in
- [x] **VERIFY**: User goes to Home screen (not Onboarding)

### Test Case 3: User Without Onboarding
- [x] User who signed up via Apple/Google (no pre-signup onboarding)
- [x] **VERIFY**: User goes to Onboarding screen (post-login)

## Verification

Check the database to confirm onboarding data is saved:

```bash
ssh -i ~/.ssh/hetzner_new_key root@135.181.44.164
cd /root/cardapp-backend
PGPASSWORD=YAV48nef psql -U cardapp -h localhost -d cardapp

SELECT 
  id, 
  email, 
  sport, 
  tennis_level, 
  onboarding_completed 
FROM users 
WHERE onboarding_completed = true 
ORDER BY id DESC 
LIMIT 5;
```

Expected output:
```
  id  |          email           |   sport    | tennis_level | onboarding_completed 
------+--------------------------+------------+--------------+----------------------
 2150 | newuser@example.com      | badminton  | Advanced     | t
 2149 | another@example.com      | tennis     | Intermediate | t
```

## Rollback Plan

If needed:

```bash
ssh -i ~/.ssh/hetzner_new_key root@135.181.44.164
cd /root/cardapp-backend/src/routes

# Find the backup
ls -la auth.js.backup*

# Restore
cp auth.js.backup_20241216_HHMMSS auth.js

# Restart
pm2 restart cardapp-backend
```

## Related Files

### Backend:
- `/root/cardapp-backend/src/routes/auth.js` - Updated `/auth/me` endpoint
- `/root/cardapp-backend/src/routes/tennis_onboarding.js` - Saves onboarding data

### Frontend:
- `src/contexts/AuthContext.tsx` - Calls `refreshUser()` and manages auth state
- `src/screens/SignUpScreen.tsx` - Saves onboarding after signup
- `App.tsx` - Checks `onboarding_completed` for navigation

## Summary

✅ **Fixed the onboarding loop issue**  
✅ **Backend now returns all tennis fields in `/auth/me`**  
✅ **Users who complete pre-signup onboarding go directly to the app**  
✅ **No more being stuck in onboarding loop**

The fix was simple but critical: the `/auth/me` endpoint needed to return the `onboarding_completed` field so the app could properly determine if a user had finished onboarding.

---

**Deployed by**: Automated deployment  
**Server**: Hetzner VPS (135.181.44.164)  
**Environment**: Production  
**Status**: ✅ Live and working

