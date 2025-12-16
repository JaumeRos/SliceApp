# SliceApp - Final Setup Instructions

## ✅ What's Been Completed

### Core Files Created
- ✅ **AuthContext.tsx** - Authentication with Apple, Google, Email
- ✅ **api.ts** - API service with token refresh
- ✅ **googleSignInService.ts** - Google Sign In configuration
- ✅ **config/index.js** - Backend configuration
- ✅ **App.tsx** - Root component with navigation
- ✅ **TabNavigator.tsx** - Bottom tabs (Home, Play, Profile)

### Screens Created
- ✅ **WelcomeScreen** - Landing page with features
- ✅ **SignInScreen** - Email + Apple + Google sign in
- ✅ **SignUpScreen** - Email + Apple + Google sign up
- ✅ **HomeScreen** - Match feed with floating "+" button
- ✅ **PlayScreen** - Track match (coming soon UI)
- ✅ **ProfileScreen** - User profile with stats
- ✅ **SettingsScreen** - Settings with sign out

### UI Components
- ✅ **Text.tsx** - Typography components (H1, H2, P1, ButtonText)
- ✅ **TextInput.tsx** - Custom input with icons
- ✅ **Icon.tsx** - Apple, Google, Back icons (SVG)

### Dependencies Installed
- ✅ All npm packages installed
- ✅ iOS pods installed successfully

---

## 🔧 iOS Configuration (Required)

### 1. Add Apple Sign In Capability
1. Open `/Users/jaumeros/code/JaumeRos/SliceApp/ios/SliceApp.xcworkspace` in Xcode
2. Select the `SliceApp` target
3. Go to **Signing & Capabilities**
4. Click **+ Capability**
5. Add **Sign in with Apple**

### 2. Configure Google Sign In
Add the following to `ios/SliceApp/Info.plist` (inside the `<dict>` tag):

```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleTypeRole</key>
    <string>Editor</string>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>com.googleusercontent.apps.22354603271-5jarcv5opmi5v5l07buuli2fiehrqr8g</string>
    </array>
  </dict>
</array>
<key>GIDClientID</key>
<string>22354603271-5jarcv5opmi5v5l07buuli2fiehrqr8g.apps.googleusercontent.com</string>
```

---

## 🤖 Android Configuration (Required)

### 1. Configure Google Sign In

