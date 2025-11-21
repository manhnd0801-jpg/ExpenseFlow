import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Transactions (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let testAccountId: string;
  let testCategoryId: string;
  let testTransactionId: string;
  let transferSourceId: string;
  let transferDestId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Register and login
    const registerDto = {
      email: `transaction_test_${Date.now()}@example.com`,
      password: 'Test@123456',
      firstName: 'Transaction',
      lastName: 'Test',
    };

    const registerRes = await request(app.getHttpServer()).post('/auth/register').send(registerDto);

    authToken = registerRes.body.data.accessToken;

    // Create test account
    const accountRes = await request(app.getHttpServer())
      .post('/accounts')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Test Wallet',
        type: 1,
        balance: 5000000,
        currency: 1,
      });
    testAccountId = accountRes.body.data.id;

    // Create transfer destination account
    const destAccountRes = await request(app.getHttpServer())
      .post('/accounts')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Savings Account',
        type: 2,
        balance: 1000000,
        currency: 1,
      });
    transferDestId = destAccountRes.body.data.id;
    transferSourceId = testAccountId;

    // Create test category
    const categoryRes = await request(app.getHttpServer())
      .post('/categories')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Test Expense',
        type: 2, // EXPENSE
      });
    testCategoryId = categoryRes.body.data.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/transactions (POST) - INCOME', () => {
    it('should create income transaction and increase account balance', async () => {
      const createDto = {
        type: 1, // INCOME
        amount: 1000000,
        accountId: testAccountId,
        categoryId: testCategoryId,
        description: 'Salary',
        transactionDate: new Date().toISOString(),
      };

      const res = await request(app.getHttpServer())
        .post('/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createDto)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.amount).toBe(createDto.amount);
      expect(res.body.data.type).toBe(1);

      testTransactionId = res.body.data.id;

      // Verify account balance increased
      const accountRes = await request(app.getHttpServer())
        .get(`/accounts/${testAccountId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(accountRes.body.data.balance).toBe(6000000); // 5000000 + 1000000
    });
  });

  describe('/transactions (POST) - EXPENSE', () => {
    it('should create expense transaction and decrease account balance', async () => {
      const createDto = {
        type: 2, // EXPENSE
        amount: 500000,
        accountId: testAccountId,
        categoryId: testCategoryId,
        description: 'Shopping',
        transactionDate: new Date().toISOString(),
      };

      const res = await request(app.getHttpServer())
        .post('/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createDto)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.amount).toBe(createDto.amount);
      expect(res.body.data.type).toBe(2);

      // Verify account balance decreased
      const accountRes = await request(app.getHttpServer())
        .get(`/accounts/${testAccountId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(accountRes.body.data.balance).toBe(5500000); // 6000000 - 500000
    });

    it('should fail when expense exceeds account balance', () => {
      return request(app.getHttpServer())
        .post('/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 2,
          amount: 10000000, // More than balance
          accountId: testAccountId,
          categoryId: testCategoryId,
        })
        .expect(400);
    });
  });

  describe('/transactions (POST) - TRANSFER', () => {
    it('should create transfer between accounts', async () => {
      const createDto = {
        type: 3, // TRANSFER
        amount: 1000000,
        accountId: transferSourceId,
        toAccountId: transferDestId,
        description: 'Move to savings',
        transactionDate: new Date().toISOString(),
      };

      const res = await request(app.getHttpServer())
        .post('/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createDto)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.type).toBe(3);

      // Verify source decreased
      const sourceRes = await request(app.getHttpServer())
        .get(`/accounts/${transferSourceId}`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(sourceRes.body.data.balance).toBe(4500000); // 5500000 - 1000000

      // Verify destination increased
      const destRes = await request(app.getHttpServer())
        .get(`/accounts/${transferDestId}`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(destRes.body.data.balance).toBe(2000000); // 1000000 + 1000000
    });
  });

  describe('/transactions (GET)', () => {
    it('should get all transactions', () => {
      return request(app.getHttpServer())
        .get('/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.data.length).toBeGreaterThan(0);
        });
    });

    it('should filter transactions by type', () => {
      return request(app.getHttpServer())
        .get('/transactions?type=1') // INCOME only
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          res.body.data.forEach((txn: any) => {
            expect(txn.type).toBe(1);
          });
        });
    });

    it('should filter transactions by account', () => {
      return request(app.getHttpServer())
        .get(`/transactions?accountId=${testAccountId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          res.body.data.forEach((txn: any) => {
            expect(txn.accountId).toBe(testAccountId);
          });
        });
    });
  });

  describe('/transactions/:id (GET)', () => {
    it('should get transaction by id', () => {
      return request(app.getHttpServer())
        .get(`/transactions/${testTransactionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.id).toBe(testTransactionId);
        });
    });
  });

  describe('/transactions/:id (PATCH)', () => {
    it('should update transaction successfully', () => {
      return request(app.getHttpServer())
        .patch(`/transactions/${testTransactionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Updated salary description',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.description).toBe('Updated salary description');
        });
    });
  });

  describe('/transactions/:id (DELETE)', () => {
    it('should delete transaction and revert account balance', async () => {
      // Get current balance before delete
      const beforeRes = await request(app.getHttpServer())
        .get(`/accounts/${testAccountId}`)
        .set('Authorization', `Bearer ${authToken}`);
      const balanceBefore = beforeRes.body.data.balance;

      // Delete income transaction (should decrease balance by transaction amount)
      await request(app.getHttpServer())
        .delete(`/transactions/${testTransactionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Verify transaction is deleted
      await request(app.getHttpServer())
        .get(`/transactions/${testTransactionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      // Verify balance reverted
      const afterRes = await request(app.getHttpServer())
        .get(`/accounts/${testAccountId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(afterRes.body.data.balance).toBeLessThan(balanceBefore);
    });
  });

  describe('/transactions/summary (GET)', () => {
    it('should get transaction summary', () => {
      const startDate = new Date();
      startDate.setDate(1); // First day of month
      const endDate = new Date();

      return request(app.getHttpServer())
        .get(`/transactions/summary?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('totalIncome');
          expect(res.body.data).toHaveProperty('totalExpense');
          expect(res.body.data).toHaveProperty('balance');
        });
    });
  });
});
