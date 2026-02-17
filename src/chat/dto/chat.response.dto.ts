export class ConversationResponseDto {
  idConversation: number;
  petitionId: number;
  petitionTitle: string;
  otherParticipantId: number | null;
  otherParticipantName: string;
  otherParticipantRole: string;
  otherParticipantImage: string | null;
  lastMessage: string;
  updatedAt: Date;
  unreadCount: number;
  isReadOnly: boolean; // Fundamental para que React bloquee el input de texto
}

export class MessageResponseDto {
  idMessage: number;
  content: string;
  sentAt: Date; // Usamos sentAt para coincidir con el frontend
  senderId: number;
  senderName: string;
  isMine: boolean;
}