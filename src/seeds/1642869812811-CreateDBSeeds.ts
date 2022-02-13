import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateDBSeeds1642869812811 implements MigrationInterface {
    name = 'CreateDBSeeds1642869812811';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
          `INSERT INTO tags (name) VALUES ('dragons'), ('nestjs'), ('vue')`
        );

        // NOTE: password is 'jakejake'
        await queryRunner.query(
          `INSERT INTO users (username, email, password) VALUES ('foo', 'foo@gmail.com', '$2b$10$p.CXFQOgDLcqNdHKAYFFGeWqcTo33LSTCTHNRSVZL0Zv7vrWDkFai')`
        );

        await queryRunner.query(
          `INSERT INTO articles (slug, title, description, body, "tagList", "authorId") 
          VALUES ('first-article', 'First article', 'first article desc', 'first article body', 'nestjs, vue', 1)`
        );

      await queryRunner.query(
        `INSERT INTO articles (slug, title, description, body, "tagList", "authorId") 
          VALUES ('second-article', 'Second article', 'second article desc', 'second article body', 'nestjs, vue', 1)`
      );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {}
}
