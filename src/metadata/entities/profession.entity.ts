import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('n_profession')
export class Profession {
  @PrimaryGeneratedColumn({ name: 'id_profession' })
  idProfession: number;

  @Column()
  name: string;
}