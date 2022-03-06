import { Box, Button, Heading, Spinner, useColorModeValue } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import { FC } from 'react';
import InputField from '../../../components/InputField';
import Layout from '../../../components/Layout';
import { usePostQuery, useUpdatePostMutation } from '../../../generated/graphql';
import createUrqlClient from '../../../utils/createUrlClient';
import usePostId from '../../../hooks/usePostId';

interface EditPostProps {}

const EditPost: FC<EditPostProps> = ({}) => {
	const router = useRouter();
	const postId = usePostId(router.query.id);
	const [{ data, fetching, error }] = usePostQuery({
		pause: postId === -1,
		variables: { id: postId },
	});
	const [, updatePost] = useUpdatePostMutation();
	const bg = useColorModeValue('white', 'gray.900');
	if (fetching)
		return (
			<Layout variant='md'>
				<Spinner />
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
			<Formik
				initialValues={{ title: data.post.title, text: data.post.text }}
				onSubmit={async (values) => {
					const { error } = await updatePost({
						id: postId,
						...values,
					});
					if (!error) router.back();
				}}
			>
				{({ isSubmitting }) => (
					<Form>
						<Box p={5} shadow='md' borderWidth='1px' rounded={'lg'} bg={bg}>
							<InputField name='title' placeholder='title' label='Title' autoFocus />

							<Box my={4}>
								<InputField textarea name='text' placeholder='text' label='Text' />
							</Box>
							<Button mr={4} onClick={router.back}>
								Cancel
							</Button>
							<Button type='submit' colorScheme='teal' isLoading={isSubmitting}>
								Update
							</Button>
						</Box>
					</Form>
				)}
			</Formik>
		</Layout>
	);
};

export default withUrqlClient(createUrqlClient)(EditPost);
