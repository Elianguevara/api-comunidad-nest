import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  JoinColumn, 
  CreateDateColumn, 
  UpdateDateColumn 
} from 'typeorm';
import { Petition } from '../../petitions/entities/petition.entity';
import { Provider } from '../../users/entities/provider.entity';
import { PostulationState } from './postulation-state.entity'; // Esta entidad la crearemos luego

@Entity({ name: 'n_postulation' }) // Mapeo exacto de @Table(name = "n_postulation")
export class Postulation {
  
  @PrimaryGeneratedColumn({ name: 'id_postulation' })
  idPostulation: number;

  @ManyToOne(() => Petition)
  @JoinColumn({ name: 'id_petition' }) // Fundamental para no generar columnas duplicadas
  petition: Petition;

  @ManyToOne(() => Provider)
  @JoinColumn({ name: 'id_provider' })
  provider: Provider;

  @Column({ name: 'winner', type: 'boolean', nullable: true })
  winner: boolean;

  @Column({ name: 'proposal', type: 'text', nullable: true })
  proposal: string;

  @ManyToOne(() => PostulationState)
  @JoinColumn({ name: 'id_state' })
  state: PostulationState;

  @Column({ name: 'current', type: 'varchar', length: 255, nullable: true })
  current: string;

  @Column({ name: 'is_deleted', type: 'boolean', default: false })
  isDeleted: boolean;

  // --- Herencia de AuditableEntity ---
  // NestJS/TypeORM no tiene AuditableEntity por defecto, lo resolvemos con decoradores nativos:
  @CreateDateColumn({ name: 'created_date', nullable: true })
  createdDate: Date;

  @UpdateDateColumn({ name: 'last_modified_date', nullable: true })
  lastModifiedDate: Date;
}