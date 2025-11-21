import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../../entities/category.entity';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let categoryRepository: Repository<Category>;

  const mockUserId = 'user-123';
  const mockCategoryId = 'category-456';

  const mockCategory: Partial<Category> = {
    id: mockCategoryId,
    userId: mockUserId,
    name: 'Food & Dining',
    type: 2, // EXPENSE
    icon: 'utensils',
    color: '#FF6B6B',
    isDefault: false,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCategoryRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getRepositoryToken(Category),
          useValue: mockCategoryRepository,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    categoryRepository = module.get<Repository<Category>>(getRepositoryToken(Category));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateCategoryDto = {
      name: 'Food & Dining',
      type: 2,
      icon: 'utensils',
      color: '#FF6B6B',
      isActive: true,
    };

    it('should create a new category successfully', async () => {
      mockCategoryRepository.findOne.mockResolvedValue(null);
      mockCategoryRepository.create.mockReturnValue(mockCategory);
      mockCategoryRepository.save.mockResolvedValue(mockCategory);

      const result = await service.create(mockUserId, createDto);

      expect(mockCategoryRepository.findOne).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
          name: createDto.name,
          type: createDto.type,
        },
      });
      expect(mockCategoryRepository.create).toHaveBeenCalledWith({
        ...createDto,
        userId: mockUserId,
        isDefault: false,
      });
      expect(mockCategoryRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockCategory);
    });

    it('should throw BadRequestException when category with same name and type exists', async () => {
      mockCategoryRepository.findOne.mockResolvedValue(mockCategory);

      await expect(service.create(mockUserId, createDto)).rejects.toThrow(BadRequestException);
      await expect(service.create(mockUserId, createDto)).rejects.toThrow(
        'Category with this name and type already exists',
      );
      expect(mockCategoryRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all categories for a user', async () => {
      const mockCategories = [mockCategory, { ...mockCategory, id: 'category-789', name: 'Shopping' }];
      mockCategoryRepository.find.mockResolvedValue(mockCategories);

      const result = await service.findAll(mockUserId);

      expect(mockCategoryRepository.find).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(mockCategories);
      expect(result).toHaveLength(2);
    });

    it('should filter categories by type when type is provided', async () => {
      const expenseCategories = [mockCategory];
      mockCategoryRepository.find.mockResolvedValue(expenseCategories);

      const result = await service.findAll(mockUserId, 2);

      expect(mockCategoryRepository.find).toHaveBeenCalledWith({
        where: { userId: mockUserId, type: 2 },
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(expenseCategories);
    });

    it('should return empty array when user has no categories', async () => {
      mockCategoryRepository.find.mockResolvedValue([]);

      const result = await service.findAll(mockUserId);

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a category when it exists', async () => {
      mockCategoryRepository.findOne.mockResolvedValue(mockCategory);

      const result = await service.findOne(mockUserId, mockCategoryId);

      expect(mockCategoryRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockCategoryId, userId: mockUserId },
      });
      expect(result).toEqual(mockCategory);
    });

    it('should throw NotFoundException when category does not exist', async () => {
      mockCategoryRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(mockUserId, 'non-existent-id')).rejects.toThrow(NotFoundException);
      await expect(service.findOne(mockUserId, 'non-existent-id')).rejects.toThrow('Category not found');
    });
  });

  describe('update', () => {
    const updateDto: UpdateCategoryDto = {
      name: 'Updated Category',
      color: '#00FF00',
    };

    it('should update category successfully', async () => {
      const updatedCategory = { ...mockCategory, ...updateDto };
      mockCategoryRepository.findOne.mockImplementation((options: any) => {
        if (options.where.id === mockCategoryId) return Promise.resolve(mockCategory);
        return Promise.resolve(null);
      });
      mockCategoryRepository.save.mockResolvedValue(updatedCategory);

      const result = await service.update(mockUserId, mockCategoryId, updateDto);

      expect(mockCategoryRepository.save).toHaveBeenCalled();
      expect(result.name).toBe(updateDto.name);
      expect(result.color).toBe(updateDto.color);
    });

    it('should throw BadRequestException when updating default category', async () => {
      const defaultCategory = { ...mockCategory, isDefault: true };
      mockCategoryRepository.findOne.mockResolvedValue(defaultCategory);

      await expect(service.update(mockUserId, mockCategoryId, updateDto)).rejects.toThrow(BadRequestException);
      expect(mockCategoryRepository.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when new name already exists', async () => {
      const existingCategory = { ...mockCategory, id: 'different-id', name: 'Existing Category' };
      const updateDtoWithType = { name: 'Existing Category', type: mockCategory.type };

      let callCount = 0;
      mockCategoryRepository.findOne.mockImplementation(() => {
        callCount++;
        if (callCount === 1) return Promise.resolve(mockCategory);
        return Promise.resolve(existingCategory);
      });

      await expect(service.update(mockUserId, mockCategoryId, updateDtoWithType)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when category does not exist', async () => {
      mockCategoryRepository.findOne.mockResolvedValue(null);

      await expect(service.update(mockUserId, 'non-existent-id', updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft delete category successfully', async () => {
      mockCategoryRepository.findOne.mockResolvedValue(mockCategory);
      mockCategoryRepository.softDelete.mockResolvedValue({ affected: 1 });

      await service.remove(mockUserId, mockCategoryId);

      expect(mockCategoryRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockCategoryId, userId: mockUserId },
      });
      expect(mockCategoryRepository.softDelete).toHaveBeenCalledWith(mockCategoryId);
    });

    it('should throw BadRequestException when deleting default category', async () => {
      const defaultCategory = { ...mockCategory, isDefault: true };
      mockCategoryRepository.findOne.mockResolvedValue(defaultCategory);

      await expect(service.remove(mockUserId, mockCategoryId)).rejects.toThrow(BadRequestException);
      expect(mockCategoryRepository.softDelete).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when category does not exist', async () => {
      mockCategoryRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(mockUserId, 'non-existent-id')).rejects.toThrow(NotFoundException);
      expect(mockCategoryRepository.softDelete).not.toHaveBeenCalled();
    });
  });

  describe('seedDefaultCategories', () => {
    it('should seed default categories for a new user', async () => {
      const savedCategories = [];
      mockCategoryRepository.create.mockImplementation((cat) => cat);
      mockCategoryRepository.save.mockResolvedValue(savedCategories);

      await service.seedDefaultCategories(mockUserId);

      // Verify create was called for each default category (13 categories)
      expect(mockCategoryRepository.create).toHaveBeenCalledTimes(13);
      expect(mockCategoryRepository.save).toHaveBeenCalled();

      // Verify categories are marked as default
      const createCalls = mockCategoryRepository.create.mock.calls;
      createCalls.forEach((call) => {
        expect(call[0].userId).toBe(mockUserId);
        expect(call[0].isDefault).toBe(true);
        expect(call[0].isActive).toBe(true);
      });
    });

    it('should create both income and expense categories', async () => {
      mockCategoryRepository.create.mockImplementation((cat) => cat);
      mockCategoryRepository.save.mockResolvedValue([]);

      await service.seedDefaultCategories(mockUserId);

      const createCalls = mockCategoryRepository.create.mock.calls;
      const incomeCategories = createCalls.filter((call) => call[0].type === 1);
      const expenseCategories = createCalls.filter((call) => call[0].type === 2);

      expect(incomeCategories.length).toBeGreaterThan(0);
      expect(expenseCategories.length).toBeGreaterThan(0);
    });
  });
});
