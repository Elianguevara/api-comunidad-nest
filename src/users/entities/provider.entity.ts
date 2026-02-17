import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { User } from './user.entity';
import { Profession } from '../../metadata/entities/profession.entity';
import { City } from '../../metadata/entities/city.entity';
import { Address } from './address.entity'; // <-- 1. IMPORTAR

@Entity('n_provider')
export class Provider {
  @PrimaryGeneratedColumn({ name: 'id_provider' })
  idProvider: number;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'idUser' })
  user: User;

  // <-- 2. AGREGAR LA RELACIÓN CON LA DIRECCIÓN
  @OneToOne(() => Address, { cascade: true, nullable: true })
  @JoinColumn({ name: 'address_id' })
  address: Address;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => Profession, { nullable: true })
  @JoinColumn({ name: 'id_profession' })
  profession: Profession;

  @ManyToMany(() => City)
  @JoinTable({
    name: 'n_provider_city',
    joinColumn: { name: 'id_provider', referencedColumnName: 'idProvider' },
    inverseJoinColumn: { name: 'id_city', referencedColumnName: 'idCity' }
  })
  cities: City[];
}