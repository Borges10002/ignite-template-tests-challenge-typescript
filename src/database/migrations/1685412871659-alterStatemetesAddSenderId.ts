import { MigrationInterface, QueryRunner } from "typeorm";

export class alterStatemetesAddSenderId1673914233555
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "statements" ADD COLUMN sender_id varchar`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "statements" DROP COLUMN sender_id`);
  }
}
