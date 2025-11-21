import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ErrorCodes } from '../../common/constants/error-codes';
import { HashUtil } from '../../common/utils/hash.util';
import { User } from '../../entities/user.entity';
import { ChangePasswordDto, UpdateProfileDto } from './dto';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: Repository<User>;

  const mockUser: Partial<User> = {
    id: 'user-123',
    email: 'test@example.com',
    fullName: 'Test User',
    password: 'hashedPassword',
    avatar: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findById', () => {
    it('should return user data when user exists', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findById('user-123');

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });
      expect(result).toBeDefined();
      expect(result.email).toBe(mockUser.email);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.findById('non-existent-id')).rejects.toThrow(NotFoundException);
      await expect(service.findById('non-existent-id')).rejects.toMatchObject({
        response: {
          errorCode: ErrorCodes.USER_NOT_FOUND,
          message: 'User not found',
        },
      });
    });
  });

  describe('updateProfile', () => {
    const updateDto: UpdateProfileDto = {
      firstName: 'Updated',
      lastName: 'Name',
    };

    it('should update user profile successfully', async () => {
      const updatedUser = { ...mockUser, ...updateDto };
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue(updatedUser);

      const result = await service.updateProfile('user-123', updateDto);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.updateProfile('non-existent-id', updateDto)).rejects.toThrow(NotFoundException);
      await expect(service.updateProfile('non-existent-id', updateDto)).rejects.toMatchObject({
        response: {
          errorCode: ErrorCodes.USER_NOT_FOUND,
          message: 'User not found',
        },
      });
    });
  });

  describe('changePassword', () => {
    const changePasswordDto: ChangePasswordDto = {
      currentPassword: 'oldPassword',
      newPassword: 'newPassword123',
    };

    beforeEach(() => {
      // Mock HashUtil methods
      jest.spyOn(HashUtil, 'comparePassword').mockResolvedValue(true);
      jest.spyOn(HashUtil, 'hashPassword').mockResolvedValue('hashedNewPassword');
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should change password successfully', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue({
        ...mockUser,
        password: 'hashedNewPassword',
      });

      const result = await service.changePassword('user-123', changePasswordDto);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });
      expect(HashUtil.comparePassword).toHaveBeenCalledWith(changePasswordDto.currentPassword, 'hashedPassword');
      expect(HashUtil.hashPassword).toHaveBeenCalledWith(changePasswordDto.newPassword);
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(result).toEqual({
        success: true,
        message: 'Password changed successfully',
      });
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.changePassword('non-existent-id', changePasswordDto)).rejects.toThrow(NotFoundException);
      await expect(service.changePassword('non-existent-id', changePasswordDto)).rejects.toMatchObject({
        response: {
          errorCode: ErrorCodes.USER_NOT_FOUND,
          message: 'User not found',
        },
      });
    });

    it('should throw BadRequestException when current password is incorrect', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      jest.spyOn(HashUtil, 'comparePassword').mockResolvedValue(false);

      await expect(service.changePassword('user-123', changePasswordDto)).rejects.toThrow(BadRequestException);
      await expect(service.changePassword('user-123', changePasswordDto)).rejects.toMatchObject({
        response: {
          errorCode: ErrorCodes.AUTH_INVALID_CREDENTIALS,
          message: 'Current password is incorrect',
        },
      });
    });
  });

  describe('uploadAvatar', () => {
    const avatarPath = '/uploads/avatars/user-123.jpg';

    it('should upload avatar successfully', async () => {
      const userWithAvatar = { ...mockUser, avatar: avatarPath };
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue(userWithAvatar);

      const result = await service.uploadAvatar('user-123', avatarPath);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.uploadAvatar('non-existent-id', avatarPath)).rejects.toThrow(NotFoundException);
      await expect(service.uploadAvatar('non-existent-id', avatarPath)).rejects.toMatchObject({
        response: {
          errorCode: ErrorCodes.USER_NOT_FOUND,
          message: 'User not found',
        },
      });
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.softDelete.mockResolvedValue({ affected: 1 });

      const result = await service.deleteUser('user-123');

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });
      expect(mockUserRepository.softDelete).toHaveBeenCalledWith('user-123');
      expect(result).toEqual({
        success: true,
        message: 'User account deleted successfully',
      });
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.deleteUser('non-existent-id')).rejects.toThrow(NotFoundException);
      await expect(service.deleteUser('non-existent-id')).rejects.toMatchObject({
        response: {
          errorCode: ErrorCodes.USER_NOT_FOUND,
          message: 'User not found',
        },
      });
    });
  });
});
