import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 一般的なデータは5分間キャッシュ
      staleTime: 5 * 60 * 1000,
      // キャッシュは10分間保持
      gcTime: 10 * 60 * 1000,
      // エラー時は3回まで再試行
      retry: 3,
      // 再試行間隔
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // フォーカス時の自動再取得を無効（管理画面では不要）
      refetchOnWindowFocus: false,
    },
    mutations: {
      // ミューテーション実行中はクエリを無効化しない
      networkMode: 'always',
    },
  },
  queryCache: new QueryCache({
    onError: (error, query) => {
      console.error('Query error:', error, 'Query key:', query.queryKey);
    },
  }),
  mutationCache: new MutationCache({
    onError: (err) => {
      console.error('Mutation error:', err);
    },
  }),
});
