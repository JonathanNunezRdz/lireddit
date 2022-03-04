import { Box, Button, Flex, Link } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { withUrqlClient } from 'next-urql';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { FC } from 'react';
import InputField from '../components/InputField';
import Wrapper from '../components/Wrapper';
import { useLoginMutation } from '../generated/graphql';
import createUrqlClient from '../utils/createUrlClient';
import toErrorMap from '../utils/toErrorMap';

interface registerProps {}

const Login: FC<registerProps> = ({}) => {
	const router = useRouter();
	const [, login] = useLoginMutation();
	return (
		<Wrapper variant='sm'>
			<Formik
				initialValues={{ usernameOrEmail: '', password: '' }}
				onSubmit={async (values, { setErrors }) => {
					const res = await login(values);
					if (res.data?.login.errors)
						setErrors(toErrorMap(res.data.login.errors));
					else if (res.data?.login.user) {
						if (typeof router.query.next === 'string')
							router.push(router.query.next);
						else router.push('/');
					}
				}}
			>
				{({ isSubmitting }) => (
					<Form>
						<InputField
							name='usernameOrEmail'
							placeholder='username or email'
							label='Username or Email'
						/>

						<Box my={4}>
							<InputField
								name='password'
								placeholder='password'
								label='Password'
								type='password'
							/>
						</Box>
						<Flex>
							<Box my={4}>
								<NextLink href={'/forgot-password'}>
									<Link ml='auto'>Forgot password?</Link>
								</NextLink>
							</Box>
						</Flex>
						<Button
							type='submit'
							colorScheme='teal'
							isLoading={isSubmitting}
						>
							Login
						</Button>
					</Form>
				)}
			</Formik>
		</Wrapper>
	);
};

export default withUrqlClient(createUrqlClient)(Login);
