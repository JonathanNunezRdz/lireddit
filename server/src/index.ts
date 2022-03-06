import {
	ApolloServerPluginDrainHttpServer,
	ApolloServerPluginLandingPageGraphQLPlayground,
} from 'apollo-server-core';
import { ApolloServer } from 'apollo-server-express';
import connectRedis from 'connect-redis';
import cors from 'cors';
import express from 'express';
import session from 'express-session';
import { createServer } from 'http';
import Redis from 'ioredis';
import { join } from 'path';
import 'reflect-metadata';
import { buildSchema } from 'type-graphql';
import { createConnection, getRepository } from 'typeorm';
import { COOKIE_NAME, __prod__ } from './constants';
import Post from './entities/Post';
import Updoot from './entities/Updoot';
import User from './entities/User';
import HelloResolver from './resolvers/hello';
import PostResolver from './resolvers/post';
import UserResolver from './resolvers/user';
import { MyContext } from './types';
import createUpdootLoader from './utils/createUpdootLoader';
import createUserLoader from './utils/createUserLoader';

declare module 'express-session' {
	interface SessionData {
		userId: number;
	}
}

const main = async () => {
	await createConnection({
		type: 'postgres',
		database: 'lireddit2',
		username: 'postgres',
		password: '1793',
		logging: true,
		synchronize: true,
		entities: [Post, User, Updoot],
		migrations: [join(__dirname, './migrations/*')],
	});
	// await conn.runMigrations();
	// await Post.delete({});

	const app = express();

	const RedisStore = connectRedis(session);
	const redis = new Redis();

	// redisClient.connect()
	// await redisClient.connect().catch(console.error);
	app.use(
		cors({
			origin: 'http://localhost:3000',
			credentials: true,
		})
	);
	app.use(
		session({
			name: COOKIE_NAME,
			store: new RedisStore({
				client: redis,
				disableTouch: true,
			}),
			cookie: {
				maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
				httpOnly: true,
				secure: __prod__, // cookie only works in https when in production
				sameSite: 'lax', // csrf
			},
			secret: 'aksdjyfbtaksjdfhgbkgajwehf',
			resave: false,
			saveUninitialized: false,
		})
	);

	const postRepository = getRepository(Post);
	const userRepository = getRepository(User);
	const updootRepository = getRepository(Updoot);

	const httpServer = createServer(app);
	const apolloServer = new ApolloServer({
		schema: await buildSchema({
			resolvers: [HelloResolver, PostResolver, UserResolver],
			validate: false,
		}),
		plugins: [
			ApolloServerPluginDrainHttpServer({ httpServer }),
			ApolloServerPluginLandingPageGraphQLPlayground(),
		],
		context: ({ req, res }): MyContext => ({
			req,
			res,
			redis,
			postRepository,
			userRepository,
			updootRepository,
			userLoader: createUserLoader(userRepository),
			updootLoader: createUpdootLoader(updootRepository),
		}),
	});
	await apolloServer.start();
	apolloServer.applyMiddleware({ app, cors: false });
	await new Promise<void>((resolve) =>
		httpServer.listen({ port: 4000 }, resolve)
	);
	console.log(
		`🚀 Server ready at http://localhost:4000${apolloServer.graphqlPath}`
	);

	// const postRepository = orm.em.getRepository(Post);
	// const post = postRepository.create({
	// 	title: 'yes',
	// });
	// await postRepository.persistAndFlush(post);

	// const posts = await postRepository.find({});
	// console.log(posts);
};

main().catch((error) => console.error(error));
