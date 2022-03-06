import { Box, Button, Flex, Heading, Link, Spinner } from '@chakra-ui/react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { FC } from 'react';
import { useLogoutMutation, useMeQuery } from '../generated/graphql';
import ColorModeSwitcher from './ColorModeSwitcher';

interface NavBarProps {}

const NavBar: FC<NavBarProps> = ({}) => {
	const router = useRouter();
	const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
	const [{ data, fetching }] = useMeQuery();
	let body = null;

	// data is loading
	if (fetching) {
		body = <Spinner />;

		// user not logged in
	} else if (!data?.me) {
		body = (
			<>
				<NextLink href='/login' passHref>
					<Button as={Link} mr={4}>
						Login
					</Button>
				</NextLink>
				<NextLink href='/register' passHref>
					<Button as={Link} mr={2}>
						Register
					</Button>
				</NextLink>
			</>
		);

		// user is logged in
	} else {
		body = (
			<Flex justifyContent='center' alignItems='center'>
				<Box mr={4}>{data.me.username}</Box>
				<NextLink href='/create-post' passHref>
					<Button as={Link} mr={4}>
						Create Post
					</Button>
				</NextLink>
				<Button
					mr={2}
					onClick={async () => {
						await logout();
						router.reload();
					}}
					isLoading={logoutFetching}
				>
					Logout
				</Button>
			</Flex>
		);
	}
	return (
		<Flex zIndex={1} position={'sticky'} top={0} bg='teal.500' p={4}>
			<Flex flex={1} maxWidth={800} justifyContent='center' alignItems='center' m='auto'>
				<NextLink href='/' passHref>
					<Link>
						<Heading>Lireddit</Heading>
					</Link>
				</NextLink>
				<Box ml='auto'>{body}</Box>
				<ColorModeSwitcher />
			</Flex>
		</Flex>
	);
};

export default NavBar;
