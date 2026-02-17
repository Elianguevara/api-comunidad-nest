import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'n_grade' })
export class Grade {
  @PrimaryGeneratedColumn({ name: 'id_grade' })
  idGrade: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string;

  @Column({ type: 'int', nullable: true })
  value: number;
}