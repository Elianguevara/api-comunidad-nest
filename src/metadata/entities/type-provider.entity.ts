import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('n_type_provider')
export class TypeProvider {
  @PrimaryGeneratedColumn({ name: 'id_type_provider' })
  idTypeProvider: number;

  @Column()
  name: string;
}