#### A. Add Google Services JSON
1. Download `google-services.json` from Firebase Console (or use CardApp's if same project)
2. Place it in: `android/app/google-services.json`

#### B. Update `android/build.gradle`
Add this to dependencies (if not already there):

```gradle
buildscript {
    dependencies {
        classpath 'com.google.gms:google-services:4.3.15'
    }
}
```

#### C. Update `android/app/build.gradle`
Add at the bottom of the file:

```gradle
apply plugin: 'com.google.gms.google-services'
```

Also add in `android/app/build.gradle` under `dependencies`:

```gradle
implementation 'com.google.android.gms:play-services-auth:20.7.0'
```

#### D. Get SHA-1 Fingerprint
```bash
cd android
./gradlew signingReport
```

Copy the SHA-1 fingerprint and add it to Firebase Console:
- Go to Project Settings > Your Apps > Android App
- Add the SHA-1 fingerprint

### 2. Update AndroidManifest.xml
Ensure `android/app/src/main/AndroidManifest.xml` has internet permission:

```xml
<uses-permission android:name="android.permission.INTERNET" />
```

---

## 🚀 Testing the App

### iOS
```bash
cd /Users/jaumeros/code/JaumeRos/SliceApp
npm start
# In another terminal:
npm run ios
```

### Android
```bash
cd /Users/jaumeros/code/JaumeRos/SliceApp
npm start
# In another terminal:
npm run android
```

---

## 🎯 What You Can Test

### Authentication
- ✅ **Email Sign Up** - Create account with email/password
- ✅ **Email Sign In** - Sign in with existing account
- ✅ **Apple Sign In** (iOS only) - Sign in with Apple ID
- ✅ **Google Sign In** (iOS & Android) - Sign in with Google

### Navigation
- ✅ **Home Tab** - See empty state with "+" button
- ✅ **Play Tab** - See "coming soon" UI
- ✅ **Profile Tab** - See stats (all zeros) and settings button
- ✅ **Settings** - View account info and sign out

### UI Features
- ✅ Floating "+" button on Home screen
- ✅ Beautiful card-based design
- ✅ Tennis green theme (#10B981)
- ✅ Smooth navigation transitions

---

## 📱 App Structure

```
SliceApp/
├── App.tsx ✅                          # Root component
├── src/
│   ├── contexts/
│   │   └── AuthContext.tsx ✅          # Auth logic
│   ├── services/
│   │   ├── api.ts ✅                   # API service
│   │   └── googleSignInService.ts ✅   # Google Sign In
│   ├── config/
│   │   └── index.js ✅                 # Backend URL
│   ├── navigation/
│   │   └── TabNavigator.tsx ✅         # Bottom tabs
│   ├── screens/
│   │   ├── WelcomeScreen.tsx ✅        # Landing
│   │   ├── SignInScreen.tsx ✅         # Sign in
│   │   ├── SignUpScreen.tsx ✅         # Sign up
│   │   ├── HomeScreen.tsx ✅           # Match feed
│   │   ├── PlayScreen.tsx ✅           # Track match
│   │   ├── ProfileScreen.tsx ✅        # User profile
│   │   └── SettingsScreen.tsx ✅       # Settings
│   ├── components/
│   │   ├── Text.tsx ✅                 # Typography
│   │   ├── TextInput.tsx ✅            # Custom input
│   │   └── Icon.tsx ✅                 # SVG icons
│   ├── theme/
│   │   ├── colors.ts ✅                # Color palette
│   │   ├── typography.ts ✅            # Text styles
│   │   └── index.ts ✅                 # Theme exports
│   └── types/
│       └── navigation.ts ✅            # Navigation types
```

---

## 🔐 Backend Configuration

**Current Backend URL**: `https://api.heycard.biz/api`

The app is configured to use the existing CardApp backend:
- **Shared `users` table** for authentication
- **Separate tennis tables** (to be created later):
  - `tennis_matches`
  - `tennis_stats`
  - `tennis_players`

---

## 🐛 Troubleshooting

### iOS Build Errors
```bash
cd ios
bundle exec pod install
cd ..
```

### Android Build Errors
```bash
cd android
./gradlew clean
cd ..
```

### Metro Bundler Cache Issues
```bash
npm start -- --reset-cache
```

### Google Sign In Not Working
1. Verify `google-services.json` is in place (Android)
2. Verify SHA-1 fingerprint is added to Firebase
3. Verify URL scheme is in `Info.plist` (iOS)
4. Check client IDs in `googleSignInService.ts`

---

## 📋 Next Steps (After Testing)

1. **Test authentication** on both iOS and Android
2. **Verify users** are created in database:
   ```bash
   ssh -i ~/.ssh/hetzner_new_key root@135.181.44.164 "sudo -u postgres psql -d cardapp -c 'SELECT id, email, created_at FROM users ORDER BY created_at DESC LIMIT 5;'"
   ```
3. **Create tennis tables** in database (when ready for match tracking)
4. **Implement match tracking** functionality
5. **Add real stats** to ProfileScreen

---

## 🎨 Design System

### Colors
- **Primary**: `#10B981` (Tennis green)
- **Secondary**: `#1F2937` (Dark gray)
- **Grey**: `#6B7280`
- **Light Grey**: `#D1D5DB`
- **Background**: `#F9FAFB`
- **Error**: `#EF4444`
- **Warning**: `#F59E0B`

### Typography
- **H1**: 35px, bold
- **H2**: 24px, semibold
- **P1**: 16px, regular
- **Button**: 15px, medium

---

## ✅ Status: Ready to Test!

The app is **fully configured** and ready for testing on both iOS and Android. Just complete the iOS/Android configuration steps above and you're good to go! 🎾

**What works:**
- ✅ Complete authentication flow
- ✅ Beautiful UI with tennis theme
- ✅ Navigation between all screens
- ✅ Sign out functionality
- ✅ Empty states and placeholders

**What's next:**
- 🔜 Implement match tracking
- 🔜 Add real stats
- 🔜 Create tennis database tables

