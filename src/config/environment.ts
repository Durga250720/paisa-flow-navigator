
export const environments = {
  development: {
    baseURL: 'http://localhost:3000/api',
  },
  staging: {
    baseURL: 'https://staging-api.paisa108.com/api',
  },
  production: {
    baseURL: 'https://api.paisa108.com/api',
  }
};

export const getEnvironment = () => {
  const env = import.meta.env.MODE || 'development';
  return environments[env as keyof typeof environments] || environments.development;
};

export const config = getEnvironment();
