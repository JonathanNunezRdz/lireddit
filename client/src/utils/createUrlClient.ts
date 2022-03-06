import { Cache, cacheExchange, Resolver } from '@urql/exchange-graphcache';
import gql from 'graphql-tag';
import Router from 'next/router';
import { dedupExchange, Exchange, fetchExchange, stringifyVariables } from 'urql';
import { pipe, tap } from 'wonka';
import {
	DeletePostMutationVariables,
	LoginMutation,
	LogoutMutation,
	MeDocument,
	MeQuery,
	RegisterMutation,
	VoteMutationVariables,
} from '../generated/graphql';
import betterUpdateQuery from './betterUpdateQuery';
import isServer from './isServer';

const errorExchange: Exchange =
	({ forward }) =>
	(ops$) => {
		return pipe(
			forward(ops$),
			tap(({ error }) => {
				if (error) {
					if (error?.message.includes('not authenticated')) {
						Router.replace('/login');
					}
				}
			})
		);
	};

export const cursorPagination = (): Resolver<any, any, any> => {
	return (_parent, fieldArgs, cache, info) => {
		const { parentKey: entityKey, fieldName } = info;
		const allFields = cache.inspectFields(entityKey);
		const fieldInfos = allFields.filter((info) => info.fieldName === fieldName);
		const size = fieldInfos.length;
		if (size === 0) {
			return undefined;
		}

		const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;
		const isInCacheKey = cache.resolve(entityKey, fieldKey) as string;
		const isInCache = cache.resolve(isInCacheKey, 'posts');
		info.partial = !isInCache;

		let hasMore = true;
		const results: string[] = [];
		fieldInfos.forEach((fi) => {
			const key = cache.resolve(entityKey, fi.fieldKey) as string;
			const data = cache.resolve(key, 'posts') as string[];
			const _hasMore = cache.resolve(key, 'hasMore') as boolean;
			if (!_hasMore) hasMore = _hasMore;
			results.push(...data);
		});

		const returnObj = {
			hasMore,
			posts: results,
			__typename: 'PaginatedPosts',
		};

		return returnObj;
	};
};

const invalidateAllPosts = (cache: Cache) => {
	const allFields = cache.inspectFields('Query');
	const allFieldNames = allFields.filter((info) => info.fieldName === 'posts');
	allFieldNames.forEach((fi) => {
		cache.invalidate('Query', 'posts', fi.arguments);
	});
};

const createUrqlClient = (ssrExchange: any, ctx: any) => {
	let cookie = '';
	if (isServer()) cookie = ctx?.req?.headers?.cookie;

	return {
		url: 'http://localhost:4000/graphql',
		fetchOptions: {
			credentials: 'include' as const,
			headers: cookie ? { cookie } : undefined,
		},
		exchanges: [
			dedupExchange,
			cacheExchange({
				keys: {
					PaginatedPosts: () => null,
				},
				resolvers: {
					Query: {
						posts: cursorPagination(),
					},
				},
				updates: {
					Mutation: {
						deletePost: (_result, variables, cache, _info) => {
							const { id } = variables as DeletePostMutationVariables;
							cache.invalidate({ __typename: 'Post', id });
						},
						vote: (_result, variables, cache, _info) => {
							const { postId, value } = variables as VoteMutationVariables;
							const data = cache.readFragment(
								gql`
									fragment _ on Post {
										id
										points
										voteStatus
									}
								`,
								{ id: postId } as any
							);

							if (data) {
								if (data.voteStatus === value) return;
								const newPoints =
									(data.points as number) + (!data.voteStatus ? 1 : 2) * value;
								cache.writeFragment(
									gql`
										fragment __ on Post {
											points
											voteStatus
										}
									`,
									{ id: postId, points: newPoints, voteStatus: value }
								);
							}
						},
						createPost: (_result, _variables, cache, _info) => {
							invalidateAllPosts(cache);
						},
						logout: (result, _variables, cache, _info) => {
							betterUpdateQuery<LogoutMutation, MeQuery>(
								cache,
								{ query: MeDocument },
								result,
								() => ({ me: null })
							);
						},
						login: (result, _variables, cache, _info) => {
							betterUpdateQuery<LoginMutation, MeQuery>(
								cache,
								{ query: MeDocument },
								result,
								(mutationResult, query) => {
									if (mutationResult.login.errors) return query;
									else
										return {
											me: mutationResult.login.user,
										};
								}
							);
							invalidateAllPosts(cache);
						},
						register: (result, _variables, cache, _info) => {
							betterUpdateQuery<RegisterMutation, MeQuery>(
								cache,
								{ query: MeDocument },
								result,
								(mutationResult, query) => {
									if (mutationResult.register.errors) return query;
									else
										return {
											me: mutationResult.register.user,
										};
								}
							);
						},
					},
				},
			}),
			errorExchange,
			ssrExchange,
			fetchExchange,
		],
	};
};

export default createUrqlClient;
