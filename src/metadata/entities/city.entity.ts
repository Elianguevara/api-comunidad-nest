import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Department } from './department.entity';

@Entity('n_city')
export class City {
  @PrimaryGeneratedColumn({ name: 'id_city' })
  idCity: number;

  @Column()
  name: string;

  @Column({ name: 'postal_code', nullable: true })
  postalCode: string;

  // Equivalente al @JsonIgnore de Java:
  // Como en el servicio solo hacemos "find()", TypeORM no cargará esta relación
  // y por lo tanto no se enviará en el JSON al frontend de React.
  @ManyToOne(() => Department)
  @JoinColumn({ name: 'id_department' })
  department: Department;

  @Column({ name: 'date_create', type: 'datetime', nullable: true })
  dateCreate: Date;

  @Column({ name: 'date_update', type: 'datetime', nullable: true })
  dateUpdate: Date;
}