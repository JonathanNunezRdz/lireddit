import { Box, Button, Flex, Link, Spinner } from '@chakra-ui/react';
import { FC } from 'react';
import NextLink from 'next/link';
import { useLogoutMutation, useMeQuery } from '../generated/graphql';
import isServer from '../utils/isServer';
import ColorModeSwitcher from './ColorModeSwitcher';

interface NavBarProps {}

const NavBar: FC<NavBarProps> = ({}) => {
	const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
	const [{ data, fetching }] = useMeQuery({ pause: isServer() });
	let body = null;

	// data is loading
	if (fetching) {
		body = <Spinner />;
		// user not logged in
	} else if (!data?.me) {
		body = (
			<>
				<NextLink href='/login'>
					<Link mr={4}>Login</Link>
				</NextLink>
				<NextLink href='/register'>
					<Link>Register</Link>
				</NextLink>
			</>
		);
		// user is logged in
	} else {
		body = (
			<Flex>
				<Box mr={4}>{data.me.username}</Box>
				<Button
					onClick={() => {
						logout();
					}}
					isLoading={logoutFetching}
					variant={'link'}
					color='black'
				>
					Logout
				</Button>
			</Flex>
		);
	}
	return (
		<Flex
			zIndex={1}
			position={'sticky'}
			top={0}
			bg='teal.500'
			p={4}
			justifyContent='center'
			alignItems='center'
		>
			<Box ml='auto'>{body}</Box>
			<ColorModeSwitcher />
		</Flex>
	);
};

export default NavBar;
