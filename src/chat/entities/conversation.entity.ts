import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Petition } from '../../petitions/entities/petition.entity';

@Entity({ name: 'n_conversation' })
export class Conversation {
  @PrimaryGeneratedColumn({ name: 'id_conversation' })
  idConversation: number;

  @Column({ name: 'created_at', type: 'datetime', nullable: true })
  createdAt: Date;

  // Relación Many-to-One: Una conversación pertenece a una petición
  @ManyToOne(() => Petition)
  @JoinColumn({ name: 'petition_id' })
  petition: Petition;
}