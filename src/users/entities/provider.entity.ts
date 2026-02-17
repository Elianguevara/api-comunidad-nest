import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from './user.entity';
// Importa estas según tu estructura real:
import { TypeProvider } from '../../metadata/entities/type-provider.entity';
import { Profession } from '../../metadata/entities/profession.entity';
import { Address } from './address.entity';
import { ProviderCategory } from './provider-category.entity';
import { ProviderCity } from './provider-city.entity';

@Entity({ name: 'n_provider' })
export class Provider {
  @PrimaryGeneratedColumn({ name: 'id_provider' })
  idProvider: number;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'idUser' })
  user: User;

  @ManyToOne(() => TypeProvider)
  @JoinColumn({ name: 'id_type_provider' })
  typeProvider: TypeProvider;

  @ManyToOne(() => Profession)
  @JoinColumn({ name: 'id_profession' })
  profession: Profession;

  @OneToOne(() => Address)
  @JoinColumn({ name: 'address_id' })
  address: Address;

  @Column({ type: 'text', nullable: true })
  description: string;

  // Relaciones Inversas (Igual que en Java)
  @OneToMany(() => ProviderCategory, pc => pc.provider)
  providerCategories: ProviderCategory[];

  @OneToMany(() => ProviderCity, pc => pc.provider)
  providerCities: ProviderCity[];
}