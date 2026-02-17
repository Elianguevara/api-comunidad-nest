import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'n_department' })
export class Department {
  @PrimaryGeneratedColumn({ name: 'id_department' })
  idDepartment: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name: string;
}