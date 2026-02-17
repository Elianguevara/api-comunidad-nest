import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

type WsJwtPayload = {
  sub: number;
  email: string;
  role?: string;
};

type WsAuthenticatedUser = {
  idUser: number;
  email: string;
  role?: string;
};

@WebSocketGateway({
  namespace: '/notifications',
  cors: { origin: '*' },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    try {
      const user = await this.authenticateClient(client);
      const socketData = client.data as { user?: WsAuthenticatedUser };
      socketData.user = user;
      await client.join(this.getUserRoom(user.idUser));
    } catch (error) {
      const message =
        error instanceof WsException ? error.message : 'No autorizado';
      client.emit('auth.error', { message });
      void client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket): void {
    const user = this.getClientUser(client);
    if (user?.idUser) {
      this.logger.debug(
        `Cliente desconectado de notificaciones: user:${user.idUser}`,
      );
    }
  }

  emitNewNotification(userId: number, notification: unknown): void {
    this.server
      .to(this.getUserRoom(userId))
      .emit('notifications.new', notification);
  }

  emitUnreadCount(userId: number, unreadCount: number): void {
    this.server
      .to(this.getUserRoom(userId))
      .emit('notifications.unread-count', { unreadCount });
  }

  private async authenticateClient(
    client: Socket,
  ): Promise<WsAuthenticatedUser> {
    const token = this.extractToken(client);
    if (!token) {
      throw new WsException('Token JWT no proporcionado');
    }

    const secret =
      this.configService.get<string>('JWT_SECRET') ||
      'tu_clave_super_secreta_aqui';

    try {
      const payload = await this.jwtService.verifyAsync<WsJwtPayload>(token, {
        secret,
      });

      if (!payload?.sub || !payload?.email) {
        throw new WsException('Token JWT inválido');
      }

      return {
        idUser: payload.sub,
        email: payload.email,
        role: payload.role,
      };
    } catch {
      throw new WsException('Token JWT inválido o expirado');
    }
  }

  private extractToken(client: Socket): string | null {
    const fromAuth =
      typeof client.handshake.auth?.token === 'string'
        ? client.handshake.auth.token
        : null;

    const rawHeader = client.handshake.headers.authorization;
    const fromHeader =
      typeof rawHeader === 'string'
        ? rawHeader
        : Array.isArray(rawHeader)
          ? rawHeader[0]
          : null;

    const token = fromAuth || fromHeader;
    if (!token) {
      return null;
    }

    return token.startsWith('Bearer ') ? token.slice(7) : token;
  }

  private getUserRoom(userId: number): string {
    return `user:${userId}`;
  }

  private getClientUser(client: Socket): WsAuthenticatedUser | undefined {
    const socketData = client.data as { user?: WsAuthenticatedUser };
    return socketData.user;
  }
}
