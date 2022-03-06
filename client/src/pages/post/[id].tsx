import { Box, Flex, Heading, Text, useColorModeValue } from '@chakra-ui/react';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import { FC } from 'react';
import Layout from '../../components/Layout';
import PostActions from '../../components/PostActions';
import UpdootSection from '../../components/UpdootSection';
import { usePostQuery } from '../../generated/graphql';
import usePostId from '../../hooks/usePostId';
import createUrqlClient from '../../utils/createUrlClient';

interface PostProps {}

const Post: FC<PostProps> = ({}) => {
	const router = useRouter();
	const postId = usePostId(router.query.id);
	const [{ data, fetching, error }] = usePostQuery({
		pause: postId === -1,
		variables: { id: postId },
	});
	const bg = useColorModeValue('white', 'gray.900');
	if (fetching)
		return (
			<Layout variant='md'>
				<Box p={4}>Loading...</Box>
			</Layout>
		);

	if (error)
		return (
			<Layout variant='md'>
				<Heading>{error.message}</Heading>
			</Layout>
		);

	if (!data?.post)
		return (
			<Layout variant='md'>
				<Heading>Couldn't find your post {':('}</Heading>
			</Layout>
		);

	return (
		<Layout variant='md'>
			<Flex p={5} shadow='md' borderWidth='1px' rounded={'lg'} bg={bg}>
				<UpdootSection post={data.post} />
				<Box flex={1}>
					<Heading>{data.post.title}</Heading>
					<Text>posted by {data.post.creator.username}</Text>
					<Text mt={4}>{data.post.text}</Text>
				</Box>
				<PostActions postId={data.post.id} creatorId={data.post.creator.id} />
			</Flex>
		</Layout>
	);
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Post);
