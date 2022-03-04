import { Request, Response } from 'express';
import { Redis } from 'ioredis';
import { Repository } from 'typeorm';
import Post from './entities/Post';
import Updoot from './entities/Updoot';
import User from './entities/User';

export type MyContext = {
	req: Request;
	res: Response;
	redis: Redis;
	postRepository: Repository<Post>;
	userRepository: Repository<User>;
	updootRepository: Repository<Updoot>;
};
