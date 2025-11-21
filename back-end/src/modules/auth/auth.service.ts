import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { Repository } from 'typeorm';
import { ErrorCodes } from '../../common/constants/error-codes';
import { HashUtil } from '../../common/utils/hash.util';
import { User } from '../../entities/user.entity';
import { AuthResponseDto, LoginDto, RegisterDto, UserResponseDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, firstName, lastName, defaultCurrency, language, timezone } = registerDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException({
        errorCode: ErrorCodes.AUTH_EMAIL_EXISTS,
        message: 'User with this email already exists',
      });
    }

    // Hash password
    const hashedPassword = await HashUtil.hashPassword(password);

    // Create user
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      defaultCurrency: defaultCurrency || 1, // Default to VND
      language: language || 'vi',
      timezone: timezone || 'Asia/Ho_Chi_Minh',
    });

    const savedUser = await this.userRepository.save(user);

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(savedUser);

    // Return response
    const userResponse = plainToClass(UserResponseDto, savedUser, {
      excludeExtraneousValues: true,
    });

    return {
      success: true,
      accessToken,
      refreshToken,
      user: userResponse,
      expiresIn: this.configService.get<string>('jwt.expiresIn'),
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Find user
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException({
        errorCode: ErrorCodes.AUTH_INVALID_CREDENTIALS,
        message: 'Invalid credentials',
      });
    }

    // Verify password
    const isPasswordValid = await HashUtil.comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException({
        errorCode: ErrorCodes.AUTH_INVALID_CREDENTIALS,
        message: 'Invalid credentials',
      });
    }

    // Update last login
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(user);

    // Return response
    const userResponse = plainToClass(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });

    return {
      success: true,
      accessToken,
      refreshToken,
      user: userResponse,
      expiresIn: this.configService.get<string>('jwt.expiresIn'),
    };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });

      const user = await this.userRepository.findOne({ where: { id: payload.sub } });
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException({
        errorCode: ErrorCodes.AUTH_TOKEN_INVALID,
        message: 'Invalid refresh token',
      });
    }
  }

  async validateUser(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException({
        errorCode: ErrorCodes.USER_NOT_FOUND,
        message: 'User not found',
      });
    }
    return user;
  }

  private async generateTokens(user: User): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = {
      sub: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.secret'),
        expiresIn: this.configService.get<string>('jwt.expiresIn'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
        expiresIn: this.configService.get<string>('jwt.refreshExpiresIn'),
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
