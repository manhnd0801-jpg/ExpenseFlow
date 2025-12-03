import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Update transaction.date column from DATE to TIMESTAMP
 * to support storing time along with date
 */
export class UpdateTransactionDateToTimestamp1732889000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Change column type from DATE to TIMESTAMP
    await queryRunner.query(`
      ALTER TABLE "transactions" 
      ALTER COLUMN "date" TYPE TIMESTAMP USING "date"::TIMESTAMP
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert back to DATE type (will lose time information)
    await queryRunner.query(`
      ALTER TABLE "transactions" 
      ALTER COLUMN "date" TYPE DATE USING "date"::DATE
    `);
  }
}
