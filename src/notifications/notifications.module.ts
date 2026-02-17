import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { Notification } from './entities/notification.entity';
import { NotificationSettings } from './entities/notification-settings.entity';
import { User } from '../users/entities/user.entity';
import { Provider } from '../users/entities/provider.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Notification, 
      NotificationSettings, 
      User, 
      Provider
    ])
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService], // <-- Crucial para que Petitions y Postulations lo usen
})
export class NotificationsModule {}