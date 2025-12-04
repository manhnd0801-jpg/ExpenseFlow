import * as dotenv from 'dotenv';
import { join } from 'path';
import { DataSource } from 'typeorm';

// Load environment variables
dotenv.config({ path: join(__dirname, '../../.env') });

async function roundAmounts() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME || 'expense_user',
    password: process.env.DB_PASSWORD || 'expense_password',
    database: process.env.DB_DATABASE || 'expenseflow',
  });

  try {
    await dataSource.initialize();
    console.log('Database connected successfully');

    const queries = [
      // Round transaction amounts
      `UPDATE transactions SET amount = ROUND(amount) WHERE amount != ROUND(amount)`,

      // Round account balances
      `UPDATE accounts SET balance = ROUND(balance) WHERE balance != ROUND(balance)`,

      // Round loan amounts
      `UPDATE loans SET 
        "originalAmount" = ROUND("originalAmount"),
        "remainingPrincipal" = ROUND("remainingPrincipal"),
        "monthlyPayment" = ROUND("monthlyPayment"),
        "totalInterestPaid" = ROUND("totalInterestPaid"),
        "totalPrincipalPaid" = ROUND("totalPrincipalPaid"),
        "totalPrepayment" = ROUND("totalPrepayment")
      WHERE 
        "originalAmount" != ROUND("originalAmount") OR
        "remainingPrincipal" != ROUND("remainingPrincipal") OR
        "monthlyPayment" != ROUND("monthlyPayment") OR
        "totalInterestPaid" != ROUND("totalInterestPaid") OR
        "totalPrincipalPaid" != ROUND("totalPrincipalPaid") OR
        "totalPrepayment" != ROUND("totalPrepayment")`,

      // Round loan payment amounts
      `UPDATE loan_payments SET 
        amount = ROUND(amount),
        "principalAmount" = ROUND("principalAmount"),
        "interestAmount" = ROUND("interestAmount")
      WHERE 
        amount != ROUND(amount) OR
        "principalAmount" != ROUND("principalAmount") OR
        "interestAmount" != ROUND("interestAmount")`,

      // Round goal amounts
      `UPDATE goals SET 
        "targetAmount" = ROUND("targetAmount"),
        "currentAmount" = ROUND("currentAmount")
      WHERE 
        "targetAmount" != ROUND("targetAmount") OR
        "currentAmount" != ROUND("currentAmount")`,

      // Round goal transaction amounts
      `UPDATE goal_transactions SET amount = ROUND(amount) WHERE amount != ROUND(amount)`,

      // Round budget amounts
      `UPDATE budgets SET 
        amount = ROUND(amount),
        spent = ROUND(spent)
      WHERE 
        amount != ROUND(amount) OR
        spent != ROUND(spent)`,

      // Round recurring transaction amounts
      `UPDATE recurring_transactions SET amount = ROUND(amount) WHERE amount != ROUND(amount)`,
    ];

    for (const query of queries) {
      const result = await dataSource.query(query);
      console.log(`Executed: ${query.substring(0, 50)}... - Affected rows: ${result[1] || 0}`);
    }

    console.log('\n✅ All amounts have been rounded successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await dataSource.destroy();
  }
}

roundAmounts();
