import { MigrationInterface, QueryRunner } from 'typeorm';

export class MockPosts1645988661333 implements MigrationInterface {
	public async up(_queryRunner: QueryRunner): Promise<void> {}

	public async down(_queryRunner: QueryRunner): Promise<void> {}
}
