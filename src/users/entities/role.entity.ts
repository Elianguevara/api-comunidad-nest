import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('n_role')
export class Role {
  @PrimaryGeneratedColumn({ name: 'id_role' })
  idRole: number;

  @Column()
  name: string;
}