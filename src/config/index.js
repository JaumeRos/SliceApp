import { Platform } from 'react-native';

const ENV = {
  dev: {
    apiUrl: 'https://api.heycard.biz/api',  // Using same backend as CardApp
    webUrl: 'https://heycard.biz',
  },
  prod: {
    apiUrl: 'https://api.heycard.biz/api',
    webUrl: 'https://heycard.biz',
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

