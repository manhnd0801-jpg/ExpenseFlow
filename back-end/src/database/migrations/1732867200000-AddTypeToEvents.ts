import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddTypeToEvents1732867200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'events',
      new TableColumn({
        name: 'type',
        type: 'smallint',
        isNullable: true,
        comment: '1=Personal, 2=Family, 3=Travel, 4=Business, 5=Other',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('events', 'type');
  }
}
