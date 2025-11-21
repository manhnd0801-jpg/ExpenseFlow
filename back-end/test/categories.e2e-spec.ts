import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Categories (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let testCategoryId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Register and login
    const registerDto = {
      email: `category_test_${Date.now()}@example.com`,
      password: 'Test@123456',
      firstName: 'Category',
      lastName: 'Test',
    };

    const registerRes = await request(app.getHttpServer()).post('/auth/register').send(registerDto);

    authToken = registerRes.body.data.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/categories (GET)', () => {
    it('should get all categories (including default categories)', () => {
      return request(app.getHttpServer())
        .get('/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toBeInstanceOf(Array);
          // Should have default categories
          expect(res.body.data.length).toBeGreaterThan(0);
        });
    });

    it('should filter categories by type', () => {
      return request(app.getHttpServer())
        .get('/categories?type=1') // INCOME
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toBeInstanceOf(Array);
          // All categories should be INCOME type
          res.body.data.forEach((cat: any) => {
            expect(cat.type).toBe(1);
          });
        });
    });

    it('should fail without auth token', () => {
      return request(app.getHttpServer()).get('/categories').expect(401);
    });
  });

  describe('/categories (POST)', () => {
    it('should create a new category successfully', () => {
      const createDto = {
        name: 'Shopping',
        type: 2, // EXPENSE
        icon: 'shopping-cart',
        color: '#FF5733',
        isActive: true,
      };

      return request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createDto)
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data.name).toBe(createDto.name);
          expect(res.body.data.type).toBe(createDto.type);

          testCategoryId = res.body.data.id;
        });
    });

    it('should fail with duplicate name', async () => {
      const createDto = {
        name: 'Shopping', // Same as above
        type: 2,
      };

      return request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createDto)
        .expect(400);
    });

    it('should fail with invalid data', () => {
      return request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: '', // Empty name
          type: 999, // Invalid type
        })
        .expect(400);
    });
  });

  describe('/categories/:id (GET)', () => {
    it('should get category by id', () => {
      return request(app.getHttpServer())
        .get(`/categories/${testCategoryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.id).toBe(testCategoryId);
        });
    });

    it('should return 404 for non-existent category', () => {
      return request(app.getHttpServer())
        .get('/categories/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('/categories/:id (PATCH)', () => {
    it('should update category successfully', () => {
      return request(app.getHttpServer())
        .patch(`/categories/${testCategoryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Online Shopping',
          color: '#00FF00',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.name).toBe('Online Shopping');
          expect(res.body.data.color).toBe('#00FF00');
        });
    });

    it('should fail when updating to duplicate name', async () => {
      // First create another category
      const anotherCategory = await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Travel',
          type: 2,
        });

      // Try to update testCategoryId to 'Travel'
      return request(app.getHttpServer())
        .patch(`/categories/${testCategoryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Travel' })
        .expect(400);
    });
  });

  describe('/categories/:id (DELETE)', () => {
    it('should delete category successfully', () => {
      return request(app.getHttpServer())
        .delete(`/categories/${testCategoryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
        });
    });

    it('should return 404 for already deleted category', () => {
      return request(app.getHttpServer())
        .get(`/categories/${testCategoryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
