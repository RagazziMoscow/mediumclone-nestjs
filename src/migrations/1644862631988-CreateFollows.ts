import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateFollows1644862631988 implements MigrationInterface {
    name = 'CreateFollows1644862631988'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "follows " ("id" SERIAL NOT NULL, "followerId" integer NOT NULL, "followingId" integer NOT NULL, CONSTRAINT "PK_e2d4268230a367a1d2ea5d4c2c7" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "follows "`);
    }

}
