import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateInventory1795017979695 implements MigrationInterface {
    name = 'CreateInventory1795017979695'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "inventory_item" ("id" SERIAL NOT NULL, "playerId" integer NOT NULL, "itemId" integer NOT NULL, "quantity" integer NOT NULL DEFAULT '1', CONSTRAINT "UQ_dd87195513aad8d8b8ca6f0a27a" UNIQUE ("playerId", "itemId"), CONSTRAINT "PK_94f5cbcb5f280f2f30bd4a9fd90" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "inventory_item" ADD CONSTRAINT "FK_e3906cf9b752f41d8dd0eb77ac2" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "inventory_item" ADD CONSTRAINT "FK_21f08891af6b1afb9be05f27e3a" FOREIGN KEY ("itemId") REFERENCES "item"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "inventory_item" DROP CONSTRAINT "FK_21f08891af6b1afb9be05f27e3a"`);
        await queryRunner.query(`ALTER TABLE "inventory_item" DROP CONSTRAINT "FK_e3906cf9b752f41d8dd0eb77ac2"`);
        await queryRunner.query(`DROP TABLE "inventory_item"`);
    }

}
