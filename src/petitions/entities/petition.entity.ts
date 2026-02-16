import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

// Importamos las entidades de este mismo módulo
import { TypePetition } from './type-petition.entity';
import { PetitionState } from './petition-state.entity';

// Importamos las dependencias de otros módulos
import { Customer } from '../../users/entities/customer.entity';
import { City } from '../../metadata/entities/city.entity';
import { Profession } from '../../metadata/entities/profession.entity';
import { TypeProvider } from '../../metadata/entities/type-provider.entity';

@Entity('n_petition')
export class Petition {
  @PrimaryGeneratedColumn({ name: 'id_petition' })
  idPetition: number;

  @ManyToOne(() => TypePetition)
  @JoinColumn({ name: 'id_type_petition' })
  typePetition: TypePetition;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'id_customer' })
  customer: Customer;

  @ManyToOne(() => City)
  @JoinColumn({ name: 'id_city' })
  city: City;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => Profession)
  @JoinColumn({ name: 'id_profession' })
  profession: Profession;

  @ManyToOne(() => TypeProvider)
  @JoinColumn({ name: 'id_type_provider' })
  typeProvider: TypeProvider;

  @ManyToOne(() => PetitionState)
  @JoinColumn({ name: 'id_state' })
  state: PetitionState;

  // En MySQL, LocalDate de Java se mapea como 'date'
  @Column({ name: 'date_since', type: 'date', nullable: true })
  dateSince: Date;

  @Column({ name: 'date_until', type: 'date', nullable: true })
  dateUntil: Date;

  @Column({ name: 'is_deleted', default: false })
  isDeleted: boolean;

  // Estos dos campos reemplazan tu "AuditableEntity" de Java
  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date;
}