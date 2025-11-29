import { Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiRoutes } from '../../common/constants';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller(ApiRoutes.NOTIFICATIONS.BASE)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all notifications' })
  @ApiResponse({ status: 200, description: 'List of notifications' })
  async findAll(@Request() req) {
    return await this.notificationsService.findAll(req.user.userId);
  }

  @Get(ApiRoutes.NOTIFICATIONS.UNREAD)
  @ApiOperation({ summary: 'Get unread notifications' })
  @ApiResponse({ status: 200, description: 'List of unread notifications' })
  async findUnread(@Request() req) {
    return await this.notificationsService.findUnread(req.user.userId);
  }

  @Get(ApiRoutes.NOTIFICATIONS.UNREAD_COUNT)
  @ApiOperation({ summary: 'Get unread notification count' })
  @ApiResponse({ status: 200, description: 'Unread count' })
  async getUnreadCount(@Request() req) {
    const count = await this.notificationsService.getUnreadCount(req.user.userId);
    return { count };
  }

  @Patch(`:id/${ApiRoutes.NOTIFICATIONS.READ}`)
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async markAsRead(@Request() req, @Param('id') id: string) {
    return await this.notificationsService.markAsRead(id, req.user.userId);
  }

  @Patch(ApiRoutes.NOTIFICATIONS.READ_ALL)
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  async markAllAsRead(@Request() req): Promise<void> {
    await this.notificationsService.markAllAsRead(req.user.userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete notification' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({ status: 204, description: 'Notification deleted' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async remove(@Request() req, @Param('id') id: string) {
    await this.notificationsService.remove(id, req.user.userId);
  }

  @Delete(`${ApiRoutes.NOTIFICATIONS.READ}/all`)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete all read notifications' })
  @ApiResponse({
    status: 204,
    description: 'All read notifications deleted',
  })
  async deleteAllRead(@Request() req) {
    await this.notificationsService.deleteAllRead(req.user.userId);
  }
}
