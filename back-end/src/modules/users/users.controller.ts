import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiRoutes } from '../../common/constants/api-routes';
import { GetCurrentUser } from '../../common/decorators/get-current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { User } from '../../entities/user.entity';
import { UserResponseDto } from '../auth/dto/auth-response.dto';
import { ChangePasswordDto, UpdateProfileDto } from './dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller(ApiRoutes.USERS.BASE)
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(ApiRoutes.USERS.PROFILE)
  @ApiOperation({
    summary: 'Get user profile',
    description: 'Retrieve current user profile information',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    type: UserResponseDto,
  })
  async getProfile(@GetCurrentUser() user: User): Promise<UserResponseDto> {
    return this.usersService.findById(user.id);
  }

  @Put(ApiRoutes.USERS.PROFILE)
  @ApiOperation({
    summary: 'Update user profile',
    description: 'Update user profile information',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  async updateProfile(
    @GetCurrentUser() user: User,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<UserResponseDto> {
    return this.usersService.updateProfile(user.id, updateProfileDto);
  }

  @Post(ApiRoutes.USERS.CHANGE_PASSWORD)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Change password',
    description: 'Change user password',
  })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Current password is incorrect',
  })
  async changePassword(
    @GetCurrentUser() user: User,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<{ success: boolean; message: string }> {
    return this.usersService.changePassword(user.id, changePasswordDto);
  }

  @Post(ApiRoutes.USERS.UPLOAD_AVATAR)
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload avatar',
    description: 'Upload user avatar image',
  })
  @ApiResponse({
    status: 200,
    description: 'Avatar uploaded successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file format or size',
  })
  async uploadAvatar(@GetCurrentUser() user: User, @UploadedFile() file: any): Promise<UserResponseDto> {
    // TODO: Implement file validation and storage logic
    const avatarPath = `/uploads/avatars/${file.filename}`;
    return this.usersService.uploadAvatar(user.id, avatarPath);
  }

  @Delete(ApiRoutes.USERS.PROFILE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete user account',
    description: 'Soft delete user account and all associated data',
  })
  @ApiResponse({
    status: 200,
    description: 'Account deleted successfully',
  })
  async deleteAccount(@GetCurrentUser() user: User): Promise<{ success: boolean; message: string }> {
    return this.usersService.deleteUser(user.id);
  }
}
