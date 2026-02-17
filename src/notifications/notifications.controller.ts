import { Controller, Get, Put, Param, Query, UseGuards, Request, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
export class NotificationsController {
  constructor(private readonly notificationService: NotificationsService) {}

  @Get()
  getMyNotifications(
    @Request() req,
    @Query('page', new DefaultValuePipe(0), ParseIntPipe) page: number,
    @Query('size', new DefaultValuePipe(20), ParseIntPipe) size: number,
  ) {
    return this.notificationService.getMyNotifications(req.user.email, page, size);
  }

  @Get('unread-count')
  getUnreadCount(@Request() req) {
    return this.notificationService.getUnreadCount(req.user.email);
  }

  @Put(':id/read')
  async markAsRead(@Request() req, @Param('id', ParseIntPipe) id: number) {
    await this.notificationService.markAsRead(id, req.user.email);
    return { message: "Leída" };
  }

  @Put('read-all')
  async markAllAsRead(@Request() req) {
    await this.notificationService.markAllAsRead(req.user.email);
    return { message: "Todas marcadas como leídas" };
  }
}