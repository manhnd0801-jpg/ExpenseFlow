import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let testUserId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/auth/register (POST)', () => {
    it('should register a new user successfully', () => {
      const registerDto = {
        email: `test_${Date.now()}@example.com`,
        password: 'Test@123456',
        firstName: 'Test',
        lastName: 'User',
      };

      return request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('user');
          expect(res.body.data).toHaveProperty('accessToken');
          expect(res.body.data.user.email).toBe(registerDto.email);

          testUserId = res.body.data.user.id;
          authToken = res.body.data.accessToken;
        });
    });

    it('should fail with invalid email format', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'invalid-email',
          password: 'Test@123456',
          firstName: 'Test',
          lastName: 'User',
        })
        .expect(400);
    });

    it('should fail with weak password', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: '123',
          firstName: 'Test',
          lastName: 'User',
        })
        .expect(400);
    });

    it('should fail when email already exists', () => {
      const registerDto = {
        email: 'existing@example.com',
        password: 'Test@123456',
        firstName: 'Test',
        lastName: 'User',
      };

      // Register first time
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201)
        .then(() => {
          // Try to register again with same email
          return request(app.getHttpServer()).post('/auth/register').send(registerDto).expect(400);
        });
    });
  });

  describe('/auth/login (POST)', () => {
    it('should login successfully with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'existing@example.com',
          password: 'Test@123456',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('accessToken');
          expect(res.body.data).toHaveProperty('refreshToken');
          expect(res.body.data).toHaveProperty('user');
        });
    });

    it('should fail with invalid email', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Test@123456',
        })
        .expect(401);
    });

    it('should fail with invalid password', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'existing@example.com',
          password: 'WrongPassword',
        })
        .expect(401);
    });

    it('should fail with missing credentials', () => {
      return request(app.getHttpServer()).post('/auth/login').send({}).expect(400);
    });
  });

  describe('/auth/me (GET)', () => {
    it('should get current user profile with valid token', () => {
      return request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data).toHaveProperty('email');
          expect(res.body.data).not.toHaveProperty('password');
        });
    });

    it('should fail without auth token', () => {
      return request(app.getHttpServer()).get('/auth/me').expect(401);
    });

    it('should fail with invalid token', () => {
      return request(app.getHttpServer()).get('/auth/me').set('Authorization', 'Bearer invalid_token').expect(401);
    });
  });

  describe('/auth/refresh (POST)', () => {
    let refreshToken: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer()).post('/auth/login').send({
        email: 'existing@example.com',
        password: 'Test@123456',
      });

      refreshToken = res.body.data.refreshToken;
    });

    it('should refresh token successfully', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('accessToken');
          expect(res.body.data).toHaveProperty('refreshToken');
        });
    });

    it('should fail with invalid refresh token', () => {
      return request(app.getHttpServer()).post('/auth/refresh').send({ refreshToken: 'invalid_token' }).expect(401);
    });
  });

  describe('/auth/logout (POST)', () => {
    it('should logout successfully', () => {
      return request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
        });
    });
  });
});
