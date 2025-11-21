import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../../entities/notification.entity';
import { CreateNotificationDto } from './dto';
import { NotificationsService } from './notifications.service';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let notificationRepository: Repository<Notification>;

  const mockNotificationRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    delete: jest.fn(),
  };

  const mockNotification = {
    id: 'notif-id-1',
    userId: 'user-id-1',
    title: 'Test Notification',
    message: 'Test message',
    type: 1,
    isRead: false,
    readAt: null,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: getRepositoryToken(Notification),
          useValue: mockNotificationRepository,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    notificationRepository = module.get<Repository<Notification>>(getRepositoryToken(Notification));

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a notification successfully', async () => {
      const userId = 'user-id-1';
      const createDto: CreateNotificationDto = {
        title: 'Budget Alert',
        message: 'You have exceeded 80% of your budget',
        type: 1,
      };

      mockNotificationRepository.create.mockReturnValue({
        ...mockNotification,
        ...createDto,
      });
      mockNotificationRepository.save.mockResolvedValue({
        ...mockNotification,
        ...createDto,
      });

      const result = await service.create(userId, createDto);

      expect(result.title).toBe(createDto.title);
      expect(result.isRead).toBe(false);
      expect(mockNotificationRepository.create).toHaveBeenCalledWith({
        userId,
        ...createDto,
        isRead: false,
      });
      expect(mockNotificationRepository.save).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all notifications for user', async () => {
      const userId = 'user-id-1';
      const mockNotifications = [
        { ...mockNotification, id: 'notif-1' },
        { ...mockNotification, id: 'notif-2' },
      ];

      mockNotificationRepository.find.mockResolvedValue(mockNotifications);

      const result = await service.findAll(userId);

      expect(result).toEqual(mockNotifications);
      expect(mockNotificationRepository.find).toHaveBeenCalledWith({
        where: { userId },
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('findUnread', () => {
    it('should return only unread notifications', async () => {
      const userId = 'user-id-1';
      const mockUnreadNotifications = [{ ...mockNotification, id: 'notif-1', isRead: false }];

      mockNotificationRepository.find.mockResolvedValue(mockUnreadNotifications);

      const result = await service.findUnread(userId);

      expect(result).toEqual(mockUnreadNotifications);
      expect(mockNotificationRepository.find).toHaveBeenCalledWith({
        where: { userId, isRead: false },
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('getUnreadCount', () => {
    it('should return count of unread notifications', async () => {
      const userId = 'user-id-1';
      mockNotificationRepository.count.mockResolvedValue(5);

      const result = await service.getUnreadCount(userId);

      expect(result).toBe(5);
      expect(mockNotificationRepository.count).toHaveBeenCalledWith({
        where: { userId, isRead: false },
      });
    });

    it('should return 0 when no unread notifications', async () => {
      const userId = 'user-id-1';
      mockNotificationRepository.count.mockResolvedValue(0);

      const result = await service.getUnreadCount(userId);

      expect(result).toBe(0);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      const notifId = 'notif-id-1';
      const userId = 'user-id-1';

      mockNotificationRepository.findOne.mockResolvedValue(mockNotification);
      mockNotificationRepository.save.mockResolvedValue({
        ...mockNotification,
        isRead: true,
        readAt: expect.any(Date),
      });

      const result = await service.markAsRead(notifId, userId);

      expect(result.isRead).toBe(true);
      expect(result.readAt).toBeDefined();
      expect(mockNotificationRepository.findOne).toHaveBeenCalledWith({
        where: { id: notifId, userId },
      });
      expect(mockNotificationRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when notification not found', async () => {
      const notifId = 'non-existent-id';
      const userId = 'user-id-1';

      mockNotificationRepository.findOne.mockResolvedValue(null);

      await expect(service.markAsRead(notifId, userId)).rejects.toThrow(NotFoundException);
      await expect(service.markAsRead(notifId, userId)).rejects.toThrow('Notification not found');
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all unread notifications as read', async () => {
      const userId = 'user-id-1';

      mockNotificationRepository.update.mockResolvedValue({ affected: 3 });

      await service.markAllAsRead(userId);

      expect(mockNotificationRepository.update).toHaveBeenCalledWith(
        { userId, isRead: false },
        { isRead: true, readAt: expect.any(Date) },
      );
    });
  });

  describe('remove', () => {
    it('should delete notification successfully', async () => {
      const notifId = 'notif-id-1';
      const userId = 'user-id-1';

      mockNotificationRepository.findOne.mockResolvedValue(mockNotification);
      mockNotificationRepository.remove.mockResolvedValue(mockNotification);

      await service.remove(notifId, userId);

      expect(mockNotificationRepository.findOne).toHaveBeenCalledWith({
        where: { id: notifId, userId },
      });
      expect(mockNotificationRepository.remove).toHaveBeenCalledWith(mockNotification);
    });

    it('should throw NotFoundException when notification not found', async () => {
      const notifId = 'non-existent-id';
      const userId = 'user-id-1';

      mockNotificationRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(notifId, userId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteAllRead', () => {
    it('should delete all read notifications', async () => {
      const userId = 'user-id-1';

      mockNotificationRepository.delete.mockResolvedValue({ affected: 5 });

      await service.deleteAllRead(userId);

      expect(mockNotificationRepository.delete).toHaveBeenCalledWith({
        userId,
        isRead: true,
      });
    });
  });
});
