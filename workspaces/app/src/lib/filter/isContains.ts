// Cache normalized strings to avoid repeated normalization
const normalizeCache = new Map<string, string>();

function normalizeString(str: string): string {
  if (normalizeCache.has(str)) {
    return normalizeCache.get(str)!;
  }
  
  // Normalize to katakana and lowercase for faster comparison
  const normalized = str
    .toLowerCase()
    .replace(/[\u3041-\u3096]/g, (char) => String.fromCharCode(char.charCodeAt(0) + 0x60)) // hiragana to katakana
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0xFEE0)); // full-width to half-width
  
  // Limit cache size to prevent memory leaks
  if (normalizeCache.size > 1000) {
    const firstKey = normalizeCache.keys().next().value;
    normalizeCache.delete(firstKey);
  }
  
  normalizeCache.set(str, normalized);
  return normalized;
}

type Params = {
  query: string;
  target: string;
};

// ひらがな・カタカナ・半角・全角を区別せずに文字列が含まれているかを調べる
export function isContains({ query, target }: Params): boolean {
  // Early return for empty query
  if (!query) return true;
  if (!target) return false;
  
  // Use normalized strings for faster comparison
  const normalizedTarget = normalizeString(target);
  const normalizedQuery = normalizeString(query);
  
  // Use built-in includes for better performance
  return normalizedTarget.includes(normalizedQuery);
}
