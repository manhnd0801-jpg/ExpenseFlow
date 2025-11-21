import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { AppModule } from '../src/app.module';
import { RecurringTransaction } from '../src/entities/recurring-transaction.entity';
import { User } from '../src/entities/user.entity';

describe('RecurringTransactions API (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let userId: string;
  let categoryId: string;
  let recurringId: string;
  let userRepository: Repository<User>;
  let recurringRepository: Repository<RecurringTransaction>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    userRepository = moduleFixture.get<Repository<User>>(getRepositoryToken(User));
    recurringRepository = moduleFixture.get<Repository<RecurringTransaction>>(getRepositoryToken(RecurringTransaction));

    // Create test user and login
    const testUser = {
      email: `test-recurring-${Date.now()}@example.com`,
      password: 'Test123456!',
      fullName: 'Test User Recurring',
    };

    const registerResponse = await request(app.getHttpServer()).post('/api/v1/auth/register').send(testUser);

    authToken = registerResponse.body.accessToken;
    userId = registerResponse.body.user.id;

    // Create a test category
    const categoryResponse = await request(app.getHttpServer())
      .post('/api/v1/categories')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Test Category',
        type: 2, // Expense
        icon: 'dollar',
        color: '#FF5733',
      });

    categoryId = categoryResponse.body.data.id;
  });

  afterAll(async () => {
    // Cleanup
    if (userId) {
      await recurringRepository.delete({ userId });
      await userRepository.delete({ id: userId });
    }
    await app.close();
  });

  describe('POST /api/v1/recurring-transactions', () => {
    it('should create monthly recurring transaction', () => {
      return request(app.getHttpServer())
        .post('/api/v1/recurring-transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Monthly Rent',
          description: 'Apartment rent payment',
          amount: 5000000, // 5M VND
          type: 2, // Expense
          frequency: 4, // Monthly
          categoryId: categoryId,
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          isActive: true,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data.name).toBe('Monthly Rent');
          expect(res.body.data.amount).toBe(5000000);
          expect(res.body.data.frequency).toBe(4); // Monthly
          expect(res.body.data.isActive).toBe(true);
          expect(res.body.data).toHaveProperty('nextExecutionDate');

          recurringId = res.body.data.id;
        });
    });

    it('should create daily recurring transaction', () => {
      return request(app.getHttpServer())
        .post('/api/v1/recurring-transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Daily Coffee',
          amount: 50000,
          type: 2, // Expense
          frequency: 2, // Daily
          categoryId: categoryId,
          startDate: '2024-01-01',
          isActive: true,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.data.frequency).toBe(2); // Daily
        });
    });

    it('should create yearly recurring transaction', () => {
      return request(app.getHttpServer())
        .post('/api/v1/recurring-transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Annual Insurance',
          amount: 12000000,
          type: 2, // Expense
          frequency: 6, // Yearly
          categoryId: categoryId,
          startDate: '2024-01-01',
          isActive: true,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.data.frequency).toBe(6); // Yearly
        });
    });

    it('should return 400 for invalid frequency', () => {
      return request(app.getHttpServer())
        .post('/api/v1/recurring-transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Invalid Recurring',
          amount: 100000,
          type: 2,
          frequency: 99, // Invalid frequency
          startDate: '2024-01-01',
        })
        .expect(400);
    });

    it('should return 401 without auth token', () => {
      return request(app.getHttpServer())
        .post('/api/v1/recurring-transactions')
        .send({
          name: 'Monthly Rent',
          amount: 5000000,
        })
        .expect(401);
    });
  });

  describe('GET /api/v1/recurring-transactions', () => {
    it('should get all recurring transactions', () => {
      return request(app.getHttpServer())
        .get('/api/v1/recurring-transactions?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.data.length).toBeGreaterThan(0);
        });
    });

    it('should filter by frequency type', () => {
      return request(app.getHttpServer())
        .get('/api/v1/recurring-transactions?frequency=4') // Monthly
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          const transactions = res.body.data;
          expect(transactions.every((t) => t.frequency === 4)).toBe(true);
        });
    });

    it('should filter by active status', () => {
      return request(app.getHttpServer())
        .get('/api/v1/recurring-transactions?isActive=true')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          const transactions = res.body.data;
          expect(transactions.every((t) => t.isActive === true)).toBe(true);
        });
    });
  });

  describe('GET /api/v1/recurring-transactions/:id', () => {
    it('should get recurring transaction by id', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/recurring-transactions/${recurringId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.id).toBe(recurringId);
          expect(res.body.data.name).toBe('Monthly Rent');
        });
    });

    it('should return 404 for non-existent recurring', () => {
      return request(app.getHttpServer())
        .get('/api/v1/recurring-transactions/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('GET /api/v1/recurring-transactions/due', () => {
    it('should get due transactions for execution', () => {
      return request(app.getHttpServer())
        .get('/api/v1/recurring-transactions/due')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toBeInstanceOf(Array);
          // Transactions that are due for execution
        });
    });
  });

  describe('POST /api/v1/recurring-transactions/:id/execute', () => {
    it('should execute recurring transaction', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/recurring-transactions/${recurringId}/execute`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.executionCount).toBeGreaterThan(0);
          expect(res.body.data).toHaveProperty('lastExecutionDate');
          expect(res.body.data).toHaveProperty('nextExecutionDate');

          // Next execution date should be 1 month after (for monthly frequency)
          const lastDate = new Date(res.body.data.lastExecutionDate);
          const nextDate = new Date(res.body.data.nextExecutionDate);
          expect(nextDate.getTime()).toBeGreaterThan(lastDate.getTime());
        });
    });

    it('should not execute inactive recurring', async () => {
      // First, deactivate the recurring
      await request(app.getHttpServer())
        .patch(`/api/v1/recurring-transactions/${recurringId}/toggle-active`)
        .set('Authorization', `Bearer ${authToken}`);

      // Try to execute - should fail
      return request(app.getHttpServer())
        .post(`/api/v1/recurring-transactions/${recurringId}/execute`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400); // Or whatever error code your service returns
    });
  });

  describe('PATCH /api/v1/recurring-transactions/:id/toggle-active', () => {
    it('should toggle active status', async () => {
      // Get current status
      const getRes = await request(app.getHttpServer())
        .get(`/api/v1/recurring-transactions/${recurringId}`)
        .set('Authorization', `Bearer ${authToken}`);

      const currentStatus = getRes.body.data.isActive;

      // Toggle status
      const toggleRes = await request(app.getHttpServer())
        .patch(`/api/v1/recurring-transactions/${recurringId}/toggle-active`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(toggleRes.body.data.isActive).toBe(!currentStatus);

      // Toggle back
      const toggleBackRes = await request(app.getHttpServer())
        .patch(`/api/v1/recurring-transactions/${recurringId}/toggle-active`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(toggleBackRes.body.data.isActive).toBe(currentStatus);
    });
  });

  describe('PATCH /api/v1/recurring-transactions/:id', () => {
    it('should update recurring transaction', () => {
      return request(app.getHttpServer())
        .patch(`/api/v1/recurring-transactions/${recurringId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 6000000, // Update amount
          description: 'Updated rent payment',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.amount).toBe(6000000);
          expect(res.body.data.description).toBe('Updated rent payment');
        });
    });
  });

  describe('DELETE /api/v1/recurring-transactions/:id', () => {
    it('should delete recurring transaction', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/recurring-transactions/${recurringId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });

    it('should not find deleted recurring', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/recurring-transactions/${recurringId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
