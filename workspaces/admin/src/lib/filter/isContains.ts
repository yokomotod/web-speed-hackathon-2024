const collator = new Intl.Collator('ja', { collation: 'ducet', sensitivity: 'accent' });

// パフォーマンス向上のため正規化された文字列をキャッシュ
const normalizedCache = new Map<string, string>();

type Params = {
  query: string;
  target: string;
};

// 文字列を正規化してキャッシュ
function getNormalizedString(str: string): string {
  if (normalizedCache.has(str)) {
    return normalizedCache.get(str)!;
  }
  
  const normalized = str.normalize('NFKC').toLowerCase();
  normalizedCache.set(str, normalized);
  return normalized;
}

// ひらがな・カタカナ・半角・全角を区別せずに文字列が含まれているかを調べる
export function isContains({ query, target }: Params): boolean {
  // 空文字列チェック
  if (!query.trim()) {
    return true;
  }
  
  // 正規化された文字列で高速比較
  const normalizedQuery = getNormalizedString(query);
  const normalizedTarget = getNormalizedString(target);
  
  // 基本的な文字列検索を先に試行
  if (normalizedTarget.includes(normalizedQuery)) {
    return true;
  }
  
  // フォールバック: 元の厳密な比較（必要な場合のみ）
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
  // target の最後まで query が含まれていなかったら false を返す
  return false;
}
