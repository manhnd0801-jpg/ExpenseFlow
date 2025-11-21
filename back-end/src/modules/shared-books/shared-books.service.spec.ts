import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookRole } from '../../common/constants/enums';
import { SharedBookMember } from '../../entities/shared-book-member.entity';
import { SharedBook } from '../../entities/shared-book.entity';
import { User } from '../../entities/user.entity';
import { SharedBooksService } from './shared-books.service';

describe('SharedBooksService', () => {
  let service: SharedBooksService;
  let sharedBookRepository: Repository<SharedBook>;
  let memberRepository: Repository<SharedBookMember>;
  let userRepository: Repository<User>;

  const mockSharedBookRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
    softDelete: jest.fn(),
    softRemove: jest.fn(),
  };

  const mockMemberRepository = {
    create: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  const mockUserId = 'user-uuid-123';
  const mockBookId = 'book-uuid-456';
  const mockMemberId = 'member-uuid-789';

  const mockUser: Partial<User> = {
    id: mockUserId,
    email: 'test@example.com',
    fullName: 'Test User',
  };

  const mockSharedBook: Partial<SharedBook> = {
    id: mockBookId,
    ownerId: mockUserId,
    name: 'Family Budget',
    description: 'Shared family expenses',
    isActive: true,
  };

  const mockMember: Partial<SharedBookMember> = {
    id: mockMemberId,
    sharedBookId: mockBookId,
    userId: mockUserId,
    role: BookRole.ADMIN,
    isActive: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SharedBooksService,
        {
          provide: getRepositoryToken(SharedBook),
          useValue: mockSharedBookRepository,
        },
        {
          provide: getRepositoryToken(SharedBookMember),
          useValue: mockMemberRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<SharedBooksService>(SharedBooksService);
    sharedBookRepository = module.get<Repository<SharedBook>>(getRepositoryToken(SharedBook));
    memberRepository = module.get<Repository<SharedBookMember>>(getRepositoryToken(SharedBookMember));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create shared book with owner', async () => {
      const createDto = {
        name: 'Family Budget',
        description: 'Shared family expenses',
      };

      mockSharedBookRepository.create.mockReturnValue(mockSharedBook);
      mockSharedBookRepository.save.mockResolvedValue(mockSharedBook);

      const result = await service.create(mockUserId, createDto);

      expect(mockSharedBookRepository.create).toHaveBeenCalledWith({
        ownerId: mockUserId,
        ...createDto,
        isActive: true,
      });
      expect(mockSharedBookRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockSharedBook);
    });
  });

  describe('findOne', () => {
    it('should find shared book when user is owner', async () => {
      const bookOwnedByUser = { ...mockSharedBook, ownerId: mockUserId };
      mockSharedBookRepository.findOne.mockResolvedValue(bookOwnedByUser);

      const result = await service.findOne(mockBookId, mockUserId);

      expect(mockSharedBookRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockBookId },
        relations: ['owner', 'members', 'members.user'],
      });
      expect(result).toEqual(bookOwnedByUser);
    });

    it('should find shared book when user is a member', async () => {
      const bookOwnedByOther = { ...mockSharedBook, ownerId: 'other-user-id' };
      mockSharedBookRepository.findOne
        .mockResolvedValueOnce(bookOwnedByOther) // For checkAccess
        .mockResolvedValueOnce(bookOwnedByOther); // For findOne return

      const memberRecord = { ...mockMember, userId: mockUserId };
      mockMemberRepository.findOne.mockResolvedValue(memberRecord);

      const result = await service.findOne(mockBookId, mockUserId);

      expect(result).toEqual(bookOwnedByOther);
    });

    it('should throw NotFoundException when book not found', async () => {
      mockSharedBookRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(mockBookId, mockUserId)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user is neither owner nor member', async () => {
      const bookOwnedByOther = { ...mockSharedBook, ownerId: 'other-user-id' };
      mockSharedBookRepository.findOne.mockResolvedValue(bookOwnedByOther);
      mockMemberRepository.findOne.mockResolvedValue(null); // Not a member

      await expect(service.findOne(mockBookId, mockUserId)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('addMember', () => {
    it('should add new member by email when user is owner', async () => {
      const addMemberDto = {
        email: 'newuser@example.com',
        role: BookRole.EDITOR,
      };

      // Mock owner check (checkAccess will pass for owner)
      const bookOwnedByUser = { ...mockSharedBook, ownerId: mockUserId };
      mockSharedBookRepository.findOne.mockResolvedValue(bookOwnedByUser);

      // Mock user exists
      const newUser = { id: 'new-user-id', email: 'newuser@example.com' };
      mockUserRepository.findOne.mockResolvedValue(newUser);

      // Mock not already a member
      mockMemberRepository.findOne.mockResolvedValue(null);

      // Mock member creation
      const newMember = {
        sharedBookId: mockBookId,
        userId: newUser.id,
        role: addMemberDto.role,
      };
      mockMemberRepository.create.mockReturnValue(newMember);
      mockMemberRepository.save.mockResolvedValue(newMember);

      const result = await service.addMember(mockBookId, mockUserId, addMemberDto);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: addMemberDto.email },
      });
      expect(mockMemberRepository.create).toHaveBeenCalled();
      expect(mockMemberRepository.save).toHaveBeenCalled();
      expect(result).toEqual(newMember);
    });

    it('should add new member when user is admin member', async () => {
      const addMemberDto = {
        email: 'newuser@example.com',
        role: BookRole.EDITOR,
      };

      // User is not owner but is admin member
      const bookOwnedByOther = { ...mockSharedBook, ownerId: 'other-user-id' };
      mockSharedBookRepository.findOne.mockResolvedValue(bookOwnedByOther);

      const adminMember = { ...mockMember, role: BookRole.ADMIN };
      mockMemberRepository.findOne
        .mockResolvedValueOnce(adminMember) // For checkAccess
        .mockResolvedValueOnce(null); // For duplicate check

      const newUser = { id: 'new-user-id', email: 'newuser@example.com' };
      mockUserRepository.findOne.mockResolvedValue(newUser);

      const newMember = {
        sharedBookId: mockBookId,
        userId: newUser.id,
        role: addMemberDto.role,
      };
      mockMemberRepository.create.mockReturnValue(newMember);
      mockMemberRepository.save.mockResolvedValue(newMember);

      const result = await service.addMember(mockBookId, mockUserId, addMemberDto);

      expect(result).toEqual(newMember);
    });

    it('should throw ForbiddenException when user is viewer', async () => {
      const bookOwnedByOther = { ...mockSharedBook, ownerId: 'other-user-id' };
      mockSharedBookRepository.findOne.mockResolvedValue(bookOwnedByOther);

      const viewerMember = { ...mockMember, role: BookRole.VIEWER };
      mockMemberRepository.findOne.mockResolvedValue(viewerMember);

      const addMemberDto = {
        email: 'newuser@example.com',
        role: BookRole.EDITOR,
      };

      await expect(service.addMember(mockBookId, mockUserId, addMemberDto)).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when email not found', async () => {
      const bookOwnedByUser = { ...mockSharedBook, ownerId: mockUserId };
      mockSharedBookRepository.findOne.mockResolvedValue(bookOwnedByUser);

      mockUserRepository.findOne.mockResolvedValue(null);

      const addMemberDto = {
        email: 'nonexistent@example.com',
        role: BookRole.EDITOR,
      };

      await expect(service.addMember(mockBookId, mockUserId, addMemberDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when user is already a member', async () => {
      const bookOwnedByUser = { ...mockSharedBook, ownerId: mockUserId };
      mockSharedBookRepository.findOne.mockResolvedValue(bookOwnedByUser);

      const existingUser = { id: 'existing-user-id', email: 'existing@example.com' };
      mockUserRepository.findOne.mockResolvedValue(existingUser);

      const existingMember = { id: 'existing-member-id' };
      mockMemberRepository.findOne.mockResolvedValue(existingMember);

      const addMemberDto = {
        email: 'existing@example.com',
        role: BookRole.EDITOR,
      };

      await expect(service.addMember(mockBookId, mockUserId, addMemberDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateMemberRole', () => {
    it('should update member role when user is owner', async () => {
      const bookOwnedByUser = { ...mockSharedBook, ownerId: mockUserId };
      mockSharedBookRepository.findOne.mockResolvedValue(bookOwnedByUser);

      const targetMember = {
        id: 'target-member-id',
        role: BookRole.VIEWER,
      };
      mockMemberRepository.findOne.mockResolvedValue(targetMember);

      const updateDto = { role: BookRole.EDITOR };
      const updatedMember = { ...targetMember, role: updateDto.role };
      mockMemberRepository.save.mockResolvedValue(updatedMember);

      const result = await service.updateMemberRole(mockBookId, 'target-member-id', mockUserId, updateDto);

      expect(mockMemberRepository.save).toHaveBeenCalled();
      expect(result.role).toBe(BookRole.EDITOR);
    });

    it('should update member role when user is admin', async () => {
      const bookOwnedByOther = { ...mockSharedBook, ownerId: 'other-user-id' };
      mockSharedBookRepository.findOne.mockResolvedValue(bookOwnedByOther);

      const adminMember = { ...mockMember, role: BookRole.ADMIN };
      const targetMember = {
        id: 'target-member-id',
        role: BookRole.VIEWER,
        sharedBookId: mockBookId,
      };

      mockMemberRepository.findOne
        .mockResolvedValueOnce(adminMember) // For checkAccess
        .mockResolvedValueOnce(targetMember); // For findOne in updateMemberRole

      const updateDto = { role: BookRole.EDITOR };
      const updatedMember = { ...targetMember, role: updateDto.role };
      mockMemberRepository.save.mockResolvedValue(updatedMember);

      const result = await service.updateMemberRole(mockBookId, 'target-member-id', mockUserId, updateDto);

      expect(result.role).toBe(BookRole.EDITOR);
    });

    it('should throw ForbiddenException when user is editor', async () => {
      const bookOwnedByOther = { ...mockSharedBook, ownerId: 'other-user-id' };
      mockSharedBookRepository.findOne.mockResolvedValue(bookOwnedByOther);

      const editorMember = { ...mockMember, role: BookRole.EDITOR };
      mockMemberRepository.findOne.mockResolvedValue(editorMember);

      const updateDto = { role: BookRole.ADMIN };

      await expect(service.updateMemberRole(mockBookId, 'target-member-id', mockUserId, updateDto)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('removeMember', () => {
    it('should remove member when user is owner', async () => {
      const bookOwnedByUser = { ...mockSharedBook, ownerId: mockUserId };
      mockSharedBookRepository.findOne.mockResolvedValue(bookOwnedByUser);

      const targetMember = {
        id: 'target-member-id',
        role: BookRole.VIEWER,
        sharedBookId: mockBookId,
      };
      mockMemberRepository.findOne.mockResolvedValue(targetMember);
      mockMemberRepository.remove.mockResolvedValue(targetMember);

      await service.removeMember(mockBookId, 'target-member-id', mockUserId);

      expect(mockMemberRepository.remove).toHaveBeenCalledWith(targetMember);
    });

    it('should remove member when user is admin', async () => {
      const bookOwnedByOther = { ...mockSharedBook, ownerId: 'other-user-id' };
      mockSharedBookRepository.findOne.mockResolvedValue(bookOwnedByOther);

      const adminMember = { ...mockMember, role: BookRole.ADMIN };
      const targetMember = {
        id: 'target-member-id',
        role: BookRole.VIEWER,
        sharedBookId: mockBookId,
      };

      mockMemberRepository.findOne
        .mockResolvedValueOnce(adminMember) // For checkAccess
        .mockResolvedValueOnce(targetMember); // For findOne in removeMember

      mockMemberRepository.remove.mockResolvedValue(targetMember);

      await service.removeMember(mockBookId, 'target-member-id', mockUserId);

      expect(mockMemberRepository.remove).toHaveBeenCalledWith(targetMember);
    });

    it('should throw ForbiddenException when user is viewer', async () => {
      const bookOwnedByOther = { ...mockSharedBook, ownerId: 'other-user-id' };
      mockSharedBookRepository.findOne.mockResolvedValue(bookOwnedByOther);

      const viewerMember = { ...mockMember, role: BookRole.VIEWER };
      mockMemberRepository.findOne.mockResolvedValue(viewerMember);

      await expect(service.removeMember(mockBookId, 'target-member-id', mockUserId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('leaveBook', () => {
    it('should allow member to leave book', async () => {
      const editorMember = {
        ...mockMember,
        role: BookRole.EDITOR,
        sharedBookId: mockBookId,
        userId: mockUserId,
      };
      mockMemberRepository.findOne.mockResolvedValue(editorMember);
      mockMemberRepository.remove.mockResolvedValue(editorMember);

      await service.leaveBook(mockBookId, mockUserId);

      expect(mockMemberRepository.findOne).toHaveBeenCalledWith({
        where: { sharedBookId: mockBookId, userId: mockUserId },
      });
      expect(mockMemberRepository.remove).toHaveBeenCalledWith(editorMember);
    });

    it('should throw NotFoundException when user is not a member', async () => {
      mockMemberRepository.findOne.mockResolvedValue(null);

      await expect(service.leaveBook(mockBookId, mockUserId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft delete shared book by owner', async () => {
      const bookOwnedByUser = { ...mockSharedBook, ownerId: mockUserId };
      mockSharedBookRepository.findOne.mockResolvedValue(bookOwnedByUser);
      mockSharedBookRepository.softRemove.mockResolvedValue(bookOwnedByUser);

      await service.remove(mockBookId, mockUserId);

      expect(mockSharedBookRepository.softRemove).toHaveBeenCalledWith(bookOwnedByUser);
    });

    it('should throw ForbiddenException when non-owner tries to delete', async () => {
      const bookOwnedByOther = { ...mockSharedBook, ownerId: 'other-user-id' };
      mockSharedBookRepository.findOne.mockResolvedValue(bookOwnedByOther);

      await expect(service.remove(mockBookId, mockUserId)).rejects.toThrow(ForbiddenException);
    });
  });
});
