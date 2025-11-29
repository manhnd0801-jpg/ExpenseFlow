import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { ApiRoutes } from '../../common/constants';
import { GetUser } from '../../common/decorators';
import { apiResponseSchema } from '../../common/dto';
import { JwtAuthGuard } from '../../common/guards';
import { CategoriesService } from './categories.service';
import { CategoryResponseDto, CreateCategoryDto, UpdateCategoryDto } from './dto';

@ApiTags('Categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller(ApiRoutes.CATEGORIES.BASE)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({
    status: 201,
    description: 'Category created successfully',
    ...apiResponseSchema(CategoryResponseDto),
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(
    @GetUser('id') userId: string,
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryResponseDto> {
    const category = await this.categoriesService.create(userId, createCategoryDto);

    return plainToInstance(CategoryResponseDto, category, {
      excludeExtraneousValues: true,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({
    status: 200,
    description: 'Categories retrieved successfully',
    type: [CategoryResponseDto],
  })
  async findAll(@GetUser('id') userId: string, @Query('type') type?: number): Promise<CategoryResponseDto[]> {
    const categories = await this.categoriesService.findAll(userId, type);

    return plainToInstance(CategoryResponseDto, categories, {
      excludeExtraneousValues: true,
    }) as any;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiResponse({
    status: 200,
    description: 'Category retrieved successfully',
    ...apiResponseSchema(CategoryResponseDto),
  })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async findOne(@GetUser('id') userId: string, @Param('id') id: string): Promise<CategoryResponseDto> {
    const category = await this.categoriesService.findOne(userId, id);

    return plainToInstance(CategoryResponseDto, category, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a category' })
  @ApiResponse({
    status: 200,
    description: 'Category updated successfully',
    ...apiResponseSchema(CategoryResponseDto),
  })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({ status: 400, description: 'Cannot update default categories' })
  async update(
    @GetUser('id') userId: string,
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    const category = await this.categoriesService.update(userId, id, updateCategoryDto);

    return plainToInstance(CategoryResponseDto, category, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a category' })
  @ApiResponse({
    status: 204,
    description: 'Category deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({ status: 400, description: 'Cannot delete default categories' })
  async remove(@GetUser('id') userId: string, @Param('id') id: string): Promise<void> {
    await this.categoriesService.remove(userId, id);
  }
}
