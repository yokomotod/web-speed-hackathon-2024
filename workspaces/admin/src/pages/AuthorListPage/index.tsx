import {
  Button,
  Divider,
  Flex,
  Input,
  Radio,
  RadioGroup,
  Spacer,
  Stack,
  StackItem,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import { useFormik } from 'formik';
import { useId, useMemo, useState } from 'react';

import { useAuthorList } from '../../features/authors/hooks/useAuthorList';
import { isContains } from '../../lib/filter/isContains';
import { useDebounce } from '../../lib/hooks/useDebounce';

import { AuthorDetailModal } from './internal/AuthorDetailModal';
import { CreateAuthorModal } from './internal/CreateAuthorModal';

const AuthorSearchKind = {
  AuthorId: 'AuthorId',
  AuthorName: 'AuthorName',
} as const;
type AuthorSearchKind = (typeof AuthorSearchKind)[keyof typeof AuthorSearchKind];

const AuthorModalMode = {
  Create: 'Create',
  Detail: 'Detail',
  None: 'None',
} as const;
type AuthorModalMode = (typeof AuthorModalMode)[keyof typeof AuthorModalMode];

type AuthorModalState =
  | {
      mode: typeof AuthorModalMode.None;
      params: object;
    }
  | {
      mode: typeof AuthorModalMode.Detail;
      params: { authorId: string };
    }
  | {
      mode: typeof AuthorModalMode.Create;
      params: object;
    };

export const AuthorListPage: React.FC = () => {
  const { data: authorList = [] } = useAuthorList();
  const authorListA11yId = useId();

  const formik = useFormik({
    initialValues: {
      kind: AuthorSearchKind.AuthorId as AuthorSearchKind,
      query: '',
    },
    onSubmit() {},
  });

  // 検索クエリをデバウンス処理（300ms）
  const debouncedQuery = useDebounce(formik.values.query, 300);

  const filteredAuthorList = useMemo(() => {
    if (debouncedQuery === '') {
      return authorList;
    }

    switch (formik.values.kind) {
      case AuthorSearchKind.AuthorId: {
        return authorList.filter((author) => author.id === debouncedQuery);
      }
      case AuthorSearchKind.AuthorName: {
        return authorList.filter((author) => {
          return isContains({ query: debouncedQuery, target: author.name });
        });
      }
      default: {
        formik.values.kind satisfies never;
        return authorList;
      }
    }
  }, [formik.values.kind, debouncedQuery, authorList]);

  const [modal, setModal] = useState<AuthorModalState>({
    mode: AuthorModalMode.None,
    params: {},
  });

  return (
    <>
      <Stack height="100%" p={4} spacing={6}>
        <StackItem aria-label="検索セクション" as="section">
          <RadioGroup name="kind" value={formik.values.kind}>
            <Stack direction="row" spacing={4}>
              <Radio
                color="gray.400"
                colorScheme="teal"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={AuthorSearchKind.AuthorId}
              >
                作者 ID
              </Radio>
              <Radio
                color="gray.400"
                colorScheme="teal"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={AuthorSearchKind.AuthorName}
              >
                作者名
              </Radio>
            </Stack>
          </RadioGroup>

          <Spacer height={2} />

          <Flex gap={2}>
            <Input
              borderColor="gray.400"
              name="query"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              placeholder="条件を入力"
            />
          </Flex>
        </StackItem>

        <Divider />

        <StackItem
          aria-labelledby={authorListA11yId}
          as="section"
          display="flex"
          flexBasis={0}
          flexDirection="column"
          flexGrow={1}
          flexShrink={1}
          overflow="hidden"
        >
          <Flex align="center" justify="space-between">
            <Text as="h2" fontSize="xl" fontWeight="bold" id={authorListA11yId}>
              作者一覧
            </Text>
            <Button
              colorScheme="teal"
              onClick={() => setModal({ mode: AuthorModalMode.Create, params: {} })}
              variant="solid"
            >
              作者を追加
            </Button>
          </Flex>
          <TableContainer flexGrow={1} flexShrink={1} overflowY="auto">
            <Table variant="striped">
              <Thead backgroundColor="white" position="sticky" top={0} zIndex={1}>
                <Tr>
                  <Th w={120}></Th>
                  <Th>作者名</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredAuthorList.map((author) => (
                  <Tr key={author.id}>
                    <Td textAlign="center" verticalAlign="middle">
                      <Button
                        colorScheme="teal"
                        onClick={() => setModal({ mode: AuthorModalMode.Detail, params: { authorId: author.id } })}
                        variant="solid"
                      >
                        詳細
                      </Button>
                    </Td>
                    <Td verticalAlign="middle">
                      <Text fontWeight="bold">{author.name}</Text>
                      <Text color="gray.400" fontSize="small">
                        {author.id}
                      </Text>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </StackItem>
      </Stack>

      {modal.mode === AuthorModalMode.Detail ? (
        <AuthorDetailModal
          isOpen
          authorId={modal.params.authorId}
          onClose={() => setModal({ mode: AuthorModalMode.None, params: {} })}
        />
      ) : null}
      {modal.mode === AuthorModalMode.Create ? (
        <CreateAuthorModal isOpen onClose={() => setModal({ mode: AuthorModalMode.None, params: {} })} />
      ) : null}
    </>
  );
};
