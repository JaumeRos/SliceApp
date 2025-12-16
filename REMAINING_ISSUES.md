# Remaining Issues to Fix

## ✅ **COMPLETED**
- Sport-specific onboarding questions
- Separate tennis_users table from CardApp users table
- Backend endpoints using correct tables
- User registration and login working
- Onboarding data saving correctly

## 🔧 **TO FIX**

### 1. Flash of Onboarding Screen (Priority: Low)
**Issue**: After signup, there's a 1-second flash of "which sport do you play?" screen before going to main app.

**Why it happens**: 
- User signs up → `onboarding_completed` not set yet
- App renders → shows Onboarding screen
- Onboarding data saves → `onboarding_completed` becomes true
- `refreshUser()` updates state → navigates to Main

**Solution**: Don't set user state in AuthContext until AFTER onboarding data is saved (for pre-signup onboarding flow).

---

### 2. Missing Onboarding Completion Modal (Priority: High)
**Issue**: After completing onboarding, users should see a modal showing their ranking/level, but it's not appearing.

**Current behavior**: User goes straight to main app
**Expected behavior**: Show modal with "Your ranking: Advanced (4.7)" before going to main app

**Files to check**:
- `src/components/OnboardingCompleteModal.tsx` - The modal component exists
- `src/screens/SignUpScreen.tsx` - Should trigger modal after onboarding save
- `src/screens/onboarding/OnboardingScreen.tsx` - Shows modal for post-login onboarding

**Solution**: Add modal trigger in SignUpScreen after successful onboarding save.

---

### 3. Match Stats Not Displaying (Priority: CRITICAL)
**Issue**: Created a match but stats show 0 and match doesn't appear in profile.

**Database Status**: ✅ Match IS saved correctly
```sql
-- Match exists in tennis_matches
id: 6, user_id: 11, opponent: "Gueri", result: "win", sets: 2-0

-- Stats exist in tennis_user_stats  
user_id: 11, total_matches: 1, total_wins: 1, win_rate: 100%
```

**API Response**: ❌ Returns all zeros
```json
{
  "stats": {
    "current_streak": 0,
    "total_matches": 0,
    "total_wins": 0,
    "win_rate": 0
  }
}
```

**Root Cause**: The JWT token from tennis auth might contain a different user ID, OR the stats endpoint is not finding the user.

**Investigation needed**:
1. Check what user ID is in the JWT token
2. Verify the stats endpoint is querying with correct user_id
3. Check if there's a mismatch between auth user ID and database user ID

**Files to check**:
- `backend/src/routes/tennis_matches.js` - Stats endpoint
- `backend/src/routes/tennis_auth.js` - JWT token generation
- `src/services/api.ts` - Frontend API calls

---

### 4. Profile Screen Redesign (Priority: Medium)
**Current**: Basic profile with stats
**Target**: Match the beautiful screenshot provided

**Screenshot Analysis**:
```
┌─────────────────────────────────────┐
│  Profile Picture (circular)          │
│  Guildo Rus                          │
│                                      │
│  Matches    Followers   Following   │
│     8           8           8        │
│                                      │
│  Ranking 🏆 6.4                      │
├─────────────────────────────────────┤
│  Ranking 🏆 6.4                      │
│                                      │
│  [Line Chart showing progression]   │
│  6 → 7 (upward trend)                │
├─────────────────────────────────────┤
│  Calendar                            │
│  [Calendar grid with highlighted     │
│   dates: 9, 18, 20, 27 in yellow]   │
├─────────────────────────────────────┤
│  Matches played                      │
│  [Bar chart showing match activity]  │
└─────────────────────────────────────┘
```

**Components needed**:
1. **Header Section**:
   - Circular profile image
   - User name (from onboarding or email)
   - Stats row: Matches | Followers | Following
   - Ranking badge with score

2. **Ranking Chart**:
   - Line chart showing ranking progression over time
   - Y-axis: 6-7 range
   - Smooth curve showing improvement

3. **Calendar Heatmap**:
   - Month view calendar
   - Highlighted dates (yellow) for match days
   - Current date indicator

4. **Match Activity Chart**:
   - Bar chart showing matches per day/week
   - Gray bars of varying heights
   - Shows activity pattern

**Libraries to use**:
- `react-native-chart-kit` - For line and bar charts
- `react-native-calendars` - For calendar heatmap
- Custom styling to match the clean, minimal design

---

## 🎯 **Recommended Order**

1. **Fix Match Stats** (CRITICAL) - Users can't see their progress
2. **Add Completion Modal** (HIGH) - Important for UX and showing ranking
3. **Redesign Profile** (MEDIUM) - Makes app look professional
4. **Fix Flash** (LOW) - Minor UX issue, doesn't block functionality

---

## 📝 **Next Steps**

Let me know which issue you want to tackle first, or I can start with #1 (Match Stats) since that's blocking core functionality.

