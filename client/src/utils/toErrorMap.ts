import { FieldError } from '../generated/graphql';

const toErrorMap = (errors: FieldError[]) => {
	const errorMap: Record<string, string> = {};
	errors.forEach(({ field, message }) => {
		errorMap[field] = `⚠ ${message}`;
	});

	return errorMap;
};

export default toErrorMap;
