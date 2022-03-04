import { Flex, Box, Button, Link } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import { withUrqlClient } from 'next-urql';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { FC, useState } from 'react';
import InputField from '../../components/InputField';
import Wrapper from '../../components/Wrapper';
import { useChangePasswordMutation } from '../../generated/graphql';
import createUrqlClient from '../../utils/createUrlClient';
import toErrorMap from '../../utils/toErrorMap';

interface ChangePasswordProps {}

const ChangePassword: FC<ChangePasswordProps> = ({}) => {
	const router = useRouter();
	const [, changePassword] = useChangePasswordMutation();
	const [tokenError, setTokenError] = useState('');
	return (
		<Wrapper>
			<Formik
				initialValues={{ newPassword: '' }}
				onSubmit={async ({ newPassword }, { setErrors }) => {
					const res = await changePassword({
						newPassword,
						token:
							typeof router.query.token === 'string'
								? router.query.token
								: '',
					});
					if (res.data?.changePassword.errors) {
						const errorMap = toErrorMap(
							res.data.changePassword.errors
						);
						if ('token' in errorMap) setTokenError(errorMap.token);
						else setErrors(errorMap);
					} else if (res.data?.changePassword.user) {
						router.push('/');
					}
				}}
			>
				{({ isSubmitting }) => (
					<Form>
						<InputField
							name='newPassword'
							placeholder='new password'
							label='New Password'
							type='password'
						/>
						{tokenError ? (
							<Flex>
								<Box mr={2} color={'red'}>
									{tokenError}
								</Box>
								<NextLink href={'/forgot-password'}>
									<Link>Get new one</Link>
								</NextLink>
							</Flex>
						) : null}
						<Box mt={4}>
							<Button
								type='submit'
								colorScheme='teal'
								isLoading={isSubmitting}
							>
								Change Password
							</Button>
						</Box>
					</Form>
				)}
			</Formik>
		</Wrapper>
	);
};

export default withUrqlClient(createUrqlClient)(ChangePassword);
