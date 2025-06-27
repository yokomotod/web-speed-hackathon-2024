import { useState, useCallback } from 'react';

export const useTerm = () => {
  const [term, setTerm] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTerm = useCallback(async () => {
    if (term) return term; // 既にロード済みの場合はキャッシュを返す
    
    setIsLoading(true);
    setError(null);
    
    try {
      // 軽量な利用規約テキストを返す
      const lightTerm = `
利用規約

1. 本サービスの利用について
本サービスをご利用いただくにあたり、以下の利用規約をお読みください。

2. 禁止事項
- 法令に違反する行為
- 他のユーザーに迷惑をかける行為
- システムに負荷をかける行為

3. 免責事項
本サービスの利用により生じた損害について、当社は一切の責任を負いません。

4. 規約の変更
本規約は予告なく変更される場合があります。

最終更新日: 2024年6月27日
      `.trim();
      
      setTerm(lightTerm);
      return lightTerm;
    } catch (err) {
      setError('利用規約の読み込みに失敗しました');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [term]);

  return { term, isLoading, error, loadTerm };
};