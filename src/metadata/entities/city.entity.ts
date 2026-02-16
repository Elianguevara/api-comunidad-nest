import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('n_city')
export class City {
  @PrimaryGeneratedColumn({ name: 'id_city' })
  idCity: number;

  @Column()
  name: string;

  @Column({ name: 'postal_code', nullable: true })
  postalCode: string;

  // El equivalente a tu LocalDateTime en Java
  @Column({ name: 'date_create', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  dateCreate: Date;

  @Column({ name: 'date_update', type: 'timestamp', nullable: true })
  dateUpdate: Date;

  // TODO: Agregar la relación ManyToOne con Department más adelante
}