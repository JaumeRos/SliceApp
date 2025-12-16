# SliceApp (Tennis Social Tracker) - Setup Guide

## 🎾 Overview

**SliceApp** is a social tennis tracking app where players can log matches, track stats, and connect with other players.

**Key Info:**
- **Backend**: Shared with CardApp on Hetzner server
- **Database**: Same `cardapp` database, NEW tennis-specific tables
- **Auth**: Reuses Apple Sign In & Google Sign In from CardApp
- **Strategy**: Shared `users` table, separate tennis tables (100% safe for CardApp)

---

## 🚨 CRITICAL: Ruby Version

**MUST use Ruby 3.2.2** - Ruby 3.4 breaks CocoaPods!

```bash
cd /Users/jaumeros/code/JaumeRos/SliceApp
rbenv local 3.2.2
ruby --version  # Should show 3.2.2
```

---

## 📋 Current Status

### ✅ Completed
- [x] React Native app initialized
- [x] Ruby 3.2.2 configured
- [x] iOS Podfile configured (iOS 15.1 minimum)
- [x] CocoaPods installed successfully
- [x] Dependencies installed:
  - Apple Authentication
  - Google Sign In
  - AsyncStorage
  - Navigation
  - Image Picker
  - Reanimated

### 🔄 Next Steps
- [ ] Copy auth code from CardApp
- [ ] Set up navigation (3 tabs: Home, Play, Profile)
- [ ] Create basic UI screens
- [ ] Connect to Hetzner backend
- [ ] Create tennis database tables (SAFE - won't touch CardApp)
- [ ] Test authentication

---

## 🏗️ Architecture

### App Structure
```
SliceApp/
├── src/
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── SignInScreen.tsx       # Copy from CardApp
│   │   │   └── SignUpScreen.tsx       # Copy from CardApp
│   │   ├── HomeScreen.tsx             # Feed/matches list + big "+" button
│   │   ├── PlayScreen.tsx             # Track new match (center tab)
│   │   └── ProfileScreen.tsx          # User profile
│   ├── contexts/
│   │   └── AuthContext.tsx            # Copy from CardApp
│   ├── services/
│   │   ├── api.ts                     # Copy from CardApp
│   │   └── googleSignInService.ts     # Copy from CardApp
│   ├── navigation/
│   │   ├── AppNavigator.tsx           # Root navigator
│   │   └── TabNavigator.tsx           # Bottom tabs (Home, Play, Profile)
│   ├── components/
│   │   ├── Text.tsx                   # Copy from CardApp
│   │   ├── TextInput.tsx              # Copy from CardApp
│   │   └── Icon.tsx                   # Copy from CardApp
│   └── theme/                         # Copy from CardApp
```

### Backend Structure (Hetzner)
```
Hetzner Server (135.181.44.164)
├── /root/cardapp-backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.js              # Existing - SHARED by both apps
│   │   │   ├── cards.js             # Existing - CardApp only
│   │   │   └── tennis.js            # NEW - SliceApp only
│   │   └── index.js                 # Main server file
│   └── .env                         # Environment variables
```

### Database Structure (PostgreSQL)
```
Database: cardapp
├── users                    # Existing - SHARED (DON'T TOUCH)
├── business_cards           # Existing - CardApp only (DON'T TOUCH)
├── contacts                 # Existing - CardApp only (DON'T TOUCH)
├── tennis_matches           # NEW - SliceApp only
├── tennis_stats             # NEW - SliceApp only
└── tennis_players           # NEW - SliceApp only (optional)
```

---

## 🔐 Authentication (Reusing CardApp)

### Files to Copy from CardApp

```bash
# Navigate to CardApp directory
cd /Users/jaumeros/code/JaumeRos/cardapp/CardApp

# Copy auth files to SliceApp
cp src/contexts/AuthContext.tsx ../../../SliceApp/src/contexts/
cp src/services/api.ts ../../../SliceApp/src/services/
cp src/services/googleSignInService.ts ../../../SliceApp/src/services/
cp src/screens/SignInScreen.tsx ../../../SliceApp/src/screens/auth/
cp src/screens/SignUpScreen.tsx ../../../SliceApp/src/screens/auth/

# Copy UI components
cp src/components/Text.tsx ../../../SliceApp/src/components/
cp src/components/TextInput.tsx ../../../SliceApp/src/components/
cp src/components/Icon.tsx ../../../SliceApp/src/components/

# Copy theme
cp -r src/theme ../../../SliceApp/src/

# Copy config
cp -r src/config ../../../SliceApp/src/
```

### Update API URL

```typescript
// src/config/index.ts
const config = {
  apiUrl: 'https://heycard.app/api',  // Same as CardApp
  // ... other config
};
```

### Apple Sign In (iOS)

**Already configured in CardApp - just needs Xcode setup:**

1. Open `ios/SliceApp.xcworkspace` in Xcode
2. Select SliceApp target
3. Go to "Signing & Capabilities"
4. Click "+ Capability"
5. Add "Sign in with Apple"
6. Done! ✅

### Google Sign In

**Already configured in CardApp - just update client IDs:**

```typescript
// src/services/googleSignInService.ts

// Option 1: Use SAME credentials as CardApp (easiest for testing)
// Option 2: Create NEW credentials in Google Cloud Console

const GOOGLE_WEB_CLIENT_ID = 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com';
const GOOGLE_IOS_CLIENT_ID = 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com';
```

**iOS Setup:**
```xml
<!-- ios/SliceApp/Info.plist -->
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleTypeRole</key>
    <string>Editor</string>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>com.googleusercontent.apps.YOUR_IOS_CLIENT_ID</string>
    </array>
  </dict>
</array>
```

---

## 🗄️ Database Setup (NEW Tennis Tables)

### Connection Info

```bash
# SSH to Hetzner
ssh -i ~/.ssh/hetzner_new_key root@135.181.44.164

# Connect to PostgreSQL
cd /root/cardapp-backend
PGPASSWORD=YAV48nef psql -U cardapp -h localhost -d cardapp

# List all tables
\dt

# Check existing users (DON'T MODIFY)
SELECT id, email, created_at FROM users ORDER BY created_at DESC LIMIT 5;
```

### NEW Tennis Tables (SAFE - Won't Touch CardApp)

**⚠️ DO NOT RUN THESE YET - Review first!**

```sql
-- Tennis matches table
CREATE TABLE IF NOT EXISTS tennis_matches (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  opponent_name VARCHAR(255) NOT NULL,
  user_score INTEGER NOT NULL,
  opponent_score INTEGER NOT NULL,
  match_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tennis stats table (aggregate stats per user)
CREATE TABLE IF NOT EXISTS tennis_stats (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  total_matches INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  win_rate DECIMAL(5,2) DEFAULT 0.00,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tennis_matches_user_id ON tennis_matches(user_id);
CREATE INDEX IF NOT EXISTS idx_tennis_matches_date ON tennis_matches(match_date DESC);
CREATE INDEX IF NOT EXISTS idx_tennis_stats_user_id ON tennis_stats(user_id);

-- Trigger to auto-update stats when match is added
CREATE OR REPLACE FUNCTION update_tennis_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO tennis_stats (user_id, total_matches, wins, losses, win_rate)
  VALUES (
    NEW.user_id,
    1,
    CASE WHEN NEW.user_score > NEW.opponent_score THEN 1 ELSE 0 END,
    CASE WHEN NEW.user_score < NEW.opponent_score THEN 1 ELSE 0 END,
    CASE WHEN NEW.user_score > NEW.opponent_score THEN 100.00 ELSE 0.00 END
  )
  ON CONFLICT (user_id) DO UPDATE SET
    total_matches = tennis_stats.total_matches + 1,
    wins = tennis_stats.wins + CASE WHEN NEW.user_score > NEW.opponent_score THEN 1 ELSE 0 END,
    losses = tennis_stats.losses + CASE WHEN NEW.user_score < NEW.opponent_score THEN 1 ELSE 0 END,
    win_rate = ROUND((tennis_stats.wins + CASE WHEN NEW.user_score > NEW.opponent_score THEN 1 ELSE 0 END)::NUMERIC / (tennis_stats.total_matches + 1) * 100, 2),
    updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_tennis_stats
AFTER INSERT ON tennis_matches
FOR EACH ROW
EXECUTE FUNCTION update_tennis_stats();
```

**Why This is Safe:**
- ✅ Only creates NEW tables (`tennis_matches`, `tennis_stats`)
- ✅ Uses `IF NOT EXISTS` (won't fail if tables exist)
- ✅ References existing `users` table (doesn't modify it)
- ✅ Indexes for performance
- ✅ Auto-updates stats via trigger
- ✅ **Zero impact on CardApp tables**

---

## 🚀 Backend API Routes (NEW)

### Add Tennis Routes

**File: `/root/cardapp-backend/src/routes/tennis.js` (NEW FILE)**

```javascript
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

// Get all matches for logged-in user
router.get('/matches', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await req.db.query(
      'SELECT * FROM tennis_matches WHERE user_id = $1 ORDER BY match_date DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
});

// Create new match
router.post('/matches', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { opponent_name, user_score, opponent_score, notes } = req.body;
    
    const result = await req.db.query(
      'INSERT INTO tennis_matches (user_id, opponent_name, user_score, opponent_score, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userId, opponent_name, user_score, opponent_score, notes]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating match:', error);
    res.status(500).json({ error: 'Failed to create match' });
  }
});

// Get user stats
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await req.db.query(
      'SELECT * FROM tennis_stats WHERE user_id = $1',
      [userId]
    );
    
    if (result.rows.length === 0) {
      // No stats yet, return zeros
      return res.json({
        total_matches: 0,
        wins: 0,
        losses: 0,
        win_rate: 0.00
      });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Delete match
router.delete('/matches/:matchId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { matchId } = req.params;
    
    await req.db.query(
      'DELETE FROM tennis_matches WHERE id = $1 AND user_id = $2',
      [matchId, userId]
    );
    
    res.json({ message: 'Match deleted' });
  } catch (error) {
    console.error('Error deleting match:', error);
    res.status(500).json({ error: 'Failed to delete match' });
  }
});

module.exports = router;
```

### Register Tennis Routes

**File: `/root/cardapp-backend/src/index.js` (UPDATE)**

```javascript
// Add this line with other route imports
const tennisRoutes = require('./routes/tennis');

// Add this line with other route registrations
app.use('/api/tennis', tennisRoutes);
```

**That's it! No changes to existing CardApp routes.**

---

## 📱 App Screens (Basic UI)

### 1. HomeScreen.tsx (Feed + Big "+" Button)

```typescript
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Matches</Text>
      
      {/* Big "+" button (aesthetic only for now) */}
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => navigation.navigate('Play')}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
      
      {/* Matches list will go here */}
      <Text style={styles.emptyText}>No matches yet. Tap + to add one!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  addButtonText: {
    fontSize: 36,
    color: '#fff',
    fontWeight: '300',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 40,
  },
});
```

### 2. PlayScreen.tsx (Track Match - Center Tab)

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const PlayScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Track Match</Text>
      <Text style={styles.subtitle}>Coming soon...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
  },
});
```

### 3. ProfileScreen.tsx (User Profile)

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export const ProfileScreen = () => {
  const { user } = useAuth();
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.email}>{user?.email}</Text>
      
      {/* Stats will go here */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>Stats</Text>
        <Text style={styles.statsText}>Matches: 0</Text>
        <Text style={styles.statsText}>Wins: 0</Text>
        <Text style={styles.statsText}>Losses: 0</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  statsContainer: {
    backgroundColor: '#f5f5f5',
    padding: 20,
    borderRadius: 10,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  statsText: {
    fontSize: 16,
    marginVertical: 5,
  },
});
```

