const collator = new Intl.Collator('ja', { collation: 'ducet', sensitivity: 'accent' });

// パフォーマンス向上のため正規化された文字列をキャッシュ（LRUキャッシュ）
const normalizedCache = new Map<string, string>();
const MAX_CACHE_SIZE = 1000;

type Params = {
  query: string;
  target: string;
};

// 文字列を正規化してキャッシュ（LRU方式）
function getNormalizedString(str: string): string {
  if (normalizedCache.has(str)) {
    // LRU: アクセスされたアイテムを最後に移動
    const value = normalizedCache.get(str)!;
    normalizedCache.delete(str);
    normalizedCache.set(str, value);
    return value;
  }
  
  const normalized = str.normalize('NFKC').toLowerCase();
  
  // キャッシュサイズ制限
  if (normalizedCache.size >= MAX_CACHE_SIZE) {
    // 最も古いアイテムを削除
    const firstKey = normalizedCache.keys().next().value;
    normalizedCache.delete(firstKey);
  }
  
  normalizedCache.set(str, normalized);
  return normalized;
}

// ひらがな・カタカナ・半角・全角を区別せずに文字列が含まれているかを調べる
export function isContains({ query, target }: Params): boolean {
  // 空文字列チェック
  if (!query.trim()) {
    return true;
  }
  
  // 長すぎる検索語は処理しない（パフォーマンス保護）
  if (query.length > 50) {
    return false;
  }
  
  // 正規化された文字列で高速比較
  const normalizedQuery = getNormalizedString(query);
  const normalizedTarget = getNormalizedString(target);
  
  // 基本的な文字列検索を先に試行
  if (normalizedTarget.includes(normalizedQuery)) {
    return true;
  }
  
  // フォールバック: 特殊文字を含む場合のみ厳密比較
  // 基本的な正規化で見つからない場合のみ実行
  if (/[ァ-ヴー]|[ぁ-んー]|[々〇〻]/.test(query)) {
    TARGET_LOOP: for (let offset = 0; offset <= target.length - query.length; offset++) {
      for (let idx = 0; idx < query.length; idx++) {
        // 1文字ずつ Unicode Collation Algorithm で比較する
        if (collator.compare(target[offset + idx]!, query[idx]!) !== 0) {
          continue TARGET_LOOP;
        }
      }
      // query のすべての文字が含まれていたら true を返す
      return true;
    }
  }
  
  // target の最後まで query が含まれていなかったら false を返す
  return false;
}
