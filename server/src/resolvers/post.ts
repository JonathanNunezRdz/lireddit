import {
	Arg,
	Ctx,
	Field,
	FieldResolver,
	InputType,
	Int,
	Mutation,
	ObjectType,
	Query,
	Resolver,
	Root,
	UseMiddleware,
} from 'type-graphql';
import { getConnection } from 'typeorm';
import Post from '../entities/Post';
import isAuth from '../middleware/isAuth';
import { MyContext } from '../types';

@InputType()
class PostInput {
	@Field()
	title: string;

	@Field()
	text: string;
}

@ObjectType()
class PaginatedPosts {
	@Field(() => [Post])
	posts: Post[];

	@Field()
	hasMore: boolean;
}

@Resolver(Post)
class PostResolver {
	@FieldResolver(() => String)
	textSnippet(@Root() root: Post) {
		return root.text.slice(0, 100);
	}

	@Mutation(() => Boolean)
	@UseMiddleware(isAuth)
	async vote(
		@Arg('postId', () => Int!) postId: number,
		@Arg('value', () => Int!) value: number,
		@Ctx()
		{ req, userRepository, postRepository, updootRepository }: MyContext
	): Promise<boolean> {
		const isUpdoot = value !== -1;
		const realValue = isUpdoot ? 1 : -1;
		const { userId } = req.session;

		const user = await userRepository.findOneOrFail(userId);
		const post = await postRepository.findOneOrFail(postId);
		const updoot = await updootRepository.findOne({
			userId,
			postId,
		});

		// user has voted but will change their vote
		if (updoot && updoot.value !== realValue) {
			try {
				updoot.value = realValue;
				await updoot.save();
				post.points += 2 * realValue;
				await post.save();
				return true;
			} catch (error) {
				return false;
			}
		}

		// user will cancel their vote
		// if (updoot && updoot.value === realValue) {
		// 	await updootRepository.delete({ userId, postId });
		// 	post.points -= realValue;
		// 	await post.save();
		// 	return true;
		// }

		// user hasnt voted
		if (!updoot) {
			try {
				await updootRepository.insert({
					user,
					post,
					value: realValue,
				});
			} catch (error) {
				return false;
			}

			post.points += realValue;
			await post.save();
			return true;
		}

		return false;

		// const complete = await getManager().transaction<boolean>(
		// 	async (em) => {
		// 		const userRepo = em.getRepository(User);
		// 		const postRepo = em.getRepository(Post);
		// 		const updootRepo = em.getRepository(Updoot);

		// 		const user = await userRepo.findOneOrFail(
		// 			userId
		// 		);
		// 		const post = await postRepo.findOneOrFail(
		// 			postId
		// 		);

		// 		try {
		// 			await updootRepo.insert({
		// 				user,
		// 				post,
		// 				value: realValue,
		// 			});
		// 		} catch (error) {
		// 			return false;
		// 		}

		// 		await postRepo.increment(
		// 			{
		// 				id: postId,
		// 			},
		// 			'points',
		// 			realValue
		// 		);

		// 		return true;
		// 	}
		// );
	}

	@Query(() => PaginatedPosts)
	async posts(
		@Arg('limit', () => Int!) limit: number,
		@Arg('cursor', () => String, { nullable: true })
		cursor: string | null,
		@Ctx() { req }: MyContext
	): Promise<PaginatedPosts> {
		const realLimit = Math.min(50, limit);
		const realLimitPlusOne = realLimit + 1;

		// console.log('request', req);
		// NA1w7zuWNYeldpj1smq_-HOtd7NQIMpP
		// kMOZJDWCd2VW2m1rZ_DLQ4PVCabu3bJo

		const replacements: any[] = [realLimitPlusOne];

		if (req.session.userId) replacements.push(req.session.userId);
		if (cursor) replacements.push(cursor);

		const posts = await getConnection().query(
			`
			SELECT p.*,
			json_build_object(
				'id', u.id,
				'email', u.email,
				'username', u.username,
				'createdAt', u."createdAt",
				'updatedAt', u."updatedAt"
			) creator,
			${
				req.session.userId
					? '(SELECT value FROM updoot WHERE "userId" = $2 AND "postId" = p.id) "voteStatus"'
					: 'null as "voteStatus"'
			}
			FROM post p
			INNER JOIN public.user u ON u.id = p."creatorId"
			${cursor ? `WHERE p."createdAt" < $${req.session.userId ? '3' : '2'}` : ''}
			ORDER BY p."createdAt" DESC
			LIMIT $1
		`,
			replacements
		);

		// const qb = getRepository(Post)
		// 	.createQueryBuilder('p')
		// 	// .innerJoinAndSelect(
		// 	// 	'p.creator',
		// 	// 	'u',
		// 	// 	'u.id = p."creatorId"'
		// 	// )
		// 	.orderBy('p."createdAt"', 'DESC')
		// 	.take(realLimitPlusOne);

		// if (cursor) qb.where('p."createdAt" < :cursor', { cursor });
		// const posts = await qb.getMany();

		// const posts = await postRepository.find({
		// 	where: {
		// 		createdAt: LessThan(
		// 			cursor || new Date().toISOString()
		// 		),
		// 	},
		// 	order: { createdAt: 'DESC' },
		// 	take: realLimitPlusOne,
		// 	relations: ['creator', 'updoots'],
		// });

		const sendPosts = posts.slice(0, realLimit).map((post: Post) => {
			return {
				...post,
				creator: {
					...post.creator,
					createdAt: new Date(post.creator.createdAt),
					updatedAt: new Date(post.creator.updatedAt),
				},
			};
		});

		return {
			posts: sendPosts,
			hasMore: posts.length === realLimitPlusOne,
		};
	}

	@Query(() => Post, { nullable: true })
	post(
		@Arg('id') id: number,
		@Ctx() { postRepository }: MyContext
	): Promise<Post> {
		return postRepository.findOneOrFail(id);
	}

	@Mutation(() => Post)
	@UseMiddleware(isAuth)
	async createPost(
		@Arg('input') input: PostInput,
		@Ctx() { req, postRepository, userRepository }: MyContext
	): Promise<Post> {
		const creator = await userRepository.findOneOrFail(req.session.userId);

		const post = await postRepository
			.create({
				...input,
				creator,
			})
			.save();

		return post;
	}

	@Mutation(() => Post, { nullable: true })
	async updatePost(
		@Arg('id') id: number,
		@Arg('title', { nullable: true }) title: string,
		@Ctx() { postRepository }: MyContext
	): Promise<Post | null> {
		const post = await postRepository.findOneOrFail(id);
		if (typeof title === 'undefined') return null;
		post.title = title;
		await post.save();
		return post;
	}

	@Mutation(() => Boolean)
	async deletePost(
		@Arg('id') id: number,
		@Ctx() { postRepository }: MyContext
	): Promise<boolean> {
		await postRepository.delete(id);
		return true;
	}
}

export default PostResolver;
