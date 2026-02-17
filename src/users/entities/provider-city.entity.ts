import { Entity, ManyToOne, JoinColumn, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Provider } from './provider.entity';
import { City } from '../../metadata/entities/city.entity';

@Entity({ name: 'n_provider_city' })
export class ProviderCity {
  // Las dos claves primarias forman la clave compuesta
  @PrimaryColumn({ name: 'id_provider' })
  providerId: number;

  @PrimaryColumn({ name: 'id_city' })
  cityId: number;

  @ManyToOne(() => Provider, provider => provider.providerCities)
  @JoinColumn({ name: 'id_provider' })
  provider: Provider;

  @ManyToOne(() => City)
  @JoinColumn({ name: 'id_city' })
  city: City;

  // AuditableEntity de Java
  @CreateDateColumn({ name: 'created_date', nullable: true })
  createdDate: Date;

  @UpdateDateColumn({ name: 'last_modified_date', nullable: true })
  lastModifiedDate: Date;
}