import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import Post from './Post';
import User from './User';

@Entity()
class Updoot extends BaseEntity {
	@Column({ type: 'int' })
	value: number;

	@PrimaryColumn()
	userId: number;

	@PrimaryColumn()
	postId: number;

	@ManyToOne(() => User, (user) => user.updoots)
	user: User;

	@ManyToOne(() => Post, (post) => post.updoots)
	post: Post;
}

export default Updoot;
