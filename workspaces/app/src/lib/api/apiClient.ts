import axios from 'axios';

const createAxiosInstance = () => {
  const instance = axios.create({
    baseURL: process.env['API_URL'] || '/',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300',
    },
    timeout: 10000,
  });

  return instance;
};

export const apiClient = createAxiosInstance();
