import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { MessageResponseDto } from './dto/chat.response.dto';
import { SocketMessageRequestDto } from './dto/chat.request.dto';

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
  namespace: '/chat',
  cors: { origin: '*' },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly chatService: ChatService,
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
      this.logger.debug(`Cliente desconectado del chat: user:${user.idUser}`);
    }
  }

  @SubscribeMessage('chat.send-message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody(new ValidationPipe({ transform: true, whitelist: true }))
    payload: SocketMessageRequestDto,
  ): Promise<MessageResponseDto> {
    const currentUser = this.getClientUser(client);
    if (!currentUser?.email) {
      throw new WsException('Usuario no autenticado');
    }

    const message = await this.chatService.sendMessage(
      currentUser.email,
      payload.conversationId,
      payload.content,
    );

    const participantIds = await this.chatService.getConversationParticipantIds(
      payload.conversationId,
    );
    this.emitNewMessage(participantIds, payload.conversationId, message);

    return message;
  }

  emitNewMessage(
    participantIds: number[],
    conversationId: number,
    message: MessageResponseDto,
  ): void {
    const payload = { conversationId, message };
    for (const participantId of participantIds) {
      this.server
        .to(this.getUserRoom(participantId))
        .emit('chat.new-message', payload);
    }
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
