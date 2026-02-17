export class NotificationResponseDto {
  idNotification: number;
  title: string;
  message: string;
  notificationType: string;
  isRead: boolean;
  createdAt: Date;
  readAt: Date | null;
  metadata: string | null;
}