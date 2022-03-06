import { ChevronUpIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { Flex, IconButton } from '@chakra-ui/react';
import { FC, useState } from 'react';
import { PostSnippetFragment, useVoteMutation } from '../generated/graphql';

type LoadingState = 'updoot-loading' | 'downdoot-loading' | 'not-loading';

interface UpdootSectionProps {
	post: PostSnippetFragment;
}

const UpdootSection: FC<UpdootSectionProps> = ({ post }) => {
	const [loading, setLoading] = useState<LoadingState>('not-loading');
	const [, vote] = useVoteMutation();

	const handleVote = async (value: number, loadingType: LoadingState) => {
		if (post.voteStatus === value) return;
		setLoading(loadingType);
		await vote({
			postId: post.id,
			value,
		});
		setLoading('not-loading');
	};

	return (
		<Flex direction={'column'} alignItems={'center'} justifyContent={'center'} mr={4}>
			<IconButton
				aria-label='Updoot post'
				icon={<ChevronUpIcon />}
				onClick={() => handleVote(1, 'updoot-loading')}
				isLoading={loading === 'updoot-loading'}
				colorScheme={post.voteStatus === 1 ? 'green' : undefined}
			/>
			{post.points}
			<IconButton
				aria-label='Downdoot post'
				icon={<ChevronDownIcon />}
				onClick={() => handleVote(-1, 'downdoot-loading')}
				isLoading={loading === 'downdoot-loading'}
				colorScheme={post.voteStatus === -1 ? 'red' : undefined}
			/>
		</Flex>
	);
};

export default UpdootSection;
