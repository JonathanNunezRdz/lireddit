import { Box, Button } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import { FC } from 'react';
import InputField from '../components/InputField';
import Layout from '../components/Layout';
import { useCreatePostMutation } from '../generated/graphql';
import useIsAuth from '../hooks/useIsAuth';
import createUrqlClient from '../utils/createUrlClient';

interface CreatePostProps {}

const CreatePost: FC<CreatePostProps> = ({}) => {
	useIsAuth();
	const router = useRouter();
	const [, createPost] = useCreatePostMutation();
	return (
		<Layout variant='md'>
			<Formik
				initialValues={{ title: '', text: '' }}
				onSubmit={async (values) => {
					const { error } = await createPost({ input: values });
					if (!error) router.push('/');
				}}
			>
				{({ isSubmitting }) => (
					<Form>
						<InputField name='title' placeholder='title' label='Title' autoFocus />

						<Box my={4}>
							{/* <TextareaField
								name='text'
								placeholder='text'
								label='Text'
							/> */}
							<InputField textarea name='text' placeholder='text' label='Text' />
						</Box>
						<Button mr={4} onClick={router.back}>
							Cancel
						</Button>
						<Button type='submit' colorScheme='teal' isLoading={isSubmitting}>
							Post
						</Button>
					</Form>
				)}
			</Formik>
		</Layout>
	);
};

export default withUrqlClient(createUrqlClient)(CreatePost);
