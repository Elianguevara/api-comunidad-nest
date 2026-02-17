import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Body, 
  Param, 
  UseGuards, 
  Request, 
  ParseIntPipe 
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { StartConversationRequestDto, MessageRequestDto } from './dto/chat.request.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('v1/chat/conversations')
@UseGuards(AuthGuard('jwt'))
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // 1. Obtener o crear chat
  @Post()
  startConversation(@Request() req, @Body() request: StartConversationRequestDto) {
    return this.chatService.createOrGetConversation(req.user.email, request.petitionId, request.providerId);
  }

  // 2. Mis conversaciones (Bandeja de entrada)
  @Get()
  getMyConversations(@Request() req) {
    return this.chatService.getUserConversations(req.user.email);
  }

  // 3. Ver historial de mensajes de un chat específico
  @Get(':conversationId/messages')
  getMessages(@Request() req, @Param('conversationId', ParseIntPipe) conversationId: number) {
    return this.chatService.getConversationMessages(req.user.email, conversationId);
  }

  // 4. Enviar mensaje
  @Post(':conversationId/messages')
  sendMessage(
    @Request() req,
    @Param('conversationId', ParseIntPipe) conversationId: number,
    @Body() request: MessageRequestDto
  ) {
    return this.chatService.sendMessage(req.user.email, conversationId, request.content);
  }

  // 5. Marcar mensajes de una conversación como leídos
  @Put(':conversationId/read')
  async markAsRead(@Request() req, @Param('conversationId', ParseIntPipe) conversationId: number) {
    await this.chatService.markMessagesAsRead(req.user.email, conversationId);
    return { message: "Mensajes marcados como leídos" }; // El frontend suele esperar un 200 OK con o sin body
  }
}