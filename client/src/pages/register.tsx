import { Box, Button } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import { FC } from 'react';
import InputField from '../components/InputField';
import Wrapper from '../components/Wrapper';
import { useRegisterMutation } from '../generated/graphql';
import createUrqlClient from '../utils/createUrlClient';
import toErrorMap from '../utils/toErrorMap';

interface RegisterProps {}

const Register: FC<RegisterProps> = ({}) => {
	const router = useRouter();
	const [, register] = useRegisterMutation();
	return (
		<Wrapper variant='sm'>
			<Formik
				initialValues={{ email: '', username: '', password: '' }}
				onSubmit={async (values, { setErrors }) => {
					const res = await register({ options: values });
					if (res.data?.register.errors)
						setErrors(toErrorMap(res.data.register.errors));
					else if (res.data?.register.user) {
						router.push('/');
					}
				}}
			>
				{({ isSubmitting }) => (
					<Form>
						<InputField
							name='username'
							placeholder='username'
							label='Username'
							autoFocus
						/>
						<Box mt={4}>
							<InputField
								name='email'
								placeholder='email'
								label='Email'
							/>
						</Box>
						<Box my={4}>
							<InputField
								name='password'
								placeholder='password'
								label='Password'
								type='password'
							/>
						</Box>
						<Button
							type='submit'
							colorScheme='teal'
							isLoading={isSubmitting}
						>
							Register
						</Button>
					</Form>
				)}
			</Formik>
		</Wrapper>
	);
};

export default withUrqlClient(createUrqlClient)(Register);