### 4. TabNavigator.tsx (Bottom Navigation)

```typescript
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/HomeScreen';
import { PlayScreen } from '../screens/PlayScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#999',
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          // Add icon here
        }}
      />
      <Tab.Screen 
        name="Play" 
        component={PlayScreen}
        options={{
          tabBarLabel: 'Play',
          // Add icon here
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          // Add icon here
        }}
      />
    </Tab.Navigator>
  );
};
```

---

## ⚡ Quick Start Commands

### Setup (One Time)

```bash
cd /Users/jaumeros/code/JaumeRos/SliceApp

# Ensure Ruby 3.2.2
rbenv local 3.2.2
ruby --version

# Install dependencies (already done)
npm install
bundle install
cd ios && bundle exec pod install && cd ..
```

### Run App

```bash
# Terminal 1: Start Metro
npm start

# Terminal 2: Run iOS
npm run ios

# Or run Android
npm run android
```

### Backend Commands

```bash
# SSH to Hetzner
ssh -i ~/.ssh/hetzner_new_key root@135.181.44.164

# Check backend status
pm2 status

# Restart backend (after adding tennis routes)
pm2 restart cardapp-backend

# View logs
pm2 logs cardapp-backend

# Connect to database
cd /root/cardapp-backend
PGPASSWORD=YAV48nef psql -U cardapp -h localhost -d cardapp
```

