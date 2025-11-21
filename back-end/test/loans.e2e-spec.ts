import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { AppModule } from '../src/app.module';
import { Loan } from '../src/entities/loan.entity';
import { User } from '../src/entities/user.entity';

describe('Loans API (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let userId: string;
  let loanId: string;
  let userRepository: Repository<User>;
  let loanRepository: Repository<Loan>;

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
    loanRepository = moduleFixture.get<Repository<Loan>>(getRepositoryToken(Loan));

    // Create test user and login
    const testUser = {
      email: `test-${Date.now()}@example.com`,
      password: 'Test123456!',
      fullName: 'Test User',
    };

    const registerResponse = await request(app.getHttpServer()).post('/api/v1/auth/register').send(testUser);

    authToken = registerResponse.body.accessToken;
    userId = registerResponse.body.user.id;
  });

  afterAll(async () => {
    // Cleanup: Delete test user and all related data
    if (userId) {
      await loanRepository.delete({ userId });
      await userRepository.delete({ id: userId });
    }
    await app.close();
  });

  describe('POST /api/v1/loans', () => {
    it('should create a new loan', () => {
      return request(app.getHttpServer())
        .post('/api/v1/loans')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 2, // MORTGAGE
          name: 'Home Loan',
          lender: 'ABC Bank',
          originalAmount: 500000000, // 500M VND
          interestRate: 8.5, // 8.5% per year
          termMonths: 240, // 20 years
          startDate: '2024-01-01',
          description: 'House purchase loan',
          reminderEnabled: true,
          reminderDaysBefore: 3,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data.name).toBe('Home Loan');
          expect(res.body.data.originalAmount).toBe(500000000);
          expect(res.body.data.monthlyPayment).toBeGreaterThan(0);
          expect(res.body.data.status).toBe(1); // ACTIVE

          loanId = res.body.data.id; // Save for later tests
        });
    });

    it('should return 400 for invalid data', () => {
      return request(app.getHttpServer())
        .post('/api/v1/loans')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 2,
          name: 'Invalid Loan',
          originalAmount: -50000, // Negative amount
          interestRate: 150, // > 100%
        })
        .expect(400);
    });

    it('should return 401 without auth token', () => {
      return request(app.getHttpServer())
        .post('/api/v1/loans')
        .send({
          type: 2,
          name: 'Home Loan',
          originalAmount: 100000000,
        })
        .expect(401);
    });
  });

  describe('GET /api/v1/loans', () => {
    it('should get all loans with pagination', () => {
      return request(app.getHttpServer())
        .get('/api/v1/loans?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.data.length).toBeGreaterThan(0);
        });
    });

    it('should filter by loan type', () => {
      return request(app.getHttpServer())
        .get('/api/v1/loans?type=2') // MORTGAGE
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          const loans = res.body.data;
          expect(loans.every((loan) => loan.type === 2)).toBe(true);
        });
    });
  });

  describe('GET /api/v1/loans/:id', () => {
    it('should get loan by id', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/loans/${loanId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.id).toBe(loanId);
          expect(res.body.data.name).toBe('Home Loan');
        });
    });

    it('should return 404 for non-existent loan', () => {
      return request(app.getHttpServer())
        .get('/api/v1/loans/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('GET /api/v1/loans/:id/amortization', () => {
    it('should get amortization schedule', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/loans/${loanId}/amortization`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.data.length).toBe(240); // 240 months

          const firstPayment = res.body.data[0];
          expect(firstPayment).toHaveProperty('paymentNumber');
          expect(firstPayment).toHaveProperty('paymentDate');
          expect(firstPayment).toHaveProperty('payment');
          expect(firstPayment).toHaveProperty('principal');
          expect(firstPayment).toHaveProperty('interest');
          expect(firstPayment).toHaveProperty('remainingPrincipal');

          // Verify first payment has more interest than principal (typical for amortization)
          expect(firstPayment.interest).toBeGreaterThan(firstPayment.principal);
        });
    });
  });

  describe('POST /api/v1/loans/:id/simulate-prepayment', () => {
    it('should simulate prepayment with reduce_term strategy', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/loans/${loanId}/simulate-prepayment`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          prepaymentAmount: 50000000, // 50M VND
          strategy: 'reduce_term',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('originalTermMonths');
          expect(res.body.data).toHaveProperty('newTermMonths');
          expect(res.body.data).toHaveProperty('totalInterestSaved');
          expect(res.body.data).toHaveProperty('monthsSaved');

          // After prepayment, term should be reduced
          expect(res.body.data.newTermMonths).toBeLessThan(res.body.data.originalTermMonths);
          expect(res.body.data.monthsSaved).toBeGreaterThan(0);
        });
    });

    it('should simulate prepayment with reduce_payment strategy', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/loans/${loanId}/simulate-prepayment`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          prepaymentAmount: 50000000,
          strategy: 'reduce_payment',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.newMonthlyPayment).toBeLessThan(res.body.data.originalMonthlyPayment);
          expect(res.body.data.monthsSaved).toBe(0); // No time saved with this strategy
        });
    });
  });

  describe('POST /api/v1/loans/:id/payments', () => {
    it('should record a loan payment', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/loans/${loanId}/payments`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          paymentDate: '2024-02-01',
          amount: 4500000, // Monthly payment amount
          note: 'First payment',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data).toHaveProperty('principalAmount');
          expect(res.body.data).toHaveProperty('interestAmount');
          expect(res.body.data.amount).toBe(4500000);

          // Verify payment splits into principal and interest
          expect(res.body.data.principalAmount + res.body.data.interestAmount).toBeCloseTo(4500000, 0);
        });
    });

    it('should record prepayment', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/loans/${loanId}/payments`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          paymentDate: '2024-03-01',
          amount: 4500000,
          prepaymentAmount: 10000000, // Additional 10M prepayment
          isPrepayment: true,
          note: 'Payment with prepayment',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.data.prepaymentAmount).toBe(10000000);
          expect(res.body.data.isPrepayment).toBe(true);
        });
    });
  });

  describe('GET /api/v1/loans/:id/payments', () => {
    it('should get all payments for a loan', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/loans/${loanId}/payments`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.data.length).toBeGreaterThanOrEqual(2); // We created 2 payments
        });
    });
  });

  describe('PATCH /api/v1/loans/:id', () => {
    it('should update loan details', () => {
      return request(app.getHttpServer())
        .patch(`/api/v1/loans/${loanId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          notes: 'Updated notes for the loan',
          reminderEnabled: false,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.notes).toBe('Updated notes for the loan');
          expect(res.body.data.reminderEnabled).toBe(false);
        });
    });
  });

  describe('DELETE /api/v1/loans/:id', () => {
    it('should delete (soft delete) a loan', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/loans/${loanId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });

    it('should not find deleted loan', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/loans/${loanId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
