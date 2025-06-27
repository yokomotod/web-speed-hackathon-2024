// キャッシュ用のMapを用意
const normalizeCache = new Map<string, string>();

type Params = {
  query: string;
  target: string;
};

// 文字列を正規化（ひらがな・カタカナ・半角・全角を統一）
function normalizeString(str: string): string {
  if (normalizeCache.has(str)) {
    return normalizeCache.get(str)!;
  }

  const normalized = str
    .toLowerCase()
    .normalize('NFKC') // 全角半角、濁点半濁点を統一
    .replace(/[\u3041-\u3096]/g, (match) => {
      // ひらがなをカタカナに変換
      return String.fromCharCode(match.charCodeAt(0) + 0x60);
    });

  // キャッシュサイズ制限
  if (normalizeCache.size > 1000) {
    const firstKey = normalizeCache.keys().next().value;
    normalizeCache.delete(firstKey);
  }
  
  normalizeCache.set(str, normalized);
  return normalized;
}

// ひらがな・カタカナ・半角・全角を区別せずに文字列が含まれているかを調べる
export function isContains({ query, target }: Params): boolean {
  if (!query.trim()) return true;
  if (!target.trim()) return false;

  const normalizedQuery = normalizeString(query);
  const normalizedTarget = normalizeString(target);
  return normalizedTarget.includes(normalizedQuery);
}
