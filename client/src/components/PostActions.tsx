import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { IconButton, Link, Stack } from '@chakra-ui/react';
import NextLink from 'next/link';
import { FC } from 'react';
import { useDeletePostMutation, useMeQuery } from '../generated/graphql';

interface PostActionsProps {
	postId: number;
	creatorId: number;
}

const PostActions: FC<PostActionsProps> = ({ postId, creatorId }) => {
	const [{ data: user }] = useMeQuery();
	const [, deletePost] = useDeletePostMutation();

	if (user?.me?.id !== creatorId) return null;

	return (
		<Stack>
			<NextLink href='/post/edit/[id]' as={`/post/edit/${postId}`} passHref>
				<IconButton as={Link} aria-label='Edit Post' icon={<EditIcon />} />
			</NextLink>
			<IconButton
				aria-label='Delete Post'
				icon={<DeleteIcon />}
				onClick={() => {
					deletePost({ id: postId });
				}}
			/>
		</Stack>
	);
};

export default PostActions;
