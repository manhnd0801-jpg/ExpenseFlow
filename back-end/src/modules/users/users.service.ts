import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { Repository } from 'typeorm';
import { ErrorCodes } from '../../common/constants/error-codes';
import { HashUtil } from '../../common/utils/hash.util';
import { User } from '../../entities/user.entity';
import { UserResponseDto } from '../auth/dto/auth-response.dto';
import { ChangePasswordDto, UpdateProfileDto } from './dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findById(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException({
        errorCode: ErrorCodes.USER_NOT_FOUND,
        message: 'User not found',
      });
    }

    return plainToClass(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException({
        errorCode: ErrorCodes.USER_NOT_FOUND,
        message: 'User not found',
      });
    }

    // Update user fields
    Object.assign(user, updateProfileDto);
    const updatedUser = await this.userRepository.save(user);

    return plainToClass(UserResponseDto, updatedUser, {
      excludeExtraneousValues: true,
    });
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ success: boolean; message: string }> {
    const { currentPassword, newPassword } = changePasswordDto;

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException({
        errorCode: ErrorCodes.USER_NOT_FOUND,
        message: 'User not found',
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await HashUtil.comparePassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new BadRequestException({
        errorCode: ErrorCodes.AUTH_INVALID_CREDENTIALS,
        message: 'Current password is incorrect',
      });
    }

    // Hash new password
    const hashedNewPassword = await HashUtil.hashPassword(newPassword);
    user.password = hashedNewPassword;

    await this.userRepository.save(user);

    return {
      success: true,
      message: 'Password changed successfully',
    };
  }

  async uploadAvatar(userId: string, avatarPath: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException({
        errorCode: ErrorCodes.USER_NOT_FOUND,
        message: 'User not found',
      });
    }

    user.avatar = avatarPath;
    const updatedUser = await this.userRepository.save(user);

    return plainToClass(UserResponseDto, updatedUser, {
      excludeExtraneousValues: true,
    });
  }

  async deleteUser(userId: string): Promise<{ success: boolean; message: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException({
        errorCode: ErrorCodes.USER_NOT_FOUND,
        message: 'User not found',
      });
    }

    // Soft delete
    await this.userRepository.softDelete(userId);

    return {
      success: true,
      message: 'User account deleted successfully',
    };
  }
}
