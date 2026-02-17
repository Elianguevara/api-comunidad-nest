import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Petition } from './petition.entity';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'n_petition_attachment' })
export class PetitionAttachment {
  @PrimaryGeneratedColumn({ name: 'id_petition_attachment' })
  idPetitionAttachment: number;

  @ManyToOne(() => Petition)
  @JoinColumn({ name: 'id_petition' })
  petition: Petition;

  @Column({ type: 'varchar', length: 255, nullable: true })
  url: string;

  // --- Auditoría ---
  @ManyToOne(() => User)
  @JoinColumn({ name: 'id_user_create' })
  userCreate: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'id_user_update' })
  userUpdate: User;

  @Column({ name: 'date_create', type: 'datetime', nullable: true })
  dateCreate: Date;

  @Column({ name: 'date_update', type: 'datetime', nullable: true })
  dateUpdate: Date;
}