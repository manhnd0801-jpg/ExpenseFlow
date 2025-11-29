import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey } from 'typeorm';

export class AddGoalTransactionsSupport1732864000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Add goal_id column to transactions table
    await queryRunner.addColumn(
      'transactions',
      new TableColumn({
        name: 'goal_id',
        type: 'uuid',
        isNullable: true,
      }),
    );

    // Step 2: Create goal_transactions table
    await queryRunner.createTable(
      new Table({
        name: 'goal_transactions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'goal_id',
            type: 'uuid',
          },
          {
            name: 'account_id',
            type: 'uuid',
          },
          {
            name: 'transaction_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'amount',
            type: 'decimal',
            precision: 15,
            scale: 2,
          },
          {
            name: 'type',
            type: 'varchar',
            length: '50',
            comment: 'CONTRIBUTION or WITHDRAWAL',
          },
          {
            name: 'note',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Step 3: Add foreign keys for transactions.goal_id
    await queryRunner.createForeignKey(
      'transactions',
      new TableForeignKey({
        columnNames: ['goal_id'],
        referencedTableName: 'goals',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );

    // Step 4: Add foreign keys for goal_transactions
    await queryRunner.createForeignKey(
      'goal_transactions',
      new TableForeignKey({
        columnNames: ['goal_id'],
        referencedTableName: 'goals',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'goal_transactions',
      new TableForeignKey({
        columnNames: ['account_id'],
        referencedTableName: 'accounts',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'goal_transactions',
      new TableForeignKey({
        columnNames: ['transaction_id'],
        referencedTableName: 'transactions',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );

    // Step 5: Create indexes for better query performance
    await queryRunner.query(`
      CREATE INDEX "IDX_goal_transactions_goal_id" ON "goal_transactions" ("goal_id");
      CREATE INDEX "IDX_goal_transactions_account_id" ON "goal_transactions" ("account_id");
      CREATE INDEX "IDX_goal_transactions_transaction_id" ON "goal_transactions" ("transaction_id");
      CREATE INDEX "IDX_transactions_goal_id" ON "transactions" ("goal_id");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_transactions_goal_id";
      DROP INDEX IF EXISTS "IDX_goal_transactions_transaction_id";
      DROP INDEX IF EXISTS "IDX_goal_transactions_account_id";
      DROP INDEX IF EXISTS "IDX_goal_transactions_goal_id";
    `);

    // Drop foreign keys from goal_transactions
    const goalTransactionsTable = await queryRunner.getTable('goal_transactions');
    if (goalTransactionsTable) {
      const foreignKeys = goalTransactionsTable.foreignKeys;
      for (const fk of foreignKeys) {
        await queryRunner.dropForeignKey('goal_transactions', fk);
      }
    }

    // Drop goal_transactions table
    await queryRunner.dropTable('goal_transactions', true);

    // Drop foreign key from transactions.goal_id
    const transactionsTable = await queryRunner.getTable('transactions');
    if (transactionsTable) {
      const goalFk = transactionsTable.foreignKeys.find((fk) => fk.columnNames.includes('goal_id'));
      if (goalFk) {
        await queryRunner.dropForeignKey('transactions', goalFk);
      }
    }

    // Drop goal_id column from transactions
    await queryRunner.dropColumn('transactions', 'goal_id');
  }
}
