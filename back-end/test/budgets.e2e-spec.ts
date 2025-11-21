import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Budgets (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let testCategoryId: string;
  let testAccountId: string;
  let testBudgetId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Register and login
    const registerDto = {
      email: `budget_test_${Date.now()}@example.com`,
      password: 'Test@123456',
      firstName: 'Budget',
      lastName: 'Test',
    };

    const registerRes = await request(app.getHttpServer()).post('/auth/register').send(registerDto);

    authToken = registerRes.body.data.accessToken;

    // Create test account
    const accountRes = await request(app.getHttpServer())
      .post('/accounts')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Budget Test Wallet',
        type: 1,
        balance: 10000000,
        currency: 1,
      });
    testAccountId = accountRes.body.data.id;

    // Create test category
    const categoryRes = await request(app.getHttpServer())
      .post('/categories')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Food & Drink',
        type: 2, // EXPENSE
      });
    testCategoryId = categoryRes.body.data.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/budgets (POST)', () => {
    it('should create a new budget successfully', () => {
      const startDate = new Date();
      startDate.setDate(1); // First day of month
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setDate(0); // Last day of month

      const createDto = {
        name: 'Monthly Food Budget',
        amount: 5000000,
        categoryId: testCategoryId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        alertThreshold: 80,
        isActive: true,
      };

      return request(app.getHttpServer())
        .post('/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createDto)
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data.name).toBe(createDto.name);
          expect(res.body.data.amount).toBe(createDto.amount);
          expect(res.body.data.spent).toBe(0);
          expect(res.body.data.percentage).toBe(0);

          testBudgetId = res.body.data.id;
        });
    });

    it('should fail without auth token', () => {
      return request(app.getHttpServer()).post('/budgets').send({ name: 'Test Budget' }).expect(401);
    });

    it('should fail with invalid data', () => {
      return request(app.getHttpServer())
        .post('/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: '', // Empty name
          amount: -1000, // Negative amount
        })
        .expect(400);
    });
  });

  describe('/budgets (GET)', () => {
    it('should get all budgets', () => {
      return request(app.getHttpServer())
        .get('/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.data.length).toBeGreaterThan(0);
        });
    });

    it('should filter budgets by category', () => {
      return request(app.getHttpServer())
        .get(`/budgets?categoryId=${testCategoryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          res.body.data.forEach((budget: any) => {
            expect(budget.categoryId).toBe(testCategoryId);
          });
        });
    });

    it('should fail without auth token', () => {
      return request(app.getHttpServer()).get('/budgets').expect(401);
    });
  });

  describe('/budgets/:id (GET)', () => {
    it('should get budget by id', () => {
      return request(app.getHttpServer())
        .get(`/budgets/${testBudgetId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.id).toBe(testBudgetId);
        });
    });

    it('should return 404 for non-existent budget', () => {
      return request(app.getHttpServer())
        .get('/budgets/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('Budget spending tracking', () => {
    it('should update budget spent when creating expense transaction', async () => {
      // Create expense transaction
      await request(app.getHttpServer())
        .post('/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 2, // EXPENSE
          amount: 1000000,
          accountId: testAccountId,
          categoryId: testCategoryId,
          description: 'Restaurant',
          transactionDate: new Date().toISOString(),
        })
        .expect(201);

      // Get budget to check spent
      const budgetRes = await request(app.getHttpServer())
        .get(`/budgets/${testBudgetId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(budgetRes.body.data.spent).toBe(1000000);
      expect(budgetRes.body.data.percentage).toBe(20); // 1000000 / 5000000 * 100
    });

    it('should show warning when exceeding alert threshold', async () => {
      // Create more expenses to exceed 80% threshold
      await request(app.getHttpServer()).post('/transactions').set('Authorization', `Bearer ${authToken}`).send({
        type: 2,
        amount: 3000000, // Total will be 4000000 (80%)
        accountId: testAccountId,
        categoryId: testCategoryId,
        description: 'More food',
        transactionDate: new Date().toISOString(),
      });

      const budgetRes = await request(app.getHttpServer())
        .get(`/budgets/${testBudgetId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(budgetRes.body.data.percentage).toBeGreaterThanOrEqual(80);
    });
  });

  describe('/budgets/:id (PATCH)', () => {
    it('should update budget successfully', () => {
      return request(app.getHttpServer())
        .patch(`/budgets/${testBudgetId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Food Budget',
          amount: 6000000,
          alertThreshold: 90,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.name).toBe('Updated Food Budget');
          expect(res.body.data.amount).toBe(6000000);
          expect(res.body.data.alertThreshold).toBe(90);
        });
    });
  });

  describe('/budgets/:id (DELETE)', () => {
    it('should delete budget successfully', () => {
      return request(app.getHttpServer())
        .delete(`/budgets/${testBudgetId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
        });
    });

    it('should return 404 for already deleted budget', () => {
      return request(app.getHttpServer())
        .get(`/budgets/${testBudgetId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
