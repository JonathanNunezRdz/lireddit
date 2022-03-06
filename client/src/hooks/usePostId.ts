const usePostId = (query: string | string[] | undefined) => {
	if (typeof query === 'string') return parseInt(query);
	return -1;
};

export default usePostId;
