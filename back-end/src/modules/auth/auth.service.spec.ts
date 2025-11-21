import { ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ErrorCodes } from '../../common/constants/error-codes';
import { HashUtil } from '../../common/utils/hash.util';
import { User } from '../../entities/user.entity';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: Repository<User>;
  let jwtService: JwtService;
  let configService: ConfigService;

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockUser = {
    id: 'user-id-1',
    email: 'test@example.com',
    password: 'hashedPassword123',
    firstName: 'Test',
    lastName: 'User',
    defaultCurrency: 1,
    language: 'vi',
    timezone: 'Asia/Ho_Chi_Minh',
    isActive: true,
    lastLoginAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);

    jest.clearAllMocks();

    // Default config values
    mockConfigService.get.mockImplementation((key: string) => {
      const config = {
        'jwt.secret': 'test-secret',
        'jwt.refreshSecret': 'test-refresh-secret',
        'jwt.expiresIn': '15m',
        'jwt.refreshExpiresIn': '7d',
      };
      return config[key];
    });
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerDto: RegisterDto = {
        email: 'newuser@example.com',
        password: 'Password123',
        firstName: 'New',
        lastName: 'User',
      };

      mockUserRepository.findOne.mockResolvedValue(null); // No existing user
      mockUserRepository.create.mockReturnValue({
        ...mockUser,
        email: registerDto.email,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
      });
      mockUserRepository.save.mockResolvedValue({
        ...mockUser,
        email: registerDto.email,
      });
      mockJwtService.signAsync.mockResolvedValueOnce('access-token');
      mockJwtService.signAsync.mockResolvedValueOnce('refresh-token');

      jest.spyOn(HashUtil, 'hashPassword').mockResolvedValue('hashedPassword123');

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('accessToken', 'access-token');
      expect(result).toHaveProperty('refreshToken', 'refresh-token');
      expect(result.user).toHaveProperty('email', registerDto.email);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(HashUtil.hashPassword).toHaveBeenCalledWith(registerDto.password);
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should use default values for optional fields', async () => {
      const registerDto: RegisterDto = {
        email: 'newuser@example.com',
        password: 'Password123',
        firstName: 'New',
        lastName: 'User',
      };

      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockImplementation((data) => data);
      mockUserRepository.save.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue('token');
      jest.spyOn(HashUtil, 'hashPassword').mockResolvedValue('hashed');

      await service.register(registerDto);

      expect(mockUserRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          defaultCurrency: 1, // VND
          language: 'vi',
          timezone: 'Asia/Ho_Chi_Minh',
        }),
      );
    });

    it('should throw ConflictException when email already exists', async () => {
      const registerDto: RegisterDto = {
        email: 'existing@example.com',
        password: 'Password123',
        firstName: 'Existing',
        lastName: 'User',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser); // User exists

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
      await expect(service.register(registerDto)).rejects.toThrow(
        expect.objectContaining({
          response: expect.objectContaining({
            errorCode: ErrorCodes.AUTH_EMAIL_EXISTS,
          }),
        }),
      );
    });
  });

  describe('login', () => {
    it('should login user successfully with valid credentials', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'Password123',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue({
        ...mockUser,
        lastLoginAt: expect.any(Date),
      });
      mockJwtService.signAsync.mockResolvedValueOnce('access-token');
      mockJwtService.signAsync.mockResolvedValueOnce('refresh-token');

      jest.spyOn(HashUtil, 'comparePassword').mockResolvedValue(true);

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('accessToken', 'access-token');
      expect(result).toHaveProperty('refreshToken', 'refresh-token');
      expect(result.user).toHaveProperty('email', loginDto.email);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
      expect(HashUtil.comparePassword).toHaveBeenCalledWith(loginDto.password, mockUser.password);
      expect(mockUserRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          lastLoginAt: expect.any(Date),
        }),
      );
    });

    it('should throw UnauthorizedException when user not found', async () => {
      const loginDto: LoginDto = {
        email: 'nonexistent@example.com',
        password: 'Password123',
      };

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow(
        expect.objectContaining({
          response: expect.objectContaining({
            errorCode: ErrorCodes.AUTH_INVALID_CREDENTIALS,
          }),
        }),
      );
    });

    it('should throw UnauthorizedException when password is incorrect', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'WrongPassword',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      jest.spyOn(HashUtil, 'comparePassword').mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow(
        expect.objectContaining({
          response: expect.objectContaining({
            errorCode: ErrorCodes.AUTH_INVALID_CREDENTIALS,
          }),
        }),
      );
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully with valid refresh token', async () => {
      const refreshToken = 'valid-refresh-token';
      const payload = { sub: mockUser.id, email: mockUser.email };

      mockJwtService.verifyAsync.mockResolvedValue(payload);
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValueOnce('new-access-token');
      mockJwtService.signAsync.mockResolvedValueOnce('new-refresh-token');

      const result = await service.refreshToken(refreshToken);

      expect(result).toEqual({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });
      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(refreshToken, {
        secret: 'test-refresh-secret',
      });
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
    });

    it('should throw UnauthorizedException when refresh token is invalid', async () => {
      const refreshToken = 'invalid-token';

      mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      await expect(service.refreshToken(refreshToken)).rejects.toThrow(UnauthorizedException);
      await expect(service.refreshToken(refreshToken)).rejects.toThrow(
        expect.objectContaining({
          response: expect.objectContaining({
            errorCode: ErrorCodes.AUTH_TOKEN_INVALID,
          }),
        }),
      );
    });

    it('should throw UnauthorizedException when user not found', async () => {
      const refreshToken = 'valid-refresh-token';
      const payload = { sub: 'non-existent-user-id', email: 'test@example.com' };

      mockJwtService.verifyAsync.mockResolvedValue(payload);
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.refreshToken(refreshToken)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateUser', () => {
    it('should return user when user exists', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.validateUser(mockUser.id);

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.validateUser('non-existent-id')).rejects.toThrow(NotFoundException);
      await expect(service.validateUser('non-existent-id')).rejects.toThrow(
        expect.objectContaining({
          response: expect.objectContaining({
            errorCode: ErrorCodes.USER_NOT_FOUND,
          }),
        }),
      );
    });
  });

  describe('generateTokens (private method)', () => {
    it('should generate both access and refresh tokens', async () => {
      mockJwtService.signAsync.mockResolvedValueOnce('access-token');
      mockJwtService.signAsync.mockResolvedValueOnce('refresh-token');

      // Access private method via login
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
      jest.spyOn(HashUtil, 'comparePassword').mockResolvedValue(true);

      const result = await service.login({
        email: 'test@example.com',
        password: 'Password123',
      });

      expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: mockUser.id,
          email: mockUser.email,
        }),
        expect.objectContaining({
          secret: 'test-secret',
          expiresIn: '15m',
        }),
      );
      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: mockUser.id,
          email: mockUser.email,
        }),
        expect.objectContaining({
          secret: 'test-refresh-secret',
          expiresIn: '7d',
        }),
      );
    });
  });
});
