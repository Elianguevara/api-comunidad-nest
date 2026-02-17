import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { User } from '../users/entities/user.entity';
import { Provider } from '../users/entities/provider.entity';
import { Petition } from '../petitions/entities/petition.entity';
import { Postulation } from '../postulations/entities/postulation.entity';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Provider) private providerRepo: Repository<Provider>,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  // --- Lógica de Creación (Triggered from other services) ---

  async notifyNewPostulation(petition: Petition) {
    const clientUser = petition.customer.user;
    await this.createNotification(
      clientUser,
      'Nueva Postulación',
      `Un proveedor ha enviado un presupuesto para: ${petition.profession?.name || 'tu solicitud'}`,
      'INFO',
      `/petition/${petition.idPetition}`,
      petition,
    );
  }

  async notifyPostulationAccepted(postulation: Postulation) {
    const providerUser = postulation.provider.user;
    await this.createNotification(
      providerUser,
      '¡Presupuesto Aceptado!',
      `Felicidades, han aceptado tu trabajo para: ${postulation.petition.description}`,
      'SUCCESS',
      '/feed',
      postulation.petition,
      postulation,
    );
  }

  async notifyProvidersByProfessionAndCity(
    idProfession: number,
    idCity: number,
    petition: Petition,
  ) {
    // Buscamos proveedores que coincidan (Lógica de Java)
    const candidates = await this.providerRepo.find({
      where: {
        profession: { idProfession },
        providerCities: { cityId: idCity },
      },
      relations: ['user'],
    });

    for (const provider of candidates) {
      if (provider.user.idUser !== petition.customer.user.idUser) {
        await this.createNotification(
          provider.user,
          'Nueva Oportunidad Laboral',
          `Se busca ${petition.profession?.name} en ${petition.city?.name}`,
          'INFO',
          `/petition/${petition.idPetition}`,
          petition,
        );
      }
    }
  }

  // --- Métodos del Controlador (User Actions) ---

  async getMyNotifications(email: string, page: number, size: number) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const [notifications, total] = await this.notificationRepo.findAndCount({
      where: { user: { idUser: user.idUser } },
      order: { createdAt: 'DESC' },
      skip: page * size,
      take: size,
    });

    return {
      content: notifications.map((n) => this.mapToResponse(n)),
      totalElements: total,
      totalPages: Math.ceil(total / size),
    };
  }

  async getUnreadCount(email: string): Promise<number> {
    const user = await this.userRepo.findOne({ where: { email } });
    return this.notificationRepo.count({
      where: { user: { idUser: user?.idUser }, isRead: false },
    });
  }

  async markAsRead(id: number, email: string) {
    const notification = await this.notificationRepo.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!notification)
      throw new NotFoundException('Notificación no encontrada');
    if (notification.user.email !== email)
      throw new ForbiddenException('No tienes permiso');

    notification.isRead = true;
    notification.readAt = new Date();
    await this.notificationRepo.save(notification);

    await this.emitUnreadCount(notification.user.idUser);
  }

  async markAllAsRead(email: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) return;

    await this.notificationRepo.update(
      { user: { idUser: user.idUser }, isRead: false },
      { isRead: true, readAt: new Date() },
    );

    await this.emitUnreadCount(user.idUser);
  }
  async notifyPostulationRejected(postulation: Postulation) {
    const providerUser = postulation.provider.user;
    await this.createNotification(
      providerUser,
      'Postulación Finalizada',
      `El cliente ha seleccionado a otro profesional para: ${postulation.petition.description}`,
      'WARNING',
      '/feed', // O la ruta que prefieras en tu frontend
      postulation.petition,
      postulation,
    );
  }

  // --- Helpers ---

  private async createNotification(
    user: User,
    title: string,
    message: string,
    type: string,
    link: string,
    petition?: Petition,
    postulation?: Postulation,
  ) {
    const notification = this.notificationRepo.create({
      user,
      title,
      message,
      notificationType: type,
      metadata: link,
      relatedPetition: petition,
      relatedPostulation: postulation,
      isRead: false,
    });

    const savedNotification = await this.notificationRepo.save(notification);
    this.notificationsGateway.emitNewNotification(
      user.idUser,
      this.mapToResponse(savedNotification),
    );
    await this.emitUnreadCount(user.idUser);

    return savedNotification;
  }

  private async emitUnreadCount(userId: number): Promise<void> {
    const unreadCount = await this.notificationRepo.count({
      where: { user: { idUser: userId }, isRead: false },
    });

    this.notificationsGateway.emitUnreadCount(userId, unreadCount);
  }

  private mapToResponse(n: Notification): any {
    return {
      idNotification: n.id,
      title: n.title,
      message: n.message,
      notificationType: n.notificationType,
      isRead: n.isRead,
      createdAt: n.createdAt,
      readAt: n.readAt,
      metadata: n.metadata,
    };
  }
}
