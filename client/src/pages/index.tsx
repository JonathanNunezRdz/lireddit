import {
	Box,
	Button,
	Flex,
	Heading,
	Link,
	Spinner,
	Stack,
	Text,
	useColorModeValue,
} from '@chakra-ui/react';
import { withUrqlClient } from 'next-urql';
import NextLink from 'next/link';
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import Layout from '../components/Layout';
import PostActions from '../components/PostActions';
import UpdootSection from '../components/UpdootSection';
import { usePostsQuery } from '../generated/graphql';
import createUrqlClient from '../utils/createUrlClient';

interface indexProps {}

interface VariablesState {
	limit: number;
	cursor: string | null;
}

const Index: FC<indexProps> = ({}) => {
	const endRef = useRef<HTMLDivElement>(null);
	const bg = useColorModeValue('white', 'gray.900');
	const [applyScroll, setApplyScroll] = useState(0);
	const scrollToBottom = useCallback(() => {
		endRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, []);
	const [variables, setVariables] = useState<VariablesState>({
		limit: 2,
		cursor: null,
	});
	const [{ data, fetching, error }] = usePostsQuery({
		variables,
	});

	useEffect(() => {
		if (applyScroll === 1 && data) {
			scrollToBottom();
		} else if (applyScroll > 1) {
			setApplyScroll((prev) => prev - 1);
		}
	}, [scrollToBottom, applyScroll, data]);

	if (!fetching && !data)
		return (
			<Layout variant='md'>
				<Box m='auto'>{error?.message}</Box>
			</Layout>
		);
	return (
		<Layout variant='md'>
			{!data && fetching ? (
				<Box m='auto'>
					<Spinner size='lg' />
				</Box>
			) : (
				<Stack spacing={8} mb={8}>
					{data!.posts.posts.map((p) => {
						if (!p) return null;
						return (
							<Flex
								key={p.id}
								p={5}
								shadow='md'
								borderWidth='1px'
								rounded={'lg'}
								bg={bg}
							>
								<UpdootSection post={p} />
								<Box flex={1}>
									<NextLink href='/post/[id]' as={`/post/${p.id}`}>
										<Link>
											<Heading fontSize='xl'>{p.title}</Heading>
										</Link>
									</NextLink>
									<Text>posted by {p.creator.username}</Text>

									<Text mt={4}>{p.textSnippet}</Text>
								</Box>
								<PostActions postId={p.id} creatorId={p.creator.id} />
							</Flex>
						);
					})}
				</Stack>
			)}
			{data && data.posts.hasMore ? (
				<Flex>
					<Button
						isLoading={fetching}
						m={'auto'}
						mb={8}
						colorScheme='teal'
						onClick={() => {
							setVariables((prev) => ({
								limit: prev.limit,
								cursor: data.posts.posts[data.posts.posts.length - 1].createdAt,
							}));
							setApplyScroll(2);
						}}
					>
						Load more
					</Button>
				</Flex>
			) : null}
			<div ref={endRef} />
		</Layout>
	);
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
