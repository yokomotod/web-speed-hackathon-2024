import { Suspense, useCallback, useId, useState, useEffect } from 'react';

import { useBookList } from '../../features/book/hooks/useBookList';
import { Box } from '../../foundation/components/Box';
import { Text } from '../../foundation/components/Text';
import { Color, Space, Typography } from '../../foundation/styles/variables';

import { Input } from './internal/Input';
import { SearchResult } from './internal/SearchResult';

const SearchPage: React.FC = () => {
  const { data: books } = useBookList({ query: {} });

  const searchResultsA11yId = useId();

  const [inputValue, setInputValue] = useState('');
  const [keyword, setKeyword] = useState('');

  // Debounce the search keyword
  useEffect(() => {
    const timer = setTimeout(() => {
      setKeyword(inputValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue]);

  const onChangedInput = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(event.target.value);
    },
    [setInputValue],
  );

  return (
    <Box px={Space * 2}>
      <Input onChange={onChangedInput} />
      <Box aria-labelledby={searchResultsA11yId} as="section" maxWidth="100%" py={Space * 2} width="100%">
        <Text color={Color.MONO_100} id={searchResultsA11yId} typography={Typography.NORMAL20} weight="bold">
          検索結果
        </Text>
        {keyword !== '' && <SearchResult books={books} keyword={keyword} />}
      </Box>
    </Box>
  );
};

const SearchPageWithSuspense: React.FC = () => {
  return (
    <Suspense fallback={null}>
      <SearchPage />
    </Suspense>
  );
};

export { SearchPageWithSuspense as SearchPage };
