import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('n_category')
export class Category {
  @PrimaryGeneratedColumn({ name: 'id_category' })
  idCategory: number;

  @Column()
  name: string;
}