# SliceApp Architecture Documentation

> **Last Updated**: December 15, 2025  
> **App Version**: 1.0.0  
> **Purpose**: Social tennis tracker app for iOS/Android

---

## Table of Contents
1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Design System](#design-system)
5. [Backend Architecture](#backend-architecture)
6. [Frontend Architecture](#frontend-architecture)
7. [Authentication Flow](#authentication-flow)
8. [Database Schema](#database-schema)
9. [API Endpoints](#api-endpoints)
10. [Making Changes](#making-changes)
11. [Deployment](#deployment)

---

## Overview

**SliceApp** is a social tennis tracking application that allows users to:
- Track tennis matches (singles/doubles)
- View match history and statistics
- See win/loss streaks and rankings
- Complete onboarding to assess tennis level
- Share match results

The app shares backend infrastructure with **CardApp** (HeyCard) but uses separate database tables prefixed with `tennis_*` to avoid conflicts.

---

## Tech Stack

### Frontend (React Native)
- **Framework**: React Native 0.75.5
- **Language**: TypeScript
- **Navigation**: React Navigation (Stack + Bottom Tabs)
- **State Management**: React Context API (AuthContext)
- **Storage**: AsyncStorage (tokens, user data)
- **Charts**: react-native-chart-kit
- **Icons**: react-native-vector-icons (MaterialCommunityIcons)
- **Authentication**: 
  - Apple Sign-In: `@invertase/react-native-apple-authentication`
  - Google Sign-In: `@react-native-google-signin/google-signin`

### Backend (Node.js/Express)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (access + refresh tokens)
- **Password Hashing**: bcryptjs
- **Process Manager**: PM2
- **Server**: Hetzner VPS (135.181.44.164)

### Development Tools
- **iOS**: Xcode, CocoaPods
- **Ruby**: 3.2.2 (for CocoaPods, use `rbenv`)
- **Package Manager**: npm

---

## Project Structure

```
SliceApp/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Text.tsx         # H1, H2, H3, P1, P2, Label
│   │   ├── TextInput.tsx    # Styled input component
│   │   ├── Button.tsx       # Primary, secondary, ghost variants
│   │   ├── Card.tsx         # Container component
│   │   ├── Section.tsx      # Layout section with spacing
│   │   ├── Icon.tsx         # Custom SVG icons
│   │   ├── IconButton.tsx   # Icon-only button
│   │   ├── OnboardingCompleteModal.tsx
│   │   └── index.ts         # Export all components
│   │
│   ├── contexts/
│   │   └── AuthContext.tsx  # Authentication state management
│   │
│   ├── navigation/
│   │   └── TabNavigator.tsx # Bottom tab navigation (Home, Play, Profile)
│   │
│   ├── screens/
│   │   ├── WelcomeScreen.tsx
│   │   ├── SignInScreen.tsx
│   │   ├── SignUpScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── PlayScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   ├── SettingsScreen.tsx
│   │   ├── TrackMatchScreen.tsx
│   │   ├── MatchResultScreen.tsx
│   │   └── onboarding/
│   │       ├── OnboardingScreen.tsx       # Main onboarding orchestrator
│   │       ├── LevelAssessmentScreen.tsx  # Tennis level questions
│   │       ├── CourtPreferenceScreen.tsx  # Court type selection
│   │       └── PlayingTimeScreen.tsx      # Frequency and time preferences
│   │
│   ├── services/
│   │   ├── api.ts                  # Main API service (all endpoints)
│   │   └── googleSignInService.ts  # Google Sign-In helper
│   │
│   ├── theme/
│   │   ├── colors.ts      # Color palette
│   │   ├── typography.ts  # Text styles
│   │   ├── spacing.ts     # Spacing scale
│   │   ├── layout.ts      # Layout constants
│   │   └── index.ts       # Export all theme
│   │
│   ├── types/
│   │   └── navigation.ts  # TypeScript navigation types
│   │
│   └── config/
│       └── index.js       # API URL configuration
│
├── ios/                   # iOS native code
├── android/               # Android native code
├── App.tsx                # Root component
└── ARCHITECTURE.md        # This file
```

---

## Design System

### Colors (`src/theme/colors.ts`)
```typescript
primary: '#10B981'      // Green (main brand color)
secondary: '#1F2937'    // Dark gray (text)
white: '#FFFFFF'
grey: '#6B7280'
darkGrey: '#374151'
lightGrey: '#9CA3AF'
ultraLightGrey: '#E5E7EB'
hyperLightGrey: '#F3F4F6'
error: '#EF4444'
warning: '#F59E0B'
success: '#10B981'
```

### Typography (`src/theme/typography.ts`)
- **H1**: 32px, bold, for main titles
- **H2**: 24px, semibold, for section titles
- **H3**: 20px, semibold, for subsections
- **P1**: 16px, regular, for body text
- **P2**: 14px, regular, for secondary text
- **Label**: 14px, medium, for form labels
- **Button**: 16px, semibold, for button text
- **Input**: 16px, regular, for input text

### Spacing (`src/theme/spacing.ts`)
```typescript
xxs: 4
xs: 8
sm: 12
md: 16
lg: 20
xl: 24
xxl: 32
xxxl: 40
```

### Components

#### Text Components
```tsx
import { H1, H2, H3, P1, P2, Label } from '../components';

<H1>Main Title</H1>
<P1>Body text</P1>
```

#### Button Component
```tsx
import { Button } from '../components';

<Button 
  title="Save" 
  onPress={handleSave}
  variant="primary"  // primary | secondary | ghost
  fullWidth
  disabled={!isValid}
/>
```

#### Card Component
```tsx
import { Card } from '../components';

<Card style={{ padding: 20 }}>
  <P1>Card content</P1>
</Card>
```

---

## Backend Architecture

### Server Location
- **Host**: Hetzner VPS
- **IP**: 135.181.44.164
- **SSH**: `ssh -i ~/.ssh/hetzner_new_key root@135.181.44.164`
- **Directory**: `/root/cardapp-backend`
- **Process Manager**: PM2

### Backend Commands
```bash
# SSH into server
ssh -i ~/.ssh/hetzner_new_key root@135.181.44.164

# Navigate to backend
cd /root/cardapp-backend

# Restart backend
pm2 restart cardapp-backend

# View logs
pm2 logs cardapp-backend

# Check status
pm2 status
```

### Database Access
```bash
# Connect to PostgreSQL
cd /root/cardapp-backend && PGPASSWORD=YAV48nef psql -U cardapp -h localhost -d cardapp

# List tables
\dt

# View tennis tables
SELECT * FROM tennis_matches LIMIT 5;
SELECT * FROM tennis_user_stats;
```

### Backend File Structure
```
/root/cardapp-backend/
├── src/
│   ├── index.js                    # Main server file
│   ├── routes/
│   │   ├── auth.js                 # CardApp auth (includes /auth/me)
│   │   ├── tennis_auth.js          # Tennis-specific auth
│   │   ├── tennis_matches.js       # Match CRUD operations
│   │   └── tennis_onboarding.js    # Onboarding data
│   └── ...
├── package.json
└── .env                            # Environment variables
```

---

## Frontend Architecture

### Navigation Structure
```
App.tsx
├── AuthProvider (Context)
└── NavigationContainer
    └── Stack Navigator
        ├── Auth Stack (if !user)
        │   ├── Welcome
        │   ├── SignIn
        │   └── SignUp
        │
        ├── Onboarding Stack (if user && !onboarding_completed)
        │   └── Onboarding (3 steps)
        │
        └── Main Stack (if user && onboarding_completed)
            ├── Main (TabNavigator)
            │   ├── Home
            │   ├── Play
            │   └── Profile
            ├── Settings
            ├── TrackMatch
            └── MatchResult
```

### State Management

#### AuthContext (`src/contexts/AuthContext.tsx`)
Manages authentication state and user data.

**State:**
```typescript
{
  user: User | null;           // Current user
  accessToken: string | null;  // JWT access token
  refreshToken: string | null; // JWT refresh token
  loading: boolean;            // Loading state
  isAuthenticated: boolean;    // Auth status
}
```

**Methods:**
```typescript
signIn(email, password)      // Email/password login
signUp(email, password)      // Register new user
signOut()                    // Logout
signInWithApple()            // Apple Sign-In
signInWithGoogle()           // Google Sign-In
refreshUser()                // Fetch latest user data from backend
```

**User Object:**
```typescript
interface User {
  id: number;
  email: string;
  onboarding_completed?: boolean;
}
```

### API Service (`src/services/api.ts`)

Centralized API service with automatic token refresh.

**Structure:**
```typescript
class APIService {
  // Core request method with auto token refresh
  makeRequest(endpoint, options)
  
  // Auth endpoints
  auth = {
    login(email, password)
    register(email, password)
    googleSignIn(idToken)
    me()  // Get current user
  }
  
  // Match endpoints
  matches = {
    create(matchData)
    getHistory(limit, offset)
    getStats()
    getById(matchId)
    delete(matchId)
  }
  
  // Onboarding endpoints
  onboarding = {
    save(onboardingData)
    get()
  }
}
```

**Usage:**
```typescript
import { api } from '../services/api';

// Create match
const result = await api.matches.create({
  opponentName: 'John',
  matchType: 'singles',
  result: 'win',
  playerSets: 2,
  opponentSets: 1,
  sets: [
    { player: '6', opponent: '4' },
    { player: '6', opponent: '2' }
  ],
  location: 'Central Park',
  playedAt: new Date().toISOString()
});

// Get user stats
const stats = await api.matches.getStats();
```

---

## Authentication Flow

### Sign Up Flow
1. User enters email/password → `SignUpScreen`
2. Frontend calls `api.auth.register(email, password)`
3. Backend creates user in `users` table
4. Backend returns `{ accessToken, refreshToken, user }`
5. Frontend stores tokens in AsyncStorage
6. Frontend sets `AuthContext` state
7. App navigates to `Onboarding` (since `onboarding_completed = false`)

### Sign In Flow
1. User enters email/password → `SignInScreen`
2. Frontend calls `api.auth.login(email, password)`
3. Backend validates credentials
4. Backend returns `{ accessToken, refreshToken, user }`
5. Frontend stores tokens in AsyncStorage
6. Frontend sets `AuthContext` state
7. App checks `user.onboarding_completed`:
   - If `false` → Navigate to `Onboarding`
   - If `true` → Navigate to `Main` (tabs)

### Token Refresh
- Access tokens expire after 15 minutes
- Refresh tokens expire after 7 days
- `api.makeRequest()` automatically refreshes expired access tokens
- If refresh token is invalid, user is logged out

### Onboarding Completion
1. User completes all 3 onboarding steps
2. Frontend calls `api.onboarding.save(data)`
3. Backend saves data to `users` table
4. Backend sets `onboarding_completed = true`
5. Frontend calls `refreshUser()` to get updated user data
6. App navigates to `Main` (tabs)
7. On next login, user goes directly to `Main` (skips onboarding)

---

## Database Schema

### Tennis-Specific Tables

#### `tennis_matches`
Stores all match data.

```sql
CREATE TABLE tennis_matches (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  opponent_name VARCHAR(255),
  match_type VARCHAR(50),        -- 'singles' or 'doubles'
  result VARCHAR(20),             -- 'win' or 'loss'
  player_sets INTEGER DEFAULT 0,
  opponent_sets INTEGER DEFAULT 0,
  sets JSONB,                     -- Array of {player: '6', opponent: '4'}
  location VARCHAR(255),
  notes TEXT,
  played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `tennis_user_stats`
Automatically updated via database trigger when matches are created.

```sql
CREATE TABLE tennis_user_stats (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  total_matches INTEGER DEFAULT 0,
  total_wins INTEGER DEFAULT 0,
  total_losses INTEGER DEFAULT 0,
  win_rate NUMERIC(5,2) DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_win_streak INTEGER DEFAULT 0,
  longest_loss_streak INTEGER DEFAULT 0,
  last_match_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `users` Table (Shared with CardApp)
Tennis-specific columns added:

```sql
ALTER TABLE users ADD COLUMN tennis_level VARCHAR(50);
ALTER TABLE users ADD COLUMN court_preference TEXT;
ALTER TABLE users ADD COLUMN playing_frequency VARCHAR(50);
ALTER TABLE users ADD COLUMN preferred_times JSONB;
ALTER TABLE users ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;
```

---

## API Endpoints

### Base URL
- **Production**: `https://api.heycard.biz/api`
- **Configured in**: `src/config/index.js`

### Authentication Endpoints

#### POST `/tennis/auth/register`
Register new user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "onboarding_completed": false
  }
}
```

#### POST `/tennis/auth/login`
Login existing user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** Same as register.

#### GET `/auth/me`
Get current user info (requires auth token).

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "onboarding_completed": true,
    "tennis_level": "Intermediate",
    "court_preference": "hard, clay",
    "playing_frequency": "often",
    "preferred_times": ["morning", "evening"]
  }
}
```

### Match Endpoints

#### POST `/tennis/matches`
Create new match (requires auth).

**Request:**
```json
{
  "opponentName": "John Doe",
  "matchType": "singles",
  "result": "win",
  "playerSets": 2,
  "opponentSets": 1,
  "sets": [
    { "player": "6", "opponent": "4" },
    { "player": "6", "opponent": "2" }
  ],
  "location": "Central Park",
  "notes": "Great match!",
  "playedAt": "2025-12-15T10:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "match": { /* match object */ },
  "stats": { /* updated user stats */ }
}
```

#### GET `/tennis/matches?limit=10&offset=0`
Get user's match history (requires auth).

**Response:**
```json
{
  "success": true,
  "matches": [
    {
      "id": 1,
      "opponent_name": "John Doe",
      "result": "win",
      "player_sets": 2,
      "opponent_sets": 1,
      "sets": [...],
      "location": "Central Park",
      "played_at": "2025-12-15T10:00:00Z"
    }
  ],
  "count": 1
}
```

#### GET `/tennis/matches/stats`
Get user's statistics (requires auth).

**Response:**
```json
{
  "success": true,
  "stats": {
    "total_matches": 10,
    "total_wins": 7,
    "total_losses": 3,
    "win_rate": 70.00,
    "current_streak": 3,
    "longest_win_streak": 5,
    "longest_loss_streak": 2,
    "last_match_date": "2025-12-15T10:00:00Z"
  }
}
```

### Onboarding Endpoints

#### POST `/tennis/onboarding`
Save onboarding data (requires auth).

**Request:**
```json
{
  "tennisLevel": "Intermediate",
  "courtPreference": "hard, clay",
  "playingFrequency": "often",
  "preferredTimes": ["morning", "evening"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Onboarding data saved successfully"
}
```

**Note:** This endpoint automatically sets `onboarding_completed = true` in the database.

---

## Making Changes

### Adding a New Screen

1. **Create the screen component:**
```typescript
// src/screens/NewScreen.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { H1, P1 } from '../components';
import { colors, spacing, layout } from '../theme';

export const NewScreen = () => {
  return (
    <View style={styles.container}>
      <H1>New Screen</H1>
      <P1>Content here</P1>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: layout.screenPadding,
    backgroundColor: colors.white,
  },
});
```

2. **Add to navigation types:**
```typescript
// src/types/navigation.ts
export type RootStackParamList = {
  // ... existing screens
  NewScreen: undefined;  // or { paramName: type } if has params
};
```

3. **Add to navigator:**
```typescript
// App.tsx
import { NewScreen } from './src/screens/NewScreen';

<Stack.Screen name="NewScreen" component={NewScreen} />
```

### Adding a New API Endpoint

1. **Add method to API service:**
```typescript
// src/services/api.ts
export class APIService {
  // ... existing code
  
  newFeature = {
    doSomething: async (data: any) => {
      try {
        const response = await this.makeRequest('/tennis/new-endpoint', {
          method: 'POST',
          body: JSON.stringify(data),
        });
        
        if (!response.success) {
          throw new Error(response.error || 'Failed');
        }
        
        return response.data;
      } catch (error: any) {
        console.error('[API Service] Error:', error);
        throw error;
      }
    },
  };
}
```

2. **Create backend route:**
```javascript
// /root/cardapp-backend/src/routes/tennis_new_feature.js
const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

router.post('/', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const { data } = req.body;
  
  try {
    // Your logic here
    res.json({ success: true, data: {} });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
```

3. **Register route in main server:**
```javascript
// /root/cardapp-backend/src/index.js
const newFeatureRoutes = require('./routes/tennis_new_feature');
app.use('/api/tennis/new-feature', newFeatureRoutes);
```

4. **Restart backend:**
```bash
ssh -i ~/.ssh/hetzner_new_key root@135.181.44.164
cd /root/cardapp-backend
pm2 restart cardapp-backend
```

### Modifying Database Schema

1. **SSH into server:**
```bash
ssh -i ~/.ssh/hetzner_new_key root@135.181.44.164
```

2. **Connect to database:**
```bash
cd /root/cardapp-backend
PGPASSWORD=YAV48nef psql -U cardapp -h localhost -d cardapp
```

3. **Run migration:**
```sql
-- Add new column
ALTER TABLE tennis_matches ADD COLUMN new_field VARCHAR(255);

-- Create new table
CREATE TABLE tennis_new_table (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index
CREATE INDEX idx_tennis_new_table_user_id ON tennis_new_table(user_id);
```

4. **Exit psql:**
```sql
\q
```

### Updating Design System

**Colors:**
```typescript
// src/theme/colors.ts
export const colors = {
  // ... existing colors
  newColor: '#123456',
};
```

**Typography:**
```typescript
// src/theme/typography.ts
export const typography = StyleSheet.create({
  // ... existing styles
  h4: {
    fontFamily: 'Inter',
    fontSize: 18,
    fontWeight: '600',
    color: colors.secondary,
  },
});

// src/components/Text.tsx
export const H4: React.FC<TextProps> = ({ style, ...props }) => (
  <Text style={[typography.h4, style]} {...props} />
);
```

---

## Deployment

### iOS Build

1. **Ensure Ruby 3.2.2:**
```bash
cd /Users/jaumeros/code/JaumeRos/SliceApp
rbenv local 3.2.2
ruby --version  # Should show 3.2.2
```

2. **Install dependencies:**
```bash
npm install
cd ios
eval "$(rbenv init - zsh)"
bundle exec pod install
cd ..
```

3. **Build in Xcode:**
- Open `ios/SliceApp.xcworkspace` in Xcode
- Select your device or simulator
- Product → Build (⌘B)
- Product → Run (⌘R)

### Android Build

```bash
npm install
cd android
./gradlew clean
./gradlew assembleRelease
```

### Backend Deployment

Backend is already deployed on Hetzner. To update:

```bash
# SSH into server
ssh -i ~/.ssh/hetzner_new_key root@135.181.44.164

# Navigate to backend
cd /root/cardapp-backend

# Pull latest changes (if using git)
git pull origin main

# Install dependencies (if needed)
npm install

# Restart with PM2
pm2 restart cardapp-backend

# Check logs
pm2 logs cardapp-backend --lines 50
```

---

## Common Issues & Solutions

### Issue: CocoaPods module map errors
**Solution:**
```bash
cd ios
rm -rf Pods Podfile.lock
eval "$(rbenv init - zsh)"
bundle exec pod install
```

### Issue: Ruby version conflicts
**Solution:**
```bash
rbenv local 3.2.2
eval "$(rbenv init - zsh)"
ruby --version  # Verify 3.2.2
```

### Issue: Backend not responding
**Solution:**
```bash
ssh -i ~/.ssh/hetzner_new_key root@135.181.44.164
pm2 restart cardapp-backend
pm2 logs cardapp-backend
```

### Issue: Token expired errors
**Solution:**
- Tokens refresh automatically via `api.makeRequest()`
- If refresh token is invalid, user will be logged out
- User needs to sign in again

### Issue: Onboarding shows again after completion
**Solution:**
- Check backend logs: `pm2 logs cardapp-backend`
- Verify `onboarding_completed` is set to `true` in database
- Ensure `/auth/me` endpoint returns `onboarding_completed` field
- Call `refreshUser()` after saving onboarding data

---

## Best Practices

### Frontend
1. **Always use design system components** (H1, P1, Button, etc.)
2. **Use theme constants** for colors, spacing, typography
3. **Handle loading and error states** in all API calls
4. **Use TypeScript** for type safety
5. **Keep components small and focused**
6. **Use `useFocusEffect`** for screens that need to refresh data

### Backend
1. **Always authenticate endpoints** with `authenticateToken` middleware
2. **Use prepared statements** to prevent SQL injection
3. **Return consistent response format**: `{ success: boolean, data?: any, error?: string }`
4. **Log errors** with context for debugging
5. **Validate input data** before processing
6. **Use transactions** for multi-step database operations

### Database
1. **Prefix tennis tables** with `tennis_` to avoid conflicts with CardApp
2. **Always add indexes** on foreign keys and frequently queried columns
3. **Use JSONB** for flexible data structures (sets, preferred_times)
4. **Set up triggers** for automatic stat calculations
5. **Use CASCADE** on foreign keys for automatic cleanup

---

## Environment Variables

### Frontend (`src/config/index.js`)
```javascript
const config = {
  apiUrl: 'https://api.heycard.biz/api',
};
```

### Backend (`.env` on server)
```bash
DB_USER=cardapp
DB_PASSWORD=YAV48nef
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cardapp
JWT_SECRET=<secret>
PORT=3000
```

---

## Support & Resources

- **Backend Server**: 135.181.44.164
- **Database**: PostgreSQL on same server
- **Process Manager**: PM2
- **SSH Key**: `~/.ssh/hetzner_new_key`

### Useful Commands Reference

```bash
# Frontend
npm start                    # Start Metro bundler
npm run ios                  # Run on iOS simulator
npm run android              # Run on Android emulator

# Backend
ssh -i ~/.ssh/hetzner_new_key root@135.181.44.164
pm2 restart cardapp-backend
pm2 logs cardapp-backend
pm2 status

# Database
PGPASSWORD=YAV48nef psql -U cardapp -h localhost -d cardapp
\dt                          # List tables
\d tennis_matches            # Describe table
SELECT * FROM tennis_user_stats;
```

---

**Last Updated**: December 15, 2025  
**Maintained By**: Development Team  
**Questions?** Check the code comments or this document first!

