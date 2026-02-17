import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Postulation } from '../../postulations/entities/postulation.entity';
import { Petition } from '../../petitions/entities/petition.entity';

@Entity({ name: 'n_notification' })
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'id_user' })
  user: User;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ name: 'notification_type', type: 'varchar', length: 50 })
  notificationType: string;

  @Column({ name: 'is_read', type: 'boolean', default: false })
  isRead: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'read_at', type: 'datetime', nullable: true })
  readAt: Date;

  @ManyToOne(() => Postulation, { nullable: true })
  @JoinColumn({ name: 'related_postulation_id' })
  relatedPostulation: Postulation;

  @ManyToOne(() => Petition, { nullable: true })
  @JoinColumn({ name: 'related_petition_id' })
  relatedPetition: Petition;

  @Column({ type: 'longtext', nullable: true })
  metadata: string; // Aquí guardamos el link/ruta
}