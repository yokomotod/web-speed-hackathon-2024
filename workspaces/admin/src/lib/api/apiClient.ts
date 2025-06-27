import ky from 'ky';

const createKyInstance = () => {
  const instance = ky.create({
    credentials: 'include',
    prefixUrl: process.env['API_URL'] || '/',
    timeout: 10000,
    headers: {
      'Cache-Control': 'public, max-age=300',
    },
    cache: 'default',
  });

  return instance;
};

export const apiClient = createKyInstance();
