import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateItem1795013008837 implements MigrationInterface {
    name = 'CreateItem1795013008837'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "item" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "icon" character varying NOT NULL, "attack" integer NOT NULL, "price" integer NOT NULL, CONSTRAINT "PK_d3c0c71f23e7adcf952a1d13423" PRIMARY KEY ("id"))`);

        await queryRunner.query(`
            INSERT INTO "item" ("name", "icon", "attack", "price") VALUES
            ('Wooden Dagger', '🗡️', 1, 15),
            ('Iron Sword', '⚔️', 3, 40),
            ('Hunter Bow', '🏹', 4, 60),
            ('Battle Axe', '🪓', 5, 75),
            ('War Hammer', '🔨', 8, 130),
            ('Magic Wand', '🪄', 12, 200),
            ('Sea Trident', '🔱', 18, 320),
            ('Dragon Blade', '🔥', 30, 600)
            `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "item"`);
    }

}
