import { Box, Button } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { withUrqlClient } from 'next-urql';
import { FC, useState } from 'react';
import InputField from '../components/InputField';
import Wrapper from '../components/Wrapper';
import { useForgotPasswordMutation } from '../generated/graphql';
import createUrqlClient from '../utils/createUrlClient';

interface ForgotPasswordProps {}

const ForgotPassword: FC<ForgotPasswordProps> = ({}) => {
	const [, forgotPassword] = useForgotPasswordMutation();
	const [complete, setComplete] = useState(false);
	return (
		<Wrapper variant='sm'>
			<Formik
				initialValues={{ email: '' }}
				onSubmit={async (values) => {
					await forgotPassword(values);
					setComplete(true);
				}}
			>
				{({ isSubmitting }) =>
					complete ? (
						<Box>
							Instructions sent to the email address provided.
						</Box>
					) : (
						<Form>
							<InputField
								name='email'
								placeholder='email'
								label='Email'
								type='email'
							/>
							<Button
								mt={4}
								type='submit'
								colorScheme='teal'
								isLoading={isSubmitting}
							>
								Forgot Password
							</Button>
						</Form>
					)
				}
			</Formik>
		</Wrapper>
	);
};

export default withUrqlClient(createUrqlClient)(ForgotPassword);
