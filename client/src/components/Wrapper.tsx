import { Box } from '@chakra-ui/react';
import { FC } from 'react';

const MaxWidth = {
	sm: '400px',
	md: '800px',
	lg: '1200px',
	xl: '100%',
};

export type WrapperVariant = 'sm' | 'md' | 'lg' | 'xl';

interface WrapperProps {
	variant?: WrapperVariant;
}

const Wrapper: FC<WrapperProps> = ({ children, variant = 'sm' }) => {
	return (
		<Box maxW={MaxWidth[variant]} w='100%' mt={8} mx='auto'>
			{children}
		</Box>
	);
};

export default Wrapper;
