import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Conversation } from './conversation.entity';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'n_conversation_participants' })
export class ConversationParticipant {
  @PrimaryGeneratedColumn()
  id: number;

  // Vincula con la entidad Conversation
  @ManyToOne(() => Conversation)
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversation;

  // Vincula con la entidad User
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}