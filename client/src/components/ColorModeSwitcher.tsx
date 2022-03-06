import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import { IconButton, IconButtonProps, useColorMode, useColorModeValue } from '@chakra-ui/react';

type ColorModeSwitcherProps = Omit<IconButtonProps, 'aria-label'>;

const ColorModeSwitcher = (props: ColorModeSwitcherProps) => {
	const { toggleColorMode } = useColorMode();
	const text = useColorModeValue('dark', 'light');
	const SwitchIcon = useColorModeValue(MoonIcon, SunIcon);

	return (
		<IconButton
			size='md'
			fontSize='lg'
			// variant='ghost'
			color='current'
			ml='2'
			onClick={toggleColorMode}
			icon={<SwitchIcon />}
			aria-label={`Switch to ${text} mode`}
			{...props}
		/>
	);
};

export default ColorModeSwitcher;