### Database Commands

```bash
# List all tables
\dt

# Check users (DON'T MODIFY)
SELECT id, email, created_at FROM users ORDER BY created_at DESC LIMIT 5;

# Check tennis matches (after creating table)
SELECT * FROM tennis_matches ORDER BY match_date DESC LIMIT 10;

# Check tennis stats (after creating table)
SELECT u.email, ts.* FROM tennis_stats ts 
JOIN users u ON u.id = ts.user_id;
```

---

## 🔍 Testing Checklist

### Phase 1: Authentication
- [ ] Copy auth files from CardApp
- [ ] Update API URL to point to Hetzner
- [ ] Test email sign up
- [ ] Test email sign in
- [ ] Test Apple Sign In (iOS device)
- [ ] Test Google Sign In
- [ ] Verify user created in database

### Phase 2: Navigation
- [ ] Create TabNavigator with 3 tabs
- [ ] Test navigation between tabs
- [ ] Verify bottom tab bar displays correctly

### Phase 3: Basic UI
- [ ] HomeScreen shows with "+" button
- [ ] PlayScreen shows placeholder
- [ ] ProfileScreen shows user email
- [ ] "+" button navigates to Play tab

### Phase 4: Backend (DO LATER)
- [ ] Create tennis tables in database
- [ ] Add tennis routes to backend
- [ ] Restart backend
- [ ] Test GET /api/tennis/matches
- [ ] Test POST /api/tennis/matches
- [ ] Test GET /api/tennis/stats

