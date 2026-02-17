import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Postulation } from './postulation.entity';
import { PostulationState } from './postulation-state.entity';
import { User } from '../../users/entities/user.entity'; 

@Entity({ name: 'n_postulation_state_history' })
export class PostulationStateHistory {
  
  @PrimaryGeneratedColumn({ name: 'id_history' })
  idHistory: number;

  // Relación con la Postulación
  @ManyToOne(() => Postulation)
  @JoinColumn({ name: 'id_postulation' })
  postulation: Postulation;

  // Relación con el Estado asignado
  @ManyToOne(() => PostulationState)
  @JoinColumn({ name: 'id_state' })
  state: PostulationState;

  // Relación con el Usuario que hizo el cambio
  @ManyToOne(() => User)
  @JoinColumn({ name: 'changed_by' })
  changedByUser: User;

  // TypeORM por defecto usa 'varchar' (255 chars). Si en Java permitías textos más largos,
  // es mejor usar type: 'text'
  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;

  // Equivalente a LocalDateTime de Java
  @Column({ name: 'date_change', type: 'datetime', nullable: true })
  dateChange: Date;
}