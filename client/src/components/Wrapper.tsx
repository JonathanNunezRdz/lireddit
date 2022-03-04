import { Box } from '@chakra-ui/react';
import { FC } from 'react';

export type WrapperVariant = 'sm' | 'md';

interface WrapperProps {
	variant?: WrapperVariant;
}

const Wrapper: FC<WrapperProps> = ({ children, variant = 'sm' }) => {
	return (
		<Box
			maxW={variant === 'md' ? '800px' : '400px'}
			w='100%'
			mt={8}
			mx='auto'
		>
			{children}
		</Box>
	);
};

export default Wrapper;
