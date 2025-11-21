import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Accounts (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let testAccountId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Register and login
    const registerDto = {
      email: `account_test_${Date.now()}@example.com`,
      password: 'Test@123456',
      firstName: 'Account',
      lastName: 'Test',
    };

    const registerRes = await request(app.getHttpServer()).post('/auth/register').send(registerDto);

    authToken = registerRes.body.data.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/accounts (POST)', () => {
    it('should create a new account successfully', () => {
      const createDto = {
        name: 'Cash Wallet',
        type: 1, // CASH
        balance: 1000000,
        currency: 1, // VND
        includeInTotal: true,
        isActive: true,
      };

      return request(app.getHttpServer())
        .post('/accounts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createDto)
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data.name).toBe(createDto.name);
          expect(res.body.data.balance).toBe(createDto.balance);
          expect(res.body.data.type).toBe(createDto.type);

          testAccountId = res.body.data.id;
        });
    });

    it('should fail without auth token', () => {
      return request(app.getHttpServer()).post('/accounts').send({ name: 'Test Account' }).expect(401);
    });

    it('should fail with invalid data', () => {
      return request(app.getHttpServer())
        .post('/accounts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: '', // Empty name
          type: 999, // Invalid type
        })
        .expect(400);
    });
  });

  describe('/accounts (GET)', () => {
    it('should get all accounts', () => {
      return request(app.getHttpServer())
        .get('/accounts')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.data.length).toBeGreaterThan(0);
        });
    });

    it('should fail without auth token', () => {
      return request(app.getHttpServer()).get('/accounts').expect(401);
    });
  });

  describe('/accounts/:id (GET)', () => {
    it('should get account by id', () => {
      return request(app.getHttpServer())
        .get(`/accounts/${testAccountId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.id).toBe(testAccountId);
        });
    });

    it('should return 404 for non-existent account', () => {
      return request(app.getHttpServer())
        .get('/accounts/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('/accounts/:id (PATCH)', () => {
    it('should update account successfully', () => {
      return request(app.getHttpServer())
        .patch(`/accounts/${testAccountId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Wallet',
          balance: 2000000,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.name).toBe('Updated Wallet');
          expect(res.body.data.balance).toBe(2000000);
        });
    });
  });

  describe('/accounts/:id (DELETE)', () => {
    it('should delete account successfully', () => {
      return request(app.getHttpServer())
        .delete(`/accounts/${testAccountId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
        });
    });

    it('should return 404 for already deleted account', () => {
      return request(app.getHttpServer())
        .get(`/accounts/${testAccountId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('/accounts/total-balance (GET)', () => {
    it('should get total balance', () => {
      return request(app.getHttpServer())
        .get('/accounts/total-balance')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('totalBalance');
          expect(typeof res.body.data.totalBalance).toBe('number');
        });
    });
  });
});
