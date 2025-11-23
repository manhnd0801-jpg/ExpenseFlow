import { DataSource } from 'typeorm';
import { Account } from '../../entities/account.entity';
import { Budget } from '../../entities/budget.entity';
import { Category } from '../../entities/category.entity';
import { Goal } from '../../entities/goal.entity';
import { Transaction } from '../../entities/transaction.entity';
import { User } from '../../entities/user.entity';

/**
 * Seed sample data for testing
 * Run with: npm run seed
 */
export async function seedSampleData(dataSource: DataSource) {
  console.log('🌱 Seeding sample data...');

  const userRepo = dataSource.getRepository(User);
  const categoryRepo = dataSource.getRepository(Category);
  const accountRepo = dataSource.getRepository(Account);
  const transactionRepo = dataSource.getRepository(Transaction);
  const budgetRepo = dataSource.getRepository(Budget);
  const goalRepo = dataSource.getRepository(Goal);

  // Find test user (try multiple test accounts)
  let user = await userRepo.findOne({
    where: [{ email: 'demo@expenseflow.com' }, { email: 'test@expenseflow.com' }],
  });

  if (!user) {
    // Get any user as fallback
    user = await userRepo.findOne({ order: { createdAt: 'DESC' } });
  }

  if (!user) {
    console.log('❌ No user found. Please register a user first.');
    return;
  }

  console.log(`✅ Using user: ${user.email}`);

  // Get categories (including default ones)
  const categories = await categoryRepo.find();
  if (categories.length === 0) {
    console.log('❌ No categories found. Please create categories first.');
    return;
  }

  const foodCategory = categories.find((c) => c.name.includes('Ăn'));
  const transportCategory = categories.find((c) => c.name.includes('Di chuyển'));
  const entertainmentCategory = categories.find((c) => c.name.includes('Giải trí'));
  const shoppingCategory = categories.find((c) => c.name.includes('Mua sắm'));
  const salaryCategory = categories.find((c) => c.name.includes('Lương'));
  const incomeCategory = categories.find((c) => c.name.includes('Thu nhập'));

  // Create accounts
  console.log('Creating accounts...');
  const cashAccount = accountRepo.create({
    userId: user.id,
    name: 'Ví tiền mặt',
    type: 1, // Cash
    balance: 5000000,
    currency: 1, // VND
    description: 'Tiền mặt cá nhân',
  });

  const bankAccount = accountRepo.create({
    userId: user.id,
    name: 'Tài khoản Vietcombank',
    type: 2, // Bank
    balance: 50000000,
    currency: 1,
    description: 'Tài khoản ngân hàng chính',
  });

  const ewalletAccount = accountRepo.create({
    userId: user.id,
    name: 'Ví MoMo',
    type: 3, // E-wallet
    balance: 2000000,
    currency: 1,
    description: 'Ví điện tử MoMo',
  });

  await accountRepo.save([cashAccount, bankAccount, ewalletAccount]);
  console.log('✅ Created 3 accounts');

  // Create transactions
  console.log('Creating transactions...');
  const now = new Date();
  const transactions = [];

  // Income transactions
  transactions.push(
    transactionRepo.create({
      userId: user.id,
      accountId: bankAccount.id,
      categoryId: salaryCategory?.id,
      type: 1, // Income
      amount: 15000000,
      description: 'Lương tháng 11',
      date: new Date(now.getFullYear(), now.getMonth(), 1),
      note: 'Lương chính thức',
    }),
  );

  transactions.push(
    transactionRepo.create({
      userId: user.id,
      accountId: ewalletAccount.id,
      categoryId: incomeCategory?.id,
      type: 1,
      amount: 2000000,
      description: 'Thưởng dự án',
      date: new Date(now.getFullYear(), now.getMonth(), 5),
      note: 'Thưởng hoàn thành dự án Q3',
    }),
  );

  // Expense transactions - Food
  transactions.push(
    transactionRepo.create({
      userId: user.id,
      accountId: cashAccount.id,
      categoryId: foodCategory?.id,
      type: 2, // Expense
      amount: 150000,
      description: 'Ăn trưa với đồng nghiệp',
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1),
    }),
  );

  transactions.push(
    transactionRepo.create({
      userId: user.id,
      accountId: ewalletAccount.id,
      categoryId: foodCategory?.id,
      type: 2,
      amount: 250000,
      description: 'Đi chợ cuối tuần',
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2),
    }),
  );

  transactions.push(
    transactionRepo.create({
      userId: user.id,
      accountId: cashAccount.id,
      categoryId: foodCategory?.id,
      type: 2,
      amount: 80000,
      description: 'Cafe sáng',
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3),
    }),
  );

  // Transport
  transactions.push(
    transactionRepo.create({
      userId: user.id,
      accountId: ewalletAccount.id,
      categoryId: transportCategory?.id,
      type: 2,
      amount: 120000,
      description: 'Grab đi làm',
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1),
    }),
  );

  transactions.push(
    transactionRepo.create({
      userId: user.id,
      accountId: cashAccount.id,
      categoryId: transportCategory?.id,
      type: 2,
      amount: 500000,
      description: 'Đổ xăng xe máy',
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 4),
    }),
  );

  // Entertainment
  transactions.push(
    transactionRepo.create({
      userId: user.id,
      accountId: bankAccount.id,
      categoryId: entertainmentCategory?.id,
      type: 2,
      amount: 350000,
      description: 'Xem phim CGV',
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 5),
    }),
  );

  transactions.push(
    transactionRepo.create({
      userId: user.id,
      accountId: bankAccount.id,
      categoryId: entertainmentCategory?.id,
      type: 2,
      amount: 1200000,
      description: 'Du lịch cuối tuần',
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7),
    }),
  );

  // Shopping
  transactions.push(
    transactionRepo.create({
      userId: user.id,
      accountId: bankAccount.id,
      categoryId: shoppingCategory?.id,
      type: 2,
      amount: 450000,
      description: 'Mua quần áo',
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6),
    }),
  );

  await transactionRepo.save(transactions);
  console.log('✅ Created 10 transactions');

  // Create budgets
  console.log('Creating budgets...');
  const budgets = [];

  if (foodCategory) {
    budgets.push(
      budgetRepo.create({
        userId: user.id,
        categoryId: foodCategory.id,
        name: 'Ngân sách ăn uống tháng',
        amount: 5000000,
        period: 2, // Monthly
        startDate: new Date(now.getFullYear(), now.getMonth(), 1),
        endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0),
      }),
    );
  }

  if (transportCategory) {
    budgets.push(
      budgetRepo.create({
        userId: user.id,
        categoryId: transportCategory.id,
        name: 'Ngân sách di chuyển tháng',
        amount: 2000000,
        period: 2,
        startDate: new Date(now.getFullYear(), now.getMonth(), 1),
        endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0),
      }),
    );
  }

  if (entertainmentCategory) {
    budgets.push(
      budgetRepo.create({
        userId: user.id,
        categoryId: entertainmentCategory.id,
        name: 'Ngân sách giải trí tháng',
        amount: 3000000,
        period: 2,
        startDate: new Date(now.getFullYear(), now.getMonth(), 1),
        endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0),
      }),
    );
  }

  await budgetRepo.save(budgets);
  console.log('✅ Created 3 budgets');

  // Create goals
  console.log('Creating goals...');
  const goals = [];

  goals.push(
    goalRepo.create({
      userId: user.id,
      name: 'Mua laptop mới',
      targetAmount: 25000000,
      currentAmount: 5000000,
      targetDate: new Date(now.getFullYear(), now.getMonth() + 3, 1),
      status: 1, // Active
      priority: 1, // High
      description: 'Tiết kiệm để mua Macbook Pro',
    }),
  );

  goals.push(
    goalRepo.create({
      userId: user.id,
      name: 'Du lịch Đà Lạt',
      targetAmount: 10000000,
      currentAmount: 3000000,
      targetDate: new Date(now.getFullYear(), now.getMonth() + 2, 15),
      status: 1,
      priority: 2, // Medium
      description: 'Chuyến du lịch gia đình',
    }),
  );

  goals.push(
    goalRepo.create({
      userId: user.id,
      name: 'Quỹ khẩn cấp',
      targetAmount: 50000000,
      currentAmount: 15000000,
      targetDate: new Date(now.getFullYear() + 1, 0, 1),
      status: 1,
      priority: 1,
      description: 'Quỹ dự phòng 6 tháng chi tiêu',
    }),
  );

  await goalRepo.save(goals);
  console.log('✅ Created 3 goals');

  console.log('🎉 Sample data seeding completed!');
  console.log('📊 Summary:');
  console.log('  - 3 Accounts');
  console.log('  - 10 Transactions');
  console.log('  - 3 Budgets');
  console.log('  - 3 Goals');
}
