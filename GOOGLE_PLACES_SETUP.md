# Google Places API Setup Guide

## Step 1: Create Google Cloud Project & Enable Places API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use existing CardApp project)
3. Enable APIs:
   - Go to "APIs & Services" > "Library"
   - Search for "Places API" and enable it
   - Search for "Places API (New)" and enable it (recommended, newer version)

## Step 2: Create API Key

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the API key
4. **Important:** Restrict the key:
   - Click on the key to edit
   - Under "API restrictions": Select "Restrict key"
   - Choose: "Places API" and "Places API (New)"
   - Under "Application restrictions": 
     - iOS: Add your bundle ID (e.g., `com.yourcompany.sliceapp`)
     - Android: Add your package name (e.g., `com.yourcompany.sliceapp`)

## Step 3: Set Up Billing (Required Even for Free Tier)

1. Go to "Billing" in Google Cloud Console
2. Link a billing account (required even if staying in free tier)
3. Set up usage quotas/limits to prevent unexpected charges:
   - Go to "APIs & Services" > "Quotas"
   - Set daily limit: 1,000 requests/day (adjust based on needs)
   - Set up alerts at 50%, 75%, 90% usage

## Step 4: Add API Key to Config

Add to `src/config/index.js`:

```javascript
const ENV = {
  dev: {
    apiUrl: 'https://api.heycard.biz/api',
    webUrl: 'https://heycard.biz',
    googlePlacesApiKey: 'YOUR_API_KEY_HERE', // Add this
  },
  prod: {
    apiUrl: 'https://api.heycard.biz/api',
    webUrl: 'https://heycard.biz',
    googlePlacesApiKey: 'YOUR_API_KEY_HERE', // Add this
  },
};
```

## Step 5: Install React Native Package

```bash
npm install react-native-google-places-autocomplete
# or
yarn add react-native-google-places-autocomplete
```

## Step 6: Usage in TrackMatchScreen

```typescript
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import config from '../config';

// In your location modal:
<GooglePlacesAutocomplete
  placeholder="Search for a tennis club..."
  onPress={(data, details = null) => {
    // data.description is the location name
    setLocation(data.description);
  }}
  query={{
    key: config.googlePlacesApiKey,
    language: 'en',
    types: 'establishment', // For business/venue results
    components: 'country:us|country:es', // Limit to specific countries if needed
  }}
  fetchDetails={true}
  enablePoweredByContainer={false}
  debounce={300}
/>
```

## Cost Estimation

- Free tier: 10,000 requests/month
- After free tier: ~$2.83 per 1,000 requests
- With caching: ~80% cache hit rate after initial usage

Example:
- 1,000 users × 10 matches/month = 10,000 searches/month
- With caching: ~2,000 API calls/month
- Cost: **$0** (within free tier) for first 10k requests/month

## Security Best Practices

1. **Never commit API key to git** - Use environment variables or secure storage
2. **Restrict API key** - Limit to specific APIs and apps
3. **Set quotas** - Prevent unexpected charges
4. **Monitor usage** - Set up billing alerts

