# 🚀 Next Steps to Run SliceApp on Your Phone

## Current Status
✅ All code written  
✅ Dependencies installed  
✅ iOS pods installed  
✅ Backend URL configured (`https://api.heycard.biz/api`)  
❌ iOS configuration needed  
❌ Android configuration needed  

---

## 📱 OPTION 1: Test on iOS (Fastest)

### Step 1: Configure Apple Sign In (2 minutes)
```bash
# Open Xcode workspace
open /Users/jaumeros/code/JaumeRos/SliceApp/ios/SliceApp.xcworkspace
```

In Xcode:
1. Select **SliceApp** target (top left)
2. Go to **Signing & Capabilities** tab
3. Click **+ Capability** button
4. Search and add **Sign in with Apple**
5. Make sure your **Team** is selected under Signing

### Step 2: Add Google Sign In to Info.plist (2 minutes)
Open `ios/SliceApp/Info.plist` and add these keys inside the `<dict>` tag:

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

### Step 3: Run on Your iPhone
```bash
# Connect your iPhone via USB
# Make sure it's trusted and unlocked

cd /Users/jaumeros/code/JaumeRos/SliceApp

# Start Metro bundler
npm start

# In another terminal, run on device
npm run ios -- --device "Your iPhone Name"

# Or just run and select device in Xcode
npm run ios
```

**That's it for iOS!** 🎉

---

## 🤖 OPTION 2: Test on Android

### Step 1: Get google-services.json
You need the Firebase config file. Two options:

**A. Use CardApp's file (if same Firebase project):**
```bash
cp /Users/jaumeros/code/JaumeRos/cardapp/CardApp/android/app/google-services.json /Users/jaumeros/code/JaumeRos/SliceApp/android/app/
```

**B. Download new one from Firebase Console:**
1. Go to Firebase Console
2. Select your project
3. Add Android app or use existing
4. Download `google-services.json`
5. Place in `android/app/google-services.json`

### Step 2: Update build.gradle files

**File: `android/build.gradle`**  
Add to dependencies (if not already there):
```gradle
buildscript {
    dependencies {
        classpath 'com.google.gms:google-services:4.3.15'
    }
}
```

**File: `android/app/build.gradle`**  
Add at the very bottom:
```gradle
apply plugin: 'com.google.gms.google-services'
```

### Step 3: Get SHA-1 Fingerprint
```bash
cd /Users/jaumeros/code/JaumeRos/SliceApp/android
./gradlew signingReport
```

Copy the SHA-1 fingerprint and add it to Firebase Console:
- Project Settings > Your Apps > Android App > Add fingerprint

### Step 4: Run on Your Android Phone
```bash
# Connect phone via USB with USB debugging enabled
cd /Users/jaumeros/code/JaumeRos/SliceApp

# Start Metro
npm start

# In another terminal
npm run android
```

---

## 🧪 Testing the Backend Connection

Once the app is running, you can test if it's connected to the backend:

### Test 1: Sign Up with Email
1. Open app
2. Tap "Get Started"
3. Enter email and password
4. Tap "Sign Up"
5. **If successful**: You'll see the Home screen
6. **If error**: Check the error message

### Test 2: Verify User in Database
```bash
ssh -i ~/.ssh/hetzner_new_key root@135.181.44.164 "sudo -u postgres psql -d cardapp -c 'SELECT id, email, created_at FROM users ORDER BY created_at DESC LIMIT 5;'"
```

You should see your new user in the list!

### Test 3: Sign Out and Sign In
1. Go to Profile tab
2. Tap Settings
3. Tap Sign Out
4. Sign in with same credentials
5. **If successful**: Backend connection is working!

---

## 🔍 Backend Configuration (Already Done ✅)

The app is already configured to connect to your Hetzner backend:

**File: `src/config/index.js`**
```javascript
apiUrl: 'https://api.heycard.biz/api'
```

**Auth endpoints being used:**
- `POST /auth/register` - Sign up
- `POST /auth/login` - Sign in
- `POST /auth/google` - Google Sign In
- `POST /auth/refresh` - Token refresh

These are the same endpoints CardApp uses, so they should work immediately!

---

## 🎯 Recommended Testing Order

1. **Start with iOS** (easier, fewer steps)
2. **Test email sign up first** (simplest auth method)
3. **Verify user in database**
4. **Test sign out / sign in**
5. **Then test Apple Sign In** (iOS only)
6. **Then test Google Sign In**
7. **Move to Android** (if needed)

---

## 🐛 Troubleshooting

### "Unable to connect to backend"
- Check if backend is running:
  ```bash
  ssh -i ~/.ssh/hetzner_new_key root@135.181.44.164 "pm2 status"
  ```
- Test API directly:
  ```bash
  curl https://api.heycard.biz/api/health
  ```

### "Network request failed"
- Make sure phone is on internet (WiFi or cellular)
- Check if `https://api.heycard.biz` is accessible from your phone's browser

### "Build failed" (iOS)
```bash
cd ios
bundle exec pod install
cd ..
```

### "Build failed" (Android)
```bash
cd android
./gradlew clean
cd ..
```

---

## 📋 Quick Checklist

### iOS
- [ ] Open Xcode workspace
- [ ] Add "Sign in with Apple" capability
- [ ] Add Google URL scheme to Info.plist
- [ ] Connect iPhone via USB
- [ ] Run `npm run ios`

### Android
- [ ] Copy or download google-services.json
- [ ] Update build.gradle files
- [ ] Get SHA-1 fingerprint
- [ ] Add SHA-1 to Firebase
- [ ] Connect Android phone via USB
- [ ] Run `npm run android`

---

## ⚡ Fastest Path to Testing

**Want to test RIGHT NOW?**

1. **iOS only** (5 minutes):
   ```bash
   # 1. Open Xcode
   open /Users/jaumeros/code/JaumeRos/SliceApp/ios/SliceApp.xcworkspace
   
   # 2. Add "Sign in with Apple" capability (click + Capability)
   # 3. Add Google config to Info.plist (see above)
   # 4. Connect iPhone
   # 5. Run:
   npm run ios
   ```

2. **Test email auth** (works without Apple/Google config):
   - Sign up with email
   - Check database for new user
   - Sign out and sign in again

That's it! The backend connection is already configured and ready to go! 🚀

---

## 🎉 What Happens After First Successful Sign Up?

1. User is created in `users` table (shared with CardApp)
2. JWT tokens are stored in AsyncStorage
3. App navigates to Home screen
4. You can navigate between tabs
5. Profile shows user email
6. Settings allows sign out

**You're ready to test!** Just pick iOS or Android and follow the steps above.

