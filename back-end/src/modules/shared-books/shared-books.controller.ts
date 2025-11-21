import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AddMemberDto, CreateSharedBookDto, QuerySharedBookDto, UpdateMemberRoleDto, UpdateSharedBookDto } from './dto';
import { SharedBooksService } from './shared-books.service';

/**
 * Controller for shared books management
 */
@ApiTags('Shared Books')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('shared-books')
export class SharedBooksController {
  constructor(private readonly sharedBooksService: SharedBooksService) {}

  /**
   * Create new shared book
   */
  @Post()
  @ApiOperation({ summary: 'Create shared book' })
  @ApiResponse({
    status: 201,
    description: 'Shared book created successfully',
  })
  async create(@Request() req, @Body() createDto: CreateSharedBookDto) {
    const data = await this.sharedBooksService.create(req.user.userId, createDto);
    return {
      success: true,
      data,
      message: 'Shared book created successfully',
    };
  }

  /**
   * Get all shared books (owned + member of)
   */
  @Get()
  @ApiOperation({ summary: 'Get all shared books' })
  @ApiResponse({
    status: 200,
    description: 'Shared books retrieved successfully',
  })
  async findAll(@Request() req, @Query() query: QuerySharedBookDto) {
    const data = await this.sharedBooksService.findAll(req.user.userId, query);
    return {
      success: true,
      data,
      message: 'Shared books retrieved successfully',
    };
  }

  /**
   * Get shared book by ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get shared book by ID' })
  @ApiResponse({
    status: 200,
    description: 'Shared book retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Shared book not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    const data = await this.sharedBooksService.findOne(id, req.user.userId);
    return {
      success: true,
      data,
      message: 'Shared book retrieved successfully',
    };
  }

  /**
   * Update shared book
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Update shared book' })
  @ApiResponse({
    status: 200,
    description: 'Shared book updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Shared book not found' })
  async update(@Param('id', ParseUUIDPipe) id: string, @Request() req, @Body() updateDto: UpdateSharedBookDto) {
    const data = await this.sharedBooksService.update(id, req.user.userId, updateDto);
    return {
      success: true,
      data,
      message: 'Shared book updated successfully',
    };
  }

  /**
   * Delete shared book
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete shared book' })
  @ApiResponse({
    status: 204,
    description: 'Shared book deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Shared book not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    await this.sharedBooksService.remove(id, req.user.userId);
  }

  /**
   * Add member to shared book
   */
  @Post(':id/members')
  @ApiOperation({ summary: 'Add member to shared book' })
  @ApiResponse({ status: 201, description: 'Member added successfully' })
  @ApiResponse({ status: 404, description: 'Shared book not found' })
  async addMember(@Param('id', ParseUUIDPipe) id: string, @Request() req, @Body() addMemberDto: AddMemberDto) {
    const data = await this.sharedBooksService.addMember(id, req.user.userId, addMemberDto);
    return {
      success: true,
      data,
      message: 'Member added successfully',
    };
  }

  /**
   * Get all members of a shared book
   */
  @Get(':id/members')
  @ApiOperation({ summary: 'Get all members of shared book' })
  @ApiResponse({ status: 200, description: 'Members retrieved successfully' })
  async getMembers(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    const data = await this.sharedBooksService.getMembers(id, req.user.userId);
    return {
      success: true,
      data,
      message: 'Members retrieved successfully',
    };
  }

  /**
   * Update member role
   */
  @Patch(':id/members/:memberId')
  @ApiOperation({ summary: 'Update member role' })
  @ApiResponse({ status: 200, description: 'Member role updated successfully' })
  async updateMemberRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('memberId', ParseUUIDPipe) memberId: string,
    @Request() req,
    @Body() updateDto: UpdateMemberRoleDto,
  ) {
    const data = await this.sharedBooksService.updateMemberRole(id, memberId, req.user.userId, updateDto);
    return {
      success: true,
      data,
      message: 'Member role updated successfully',
    };
  }

  /**
   * Remove member from shared book
   */
  @Delete(':id/members/:memberId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove member from shared book' })
  @ApiResponse({ status: 204, description: 'Member removed successfully' })
  async removeMember(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('memberId', ParseUUIDPipe) memberId: string,
    @Request() req,
  ) {
    await this.sharedBooksService.removeMember(id, memberId, req.user.userId);
  }

  /**
   * Leave shared book
   */
  @Post(':id/leave')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Leave shared book' })
  @ApiResponse({ status: 200, description: 'Left shared book successfully' })
  async leaveBook(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    await this.sharedBooksService.leaveBook(id, req.user.userId);
    return {
      success: true,
      message: 'Left shared book successfully',
    };
  }
}
