import {
	Box,
	Button,
	Flex,
	Heading,
	Link,
	Stack,
	Text,
} from '@chakra-ui/react';
import { withUrqlClient } from 'next-urql';
import NextLink from 'next/link';
import { FC, useCallback, useEffect, useRef, useState } from 'react';

import Layout from '../components/Layout';
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
	const [applyScroll, setApplyScroll] = useState(0);
	const scrollToBottom = useCallback(() => {
		endRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, []);
	const [variables, setVariables] = useState<VariablesState>({
		limit: 2,
		cursor: null,
	});

	const [{ data, fetching }] = usePostsQuery({
		variables,
	});

	useEffect(() => {
		if (applyScroll === 1 && data) {
			scrollToBottom();
		} else if (applyScroll > 1) {
			setApplyScroll((prev) => prev - 1);
		}
	}, [scrollToBottom, applyScroll, data]);

	if (!fetching && !data) return <Box>No data</Box>;
	return (
		<Layout variant='md'>
			<Flex alignItems={'center'}>
				<Heading>Lireddit</Heading>

				<NextLink href='/create-post'>
					<Link ml='auto'>Create Post</Link>
				</NextLink>
			</Flex>
			<br />
			{!data && fetching ? (
				<div>loading...</div>
			) : (
				<Stack spacing={8} mb={8}>
					{data!.posts.posts.map((p) => (
						<Flex
							key={p.id}
							p={5}
							shadow='md'
							borderWidth='1px'
							rounded={'lg'}
						>
							<UpdootSection post={p} />
							<Box>
								<Heading fontSize={'xl'}>{p.title}</Heading>
								<Text>posted by {p.creator.username}</Text>
								<Text mt={4}>{p.textSnippet}</Text>
							</Box>
						</Flex>
					))}
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
								cursor: data.posts.posts[
									data.posts.posts.length - 1
								].createdAt,
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
