import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';

import { Conversation } from './entities/conversation.entity';
import { ConversationParticipant } from './entities/conversation-participant.entity';
import { Message } from './entities/message.entity';
import { User } from '../users/entities/user.entity';
import { Provider } from '../users/entities/provider.entity';
import { Petition } from '../petitions/entities/petition.entity';
import { Postulation } from '../postulations/entities/postulation.entity';
import { UserRole } from '../users/entities/user-role.entity';

import { ConversationResponseDto, MessageResponseDto } from './dto/chat.response.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Conversation) private conversationRepo: Repository<Conversation>,
    @InjectRepository(ConversationParticipant) private participantRepo: Repository<ConversationParticipant>,
    @InjectRepository(Message) private messageRepo: Repository<Message>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Petition) private petitionRepo: Repository<Petition>,
    @InjectRepository(Provider) private providerRepo: Repository<Provider>,
    @InjectRepository(Postulation) private postulationRepo: Repository<Postulation>,
    @InjectRepository(UserRole) private userRoleRepo: Repository<UserRole>,
  ) {}

  private async isConversationActive(conversation: Conversation): Promise<boolean> {
    const petition = conversation.petition;
    if (!petition || !petition.state) return false;

    const state = petition.state.name.toUpperCase();

    if (state === 'FINALIZADA' || state === 'CANCELADA') return false;

    if (state === 'ADJUDICADA') {
      const winnerPostulation = await this.postulationRepo.findOne({
        where: { petition: { idPetition: petition.idPetition }, winner: true },
        relations: ['provider', 'provider.user']
      });

      if (winnerPostulation && winnerPostulation.provider?.user) {
        const winnerUserId = winnerPostulation.provider.user.idUser;
        const isWinnerInChat = await this.participantRepo.count({
          where: { conversation: { idConversation: conversation.idConversation }, user: { idUser: winnerUserId } }
        });
        return isWinnerInChat > 0;
      }
      return false;
    }

    return true; 
  }

  async createOrGetConversation(email: string, petitionId: number, providerId: number): Promise<ConversationResponseDto> {
    const currentUser = await this.userRepo.findOne({ where: { email } });
    if (!currentUser) throw new NotFoundException('Usuario no encontrado');

    const provider = await this.providerRepo.findOne({ where: { idProvider: providerId }, relations: ['user'] });
    if (!provider) throw new NotFoundException('Proveedor no encontrado');

    const targetUser = provider.user;

    const petition = await this.petitionRepo.findOne({ where: { idPetition: petitionId }, relations: ['state'] });
    if (!petition) throw new NotFoundException('Petición no encontrada');

    let conversation = await this.conversationRepo.createQueryBuilder('c')
      .innerJoin('n_conversation_participants', 'cp1', 'cp1.conversation_id = c.id_conversation AND cp1.user_id = :userId', { userId: currentUser.idUser })
      .innerJoin('n_conversation_participants', 'cp2', 'cp2.conversation_id = c.id_conversation AND cp2.user_id = :targetId', { targetId: targetUser.idUser })
      .where('c.petition_id = :petitionId', { petitionId })
      .getOne();

    if (!conversation) {
      conversation = this.conversationRepo.create({
        petition,
        createdAt: new Date(),
      });
      conversation = await this.conversationRepo.save(conversation);

      const p1 = this.participantRepo.create({ conversation, user: currentUser });
      const p2 = this.participantRepo.create({ conversation, user: targetUser });
      await this.participantRepo.save([p1, p2]);
    }

    conversation.petition = petition;
    return this.mapToConversationResponse(conversation, currentUser.idUser);
  }

  async sendMessage(email: string, conversationId: number, content: string): Promise<MessageResponseDto> {
    const currentUser = await this.userRepo.findOne({ where: { email } });
    if (!currentUser) throw new NotFoundException('Usuario no encontrado'); // <-- CORRECCIÓN

    const isParticipant = await this.participantRepo.count({
      where: { conversation: { idConversation: conversationId }, user: { idUser: currentUser.idUser } }
    });
    if (isParticipant === 0) throw new ForbiddenException("No tienes permiso para enviar mensajes en esta conversación.");

    const conversation = await this.conversationRepo.findOne({ 
      where: { idConversation: conversationId },
      relations: ['petition', 'petition.state']
    });
    if (!conversation) throw new NotFoundException("Conversación no encontrada");

    const isActive = await this.isConversationActive(conversation);
    if (!isActive) throw new BadRequestException("Esta conversación ha sido cerrada. La solicitud finalizó o fue adjudicada a otro proveedor.");

    const message = this.messageRepo.create({
      conversation,
      sender: currentUser, // Como currentUser ya no puede ser nulo, TypeORM lo acepta
      content,
      createdAt: new Date(),
      isRead: false,
    });

    const savedMsg = await this.messageRepo.save(message);
    return this.mapToMessageResponse(savedMsg, currentUser.idUser);
  }

  async getUserConversations(email: string): Promise<ConversationResponseDto[]> {
    const currentUser = await this.userRepo.findOne({ where: { email } });
    if (!currentUser) throw new NotFoundException('Usuario no encontrado');

    const participants = await this.participantRepo.find({
      where: { user: { idUser: currentUser.idUser } },
      relations: ['conversation', 'conversation.petition', 'conversation.petition.state']
    });

    // CORRECCIÓN: Filtramos los que tengan conversación nula para evitar el error de idConversation
    const validParticipants = participants.filter(p => p.conversation && p.conversation.petition);

    const responses = await Promise.all(
      validParticipants.map(p => this.mapToConversationResponse(p.conversation, currentUser.idUser))
    );

    return responses.sort((a, b) => {
      const dateA = a.updatedAt instanceof Date ? a.updatedAt.getTime() : 0;
      const dateB = b.updatedAt instanceof Date ? b.updatedAt.getTime() : 0;
      return dateB - dateA;
    });
  }

  async getConversationMessages(email: string, conversationId: number): Promise<MessageResponseDto[]> {
    const currentUser = await this.userRepo.findOne({ where: { email } });
    if (!currentUser) throw new NotFoundException('Usuario no encontrado'); // <-- CORRECCIÓN

    const isParticipant = await this.participantRepo.count({
      where: { conversation: { idConversation: conversationId }, user: { idUser: currentUser.idUser } }
    });
    if (isParticipant === 0) throw new ForbiddenException("Acceso denegado a esta conversación.");

    const messages = await this.messageRepo.find({
      where: { conversation: { idConversation: conversationId } },
      relations: ['sender'],
      order: { createdAt: 'ASC' }
    });

    return messages.map(m => this.mapToMessageResponse(m, currentUser.idUser));
  }

  async markMessagesAsRead(email: string, conversationId: number): Promise<void> {
    const currentUser = await this.userRepo.findOne({ where: { email } });
    if (!currentUser) throw new NotFoundException('Usuario no encontrado'); // <-- CORRECCIÓN

    const isParticipant = await this.participantRepo.count({
      where: { conversation: { idConversation: conversationId }, user: { idUser: currentUser.idUser } }
    });
    if (isParticipant === 0) throw new ForbiddenException("Acceso denegado a esta conversación.");

    const unreadMessages = await this.messageRepo.find({
      where: {
        conversation: { idConversation: conversationId },
        sender: { idUser: Not(currentUser.idUser) }, 
        isRead: false
      }
    });

    if (unreadMessages.length > 0) {
      unreadMessages.forEach(m => m.isRead = true);
      await this.messageRepo.save(unreadMessages);
    }
  }

  // --- Mapeadores ---
  private async mapToConversationResponse(c: Conversation, myUserId: number): Promise<ConversationResponseDto> {
    // Si por alguna razón entra una conversación nula, lanzamos error controlado
    if (!c) throw new Error("Conversación no válida");

    const otherParticipantRow = await this.participantRepo.findOne({
      where: { 
        conversation: { idConversation: c.idConversation }, 
        user: { idUser: Not(myUserId) } 
      },
      relations: ['user']
    });
    const otherUser = otherParticipantRow?.user;

    let roleName = "CUSTOMER";
    if (otherUser) {
      const userRoles = await this.userRoleRepo.find({
        where: { user: { idUser: otherUser.idUser } },
        relations: ['role']
      });
      if (userRoles && userRoles.length > 0 && userRoles[0].role) {
        roleName = userRoles[0].role.name.replace('ROLE_', '');
      }
    }

    const lastMessage = await this.messageRepo.findOne({
      where: { conversation: { idConversation: c.idConversation } },
      order: { createdAt: 'DESC' }
    });

    const unreadCount = await this.messageRepo.count({
      where: { 
        conversation: { idConversation: c.idConversation },
        sender: { idUser: Not(myUserId) },
        isRead: false
      }
    });

    const isReadOnly = !(await this.isConversationActive(c));

    return {
      idConversation: c.idConversation,
      petitionId: c.petition?.idPetition || 0,
      petitionTitle: c.petition?.description || "Sin título",
      otherParticipantId: otherUser ? otherUser.idUser : null,
      otherParticipantName: otherUser ? `${otherUser.name} ${otherUser.lastname}`.trim() : "Usuario Desconocido",
      otherParticipantRole: roleName,
      otherParticipantImage: otherUser ? otherUser.profileImage : null,
      lastMessage: lastMessage ? lastMessage.content : "",
      updatedAt: lastMessage ? lastMessage.createdAt : (c.createdAt || new Date()),
      unreadCount,
      isReadOnly,
    };
  }

  private mapToMessageResponse(m: Message, myUserId: number): MessageResponseDto {
    return {
      idMessage: m.idMessage,
      content: m.content,
      sentAt: m.createdAt,
      senderId: m.sender.idUser,
      senderName: m.sender.name,
      isMine: m.sender.idUser === myUserId,
    };
  }
}