import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TypePetition } from './type-petition.entity'; // Asumo que lo tienes
import { Customer } from '../../users/entities/customer.entity';
import { City } from '../../metadata/entities/city.entity';
import { Profession } from '../../metadata/entities/profession.entity';
import { PetitionState } from './petition-state.entity';

@Entity({ name: 'n_petition' })
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

  // Si tienes la entidad TypeProvider, puedes descomentarla:
  // @ManyToOne(() => TypeProvider)
  // @JoinColumn({ name: 'id_type_provider' })
  // typeProvider: TypeProvider;

  @ManyToOne(() => PetitionState)
  @JoinColumn({ name: 'id_state' })
  state: PetitionState;

  @Column({ name: 'date_since', type: 'datetime', nullable: true })
  dateSince: Date;

  @Column({ name: 'date_until', type: 'date', nullable: true })
  dateUntil: Date;

  @Column({ name: 'is_deleted', type: 'boolean', default: false })
  isDeleted: boolean;
}
