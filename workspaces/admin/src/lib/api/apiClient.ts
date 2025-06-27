import ky from 'ky';

const createKyInstance = () => {
  const instance = ky.create({
    credentials: 'include',
    prefixUrl: process.env['API_URL'] || '/',
    timeout: 15000, // タイムアウトを延長
    headers: {
      'Cache-Control': 'public, max-age=300',
      // 管理画面での効率化のための追加ヘッダー
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    cache: 'default',
    retry: {
      // ネットワークエラー時の再試行設定
      limit: 2,
      methods: ['get'],
      statusCodes: [408, 413, 429, 500, 502, 503, 504],
    },
    hooks: {
      beforeRequest: [
        (request) => {
          // GETリクエストのキャッシュ最適化
          if (request.method === 'GET') {
            request.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');
          }
        }
      ],
      afterResponse: [
        (request, options, response) => {
          // レスポンス時間をログ（開発環境のみ）
          if (process.env.NODE_ENV === 'development') {
            console.log(`API ${request.method} ${request.url} - ${response.status}`);
          }
          return response;
        }
      ]
    }
  });

  return instance;
};

export const apiClient = createKyInstance();
