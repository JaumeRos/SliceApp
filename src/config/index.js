import { Platform } from 'react-native';

// NOTE: API keys in config files should be restricted in Google Cloud Console
// For production, consider using environment variables or secure config management
const ENV = {
  dev: {
    apiUrl: 'https://api.heycard.biz/api',  // Using same backend as CardApp
    webUrl: 'https://heycard.biz',
    googlePlacesApiKey: 'AIzaSyD7g8eHwTXUdf-xGPWYXJ3Hy2e5rgg4TdY',
  },
  prod: {
    apiUrl: 'https://api.heycard.biz/api',
    webUrl: 'https://heycard.biz',
    googlePlacesApiKey: 'AIzaSyD7g8eHwTXUdf-xGPWYXJ3Hy2e5rgg4TdY',
  },
};

const getEnvVars = () => {
  const isDev = __DEV__;
  const env = isDev ? ENV.dev : ENV.prod;

  console.log('[Config] Environment:', isDev ? 'Development' : 'Production');
  console.log('[Config] Platform:', Platform.OS);
  console.log('[Config] API URL:', env.apiUrl);

  return env;
};

export default getEnvVars();

