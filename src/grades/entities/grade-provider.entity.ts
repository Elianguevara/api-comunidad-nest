import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Provider } from '../../users/entities/provider.entity';
import { Customer } from '../../users/entities/customer.entity';
import { Grade } from './grade.entity';
import { Petition } from '../../petitions/entities/petition.entity';

@Entity({ name: 'n_grade_provider' })
export class GradeProvider {
  @PrimaryGeneratedColumn({ name: 'id_grade_provider' })
  idGradeProvider: number;

  @ManyToOne(() => Provider)
  @JoinColumn({ name: 'id_provider' })
  provider: Provider;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'id_customer' })
  customer: Customer;

  @ManyToOne(() => Grade)
  @JoinColumn({ name: 'id_grade' })
  grade: Grade;

  @ManyToOne(() => Petition)
  @JoinColumn({ name: 'id_petition' })
  petition: Petition;

  @Column({ type: 'int', nullable: true })
  rating: number;

  // ¡ATENCIÓN AQUÍ! Mapeamos explícitamente a "coment" como estaba en Java
  @Column({ name: 'coment', type: 'text', nullable: true })
  comment: string;

  @Column({ type: 'text', nullable: true })
  response: string;

  @Column({ name: 'is_visible', type: 'boolean', default: true })
  isVisible: boolean;

  // Herencia de AuditableEntity
  @CreateDateColumn({ name: 'created_date', nullable: true })
  createdDate: Date;

  @UpdateDateColumn({ name: 'last_modified_date', nullable: true })
  lastModifiedDate: Date;
}