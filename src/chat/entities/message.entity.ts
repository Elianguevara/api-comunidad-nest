import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Conversation } from './conversation.entity';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'n_message' })
export class Message {
  @PrimaryGeneratedColumn({ name: 'id_message' })
  idMessage: number;

  // Relación: Conversación a la que pertenece
  @ManyToOne(() => Conversation)
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversation;

  // Relación: Usuario que envía el mensaje
  @ManyToOne(() => User)
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ name: 'created_at', type: 'datetime', nullable: true })
  createdAt: Date;

  // CORRECCIÓN: Evitar nombre de columna "read" (reservado SQL)
  @Column({ name: 'is_read', type: 'boolean', default: false })
  isRead: boolean;
}