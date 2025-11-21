import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { AppModule } from '../src/app.module';
import { SharedBookMember } from '../src/entities/shared-book-member.entity';
import { SharedBook } from '../src/entities/shared-book.entity';
import { User } from '../src/entities/user.entity';

describe('SharedBooks API (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let userId: string;
  let sharedBookId: string;
  let userRepository: Repository<User>;
  let sharedBookRepository: Repository<SharedBook>;
  let memberRepository: Repository<SharedBookMember>;

  // Second user for member testing
  let memberAuthToken: string;
  let memberId: string;

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
    sharedBookRepository = moduleFixture.get<Repository<SharedBook>>(getRepositoryToken(SharedBook));
    memberRepository = moduleFixture.get<Repository<SharedBookMember>>(getRepositoryToken(SharedBookMember));

    // Create owner user
    const ownerUser = {
      email: `owner-${Date.now()}@example.com`,
      password: 'Test123456!',
      fullName: 'Owner User',
    };

    const ownerResponse = await request(app.getHttpServer()).post('/api/v1/auth/register').send(ownerUser);

    authToken = ownerResponse.body.accessToken;
    userId = ownerResponse.body.user.id;

    // Create member user
    const memberUser = {
      email: `member-${Date.now()}@example.com`,
      password: 'Test123456!',
      fullName: 'Member User',
    };

    const memberResponse = await request(app.getHttpServer()).post('/api/v1/auth/register').send(memberUser);

    memberAuthToken = memberResponse.body.accessToken;
    memberId = memberResponse.body.user.id;
  });

  afterAll(async () => {
    // Cleanup
    if (sharedBookId) {
      await memberRepository.delete({ sharedBookId });
      await sharedBookRepository.delete({ id: sharedBookId });
    }
    if (userId) {
      await userRepository.delete({ id: userId });
    }
    if (memberId) {
      await userRepository.delete({ id: memberId });
    }
    await app.close();
  });

  describe('POST /api/v1/shared-books', () => {
    it('should create shared book', () => {
      return request(app.getHttpServer())
        .post('/api/v1/shared-books')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Family Budget 2024',
          description: 'Shared family expenses tracking',
          currency: 'VND',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data.name).toBe('Family Budget 2024');
          expect(res.body.data.ownerId).toBe(userId);

          sharedBookId = res.body.data.id;
        });
    });

    it('should return 400 for empty name', () => {
      return request(app.getHttpServer())
        .post('/api/v1/shared-books')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: '',
          currency: 'VND',
        })
        .expect(400);
    });

    it('should return 401 without auth token', () => {
      return request(app.getHttpServer())
        .post('/api/v1/shared-books')
        .send({
          name: 'Test Book',
        })
        .expect(401);
    });
  });

  describe('GET /api/v1/shared-books', () => {
    it('should get all shared books for user', () => {
      return request(app.getHttpServer())
        .get('/api/v1/shared-books?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.data.length).toBeGreaterThan(0);

          // Should include books where user is owner or member
          const ownedBook = res.body.data.find((b) => b.ownerId === userId);
          expect(ownedBook).toBeDefined();
        });
    });

    it('should filter by ownership role', () => {
      return request(app.getHttpServer())
        .get('/api/v1/shared-books?role=owner')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          const books = res.body.data;
          expect(books.every((b) => b.ownerId === userId)).toBe(true);
        });
    });
  });

  describe('GET /api/v1/shared-books/:id', () => {
    it('should get shared book by id for owner', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/shared-books/${sharedBookId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.id).toBe(sharedBookId);
          expect(res.body.data.name).toBe('Family Budget 2024');
        });
    });

    it('should return 403 for non-member user', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/shared-books/${sharedBookId}`)
        .set('Authorization', `Bearer ${memberAuthToken}`) // Not added as member yet
        .expect(403);
    });

    it('should return 404 for non-existent book', () => {
      return request(app.getHttpServer())
        .get('/api/v1/shared-books/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('POST /api/v1/shared-books/:id/members', () => {
    it('should add member by email', async () => {
      // Get member user's email
      const memberUser = await userRepository.findOne({
        where: { id: memberId },
      });

      return request(app.getHttpServer())
        .post(`/api/v1/shared-books/${sharedBookId}/members`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: memberUser.email,
          role: 2, // Editor role
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data.userId).toBe(memberId);
          expect(res.body.data.role).toBe(2); // Editor
          expect(res.body.data.isActive).toBe(true);
        });
    });

    it('should return 400 for duplicate member', async () => {
      const memberUser = await userRepository.findOne({
        where: { id: memberId },
      });

      return request(app.getHttpServer())
        .post(`/api/v1/shared-books/${sharedBookId}/members`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: memberUser.email,
          role: 2,
        })
        .expect(400); // Already a member
    });

    it('should return 404 for non-existent user email', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/shared-books/${sharedBookId}/members`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: 'nonexistent@example.com',
          role: 2,
        })
        .expect(404);
    });

    it('should return 403 if non-owner tries to add member', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/shared-books/${sharedBookId}/members`)
        .set('Authorization', `Bearer ${memberAuthToken}`)
        .send({
          email: 'someone@example.com',
          role: 3,
        })
        .expect(403); // Only owner can add members
    });
  });

  describe('GET /api/v1/shared-books/:id/members', () => {
    it('should list all members', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/shared-books/${sharedBookId}/members`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.data.length).toBeGreaterThan(0);

          // Should include the added member
          const addedMember = res.body.data.find((m) => m.userId === memberId);
          expect(addedMember).toBeDefined();
          expect(addedMember.role).toBe(2); // Editor
        });
    });

    it('should allow member to view members list', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/shared-books/${sharedBookId}/members`)
        .set('Authorization', `Bearer ${memberAuthToken}`)
        .expect(200);
    });
  });

  describe('PATCH /api/v1/shared-books/:id/members/:memberId', () => {
    let memberRecordId: string;

    beforeAll(async () => {
      // Get the member record ID
      const member = await memberRepository.findOne({
        where: { sharedBookId, userId: memberId },
      });
      memberRecordId = member.id;
    });

    it('should update member role', () => {
      return request(app.getHttpServer())
        .patch(`/api/v1/shared-books/${sharedBookId}/members/${memberRecordId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          role: 3, // Change to Viewer
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.role).toBe(3); // Viewer
        });
    });

    it('should return 403 if non-admin tries to change role', () => {
      return request(app.getHttpServer())
        .patch(`/api/v1/shared-books/${sharedBookId}/members/${memberRecordId}`)
        .set('Authorization', `Bearer ${memberAuthToken}`)
        .send({
          role: 1, // Try to promote to Admin
        })
        .expect(403); // Only admins can change roles
    });
  });

  describe('DELETE /api/v1/shared-books/:id/members/:memberId', () => {
    let memberRecordId: string;

    beforeAll(async () => {
      const member = await memberRepository.findOne({
        where: { sharedBookId, userId: memberId },
      });
      memberRecordId = member.id;
    });

    it('should return 403 if non-admin tries to remove member', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/shared-books/${sharedBookId}/members/${memberRecordId}`)
        .set('Authorization', `Bearer ${memberAuthToken}`)
        .expect(403); // Only admins can remove members
    });

    it('should remove member as owner', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/shared-books/${sharedBookId}/members/${memberRecordId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });

    it('should not find removed member', async () => {
      const member = await memberRepository.findOne({
        where: { id: memberRecordId, isActive: true },
      });
      expect(member).toBeNull();
    });
  });

  describe('POST /api/v1/shared-books/:id/leave', () => {
    it('should allow member to leave book', async () => {
      // Re-add member first
      const memberUser = await userRepository.findOne({
        where: { id: memberId },
      });

      await request(app.getHttpServer())
        .post(`/api/v1/shared-books/${sharedBookId}/members`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: memberUser.email,
          role: 3,
        });

      // Member leaves
      return request(app.getHttpServer())
        .post(`/api/v1/shared-books/${sharedBookId}/leave`)
        .set('Authorization', `Bearer ${memberAuthToken}`)
        .expect(200);
    });

    it('should return 403 if owner tries to leave', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/shared-books/${sharedBookId}/leave`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403); // Owner cannot leave, must delete or transfer ownership
    });
  });

  describe('PATCH /api/v1/shared-books/:id', () => {
    it('should update shared book', () => {
      return request(app.getHttpServer())
        .patch(`/api/v1/shared-books/${sharedBookId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Family Budget 2024',
          description: 'Updated description',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.name).toBe('Updated Family Budget 2024');
          expect(res.body.data.description).toBe('Updated description');
        });
    });

    it('should return 403 if non-owner tries to update', () => {
      return request(app.getHttpServer())
        .patch(`/api/v1/shared-books/${sharedBookId}`)
        .set('Authorization', `Bearer ${memberAuthToken}`)
        .send({
          name: 'Hacked Name',
        })
        .expect(403); // Only owner can update book settings
    });
  });

  describe('DELETE /api/v1/shared-books/:id', () => {
    it('should return 403 if non-owner tries to delete', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/shared-books/${sharedBookId}`)
        .set('Authorization', `Bearer ${memberAuthToken}`)
        .expect(403);
    });

    it('should delete shared book as owner', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/shared-books/${sharedBookId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });

    it('should not find deleted book', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/shared-books/${sharedBookId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