---

## 🚨 Safety Checklist

### Before ANY Backend Changes:
- [ ] Backup database: `pg_dump cardapp > backup.sql`
- [ ] Test SQL queries in separate session first
- [ ] Use `IF NOT EXISTS` for all CREATE statements
- [ ] Never use `DROP TABLE` on existing tables
- [ ] Always use transactions for data modifications

### Database Safety:
```sql
-- NEVER do this:
DROP TABLE users;  -- ❌ DANGER!
ALTER TABLE users DROP COLUMN email;  -- ❌ DANGER!

-- Always do this:
CREATE TABLE IF NOT EXISTS tennis_matches (...);  -- ✅ SAFE
INSERT INTO tennis_matches (...);  -- ✅ SAFE
SELECT * FROM tennis_matches;  -- ✅ SAFE
```

---

## 📚 Key Files Reference

### Authentication (Copy from CardApp)
- `src/contexts/AuthContext.tsx` - Auth state & logic
- `src/services/api.ts` - API client with JWT
- `src/services/googleSignInService.ts` - Google Sign In config
- `src/screens/auth/SignInScreen.tsx` - Sign in UI
- `src/screens/auth/SignUpScreen.tsx` - Sign up UI

### Navigation
- `src/navigation/AppNavigator.tsx` - Root navigator
- `src/navigation/TabNavigator.tsx` - Bottom tabs

### Screens
- `src/screens/HomeScreen.tsx` - Feed + "+" button
- `src/screens/PlayScreen.tsx` - Track match
- `src/screens/ProfileScreen.tsx` - User profile

### Backend (Hetzner)
- `/root/cardapp-backend/src/routes/auth.js` - Existing auth (shared)
- `/root/cardapp-backend/src/routes/tennis.js` - NEW tennis routes
- `/root/cardapp-backend/src/index.js` - Main server file

---

## 🎯 Next Steps

1. **Copy auth code from CardApp** ✅ (Ready to do)
2. **Set up navigation** ✅ (Code provided above)
3. **Create basic screens** ✅ (Code provided above)
4. **Test authentication** (Use existing CardApp backend)
5. **Create tennis tables** ⚠️ (Review SQL first)
6. **Add tennis routes** ⚠️ (Review code first)
7. **Test end-to-end** 🎾

---

## 📞 Support

### Common Issues

**Issue: Ruby version wrong**
```bash
rbenv local 3.2.2
bundle install
cd ios && bundle exec pod install
```

**Issue: CocoaPods fails**
```bash
cd ios
rm -rf Pods Podfile.lock
bundle exec pod install --repo-update
```

**Issue: Metro cache issues**
```bash
npm start -- --reset-cache
```

**Issue: Backend not responding**
```bash
ssh -i ~/.ssh/hetzner_new_key root@135.181.44.164
pm2 restart cardapp-backend
pm2 logs cardapp-backend
```

---

## 🎾 Summary

**What We're Building:**
- Tennis match tracking app
- 3 tabs: Home (feed), Play (track), Profile
- Shared auth with CardApp (Apple, Google, Email)
- NEW tennis tables (safe, won't affect CardApp)
- NEW tennis API routes

**What's Safe:**
- ✅ Using existing `users` table (read-only for tennis)
- ✅ Creating NEW tennis tables
- ✅ Adding NEW API routes
- ✅ Sharing backend server

**What's NOT Safe (Don't Do):**
- ❌ Modifying existing CardApp tables
- ❌ Deleting any existing data
- ❌ Changing existing API routes

---

**Last Updated:** December 2025  
**Ruby Version:** 3.2.2 (REQUIRED)  
**iOS Min:** 15.1  
**Backend:** Hetzner (135.181.44.164)  
**Database:** cardapp (PostgreSQL)

