import { FormControl, FormErrorMessage, FormLabel, Input, Textarea } from '@chakra-ui/react';
import { useField } from 'formik';
import { FC, InputHTMLAttributes } from 'react';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
	name: string;
	label: string;
	textarea?: boolean;
}

const InputField: FC<InputFieldProps> = ({ textarea, label, size: _, ...props }) => {
	const [field, { error }] = useField(props);
	const fieldOptions = { ...field } as any;
	return (
		<FormControl isInvalid={!!error}>
			<FormLabel htmlFor={field.name}>{label}</FormLabel>
			{textarea ? (
				<Textarea
					{...fieldOptions}
					{...props}
					id={field.name}
					placeholder={props.placeholder}
					resize='vertical'
					minBlockSize={'10rem'}
				/>
			) : (
				<Input {...field} {...props} id={field.name} placeholder={props.placeholder} />
			)}
			{error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
		</FormControl>
	);
};

export default InputField;
