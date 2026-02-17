import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'n_notification_settings' })
export class NotificationSettings {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User)
  @JoinColumn({ name: 'id_user' })
  user: User;

  @Column({ name: 'postulation_created', default: true })
  postulationCreated: boolean;

  @Column({ name: 'postulation_accepted', default: true })
  postulationAccepted: boolean;

  @Column({ name: 'petition_created', default: true })
  petitionCreated: boolean;

  @Column({ name: 'email_notifications', default: true })
  emailNotifications: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}