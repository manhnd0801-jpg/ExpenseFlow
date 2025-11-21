
// This is a sample migration - actual migrations will be generated based on entities
export class InitialMigration1700000000000 {
  name = 'InitialMigration1700000000000';

  public async up(queryRunner: any): Promise<void> {
    // Create users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "email" varchar(255) NOT NULL UNIQUE,
        "password" varchar(255) NOT NULL,
        "firstName" varchar(100) NOT NULL,
        "lastName" varchar(100) NOT NULL,
        "avatar" varchar(255),
        "status" smallint NOT NULL DEFAULT 1,
        "defaultCurrency" smallint NOT NULL DEFAULT 1,
        "language" varchar(10) NOT NULL DEFAULT 'vi',
        "timezone" varchar(50),
        "emailVerified" boolean NOT NULL DEFAULT false,
        "emailVerificationToken" varchar(255),
        "passwordResetToken" varchar(255),
        "passwordResetExpires" timestamp,
        "lastLoginAt" timestamp,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        "deleted_at" timestamp
      )
    `);

    // Create accounts table
    await queryRunner.query(`
      CREATE TABLE "accounts" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "name" varchar(255) NOT NULL,
        "type" smallint NOT NULL,
        "balance" decimal(15,2) NOT NULL DEFAULT 0,
        "currency" smallint NOT NULL DEFAULT 1,
        "bankName" varchar(255),
        "accountNumber" varchar(50),
        "description" text,
        "color" varchar(7),
        "icon" varchar(50),
        "isActive" boolean NOT NULL DEFAULT true,
        "includeInTotal" boolean NOT NULL DEFAULT true,
        "creditLimit" decimal(15,2),
        "interestRate" decimal(5,2),
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        "deleted_at" timestamp,
        FOREIGN KEY ("user_id") REFERENCES "users"("id")
      )
    `);

    // Create categories table
    await queryRunner.query(`
      CREATE TABLE "categories" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" uuid,
        "parent_id" uuid,
        "name" varchar(255) NOT NULL,
        "type" smallint NOT NULL,
        "description" text,
        "color" varchar(7),
        "icon" varchar(50),
        "isDefault" boolean NOT NULL DEFAULT false,
        "isActive" boolean NOT NULL DEFAULT true,
        "sortOrder" integer NOT NULL DEFAULT 0,
        "keywords" json,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        "deleted_at" timestamp,
        FOREIGN KEY ("user_id") REFERENCES "users"("id"),
        FOREIGN KEY ("parent_id") REFERENCES "categories"("id")
      )
    `);

    // Add more tables as needed...
    // This is a sample structure - actual migrations will be generated from entities
  }

  public async down(queryRunner: any): Promise<void> {
    await queryRunner.query(`DROP TABLE "categories"`);
    await queryRunner.query(`DROP TABLE "accounts"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}