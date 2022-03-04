import {
	FormControl,
	FormErrorMessage,
	FormLabel,
	Textarea,
} from '@chakra-ui/react';
import { useField } from 'formik';
import { FC, InputHTMLAttributes } from 'react';

interface TextAreaFieldProps extends InputHTMLAttributes<HTMLTextAreaElement> {
	name: string;
	label: string;
}

const TextareaField: FC<TextAreaFieldProps> = ({
	label,
	size: _,
	...props
}) => {
	const [field, { error }] = useField(props);
	return (
		<FormControl isInvalid={!!error}>
			<FormLabel htmlFor={field.name}>{label}</FormLabel>
			<Textarea
				{...field}
				{...props}
				id={field.name}
				placeholder={props.placeholder}
			/>
			{error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
		</FormControl>
	);
};

export default TextareaField;
