import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Customer } from '../../users/entities/customer.entity';
import { Provider } from '../../users/entities/provider.entity';
import { Petition } from '../../petitions/entities/petition.entity';

@Entity({ name: 'n_grade_customer' })
export class GradeCustomer {
  @PrimaryGeneratedColumn({ name: 'id_grade_customer' })
  idGradeCustomer: number;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'id_customer' })
  customer: Customer;

  @ManyToOne(() => Provider)
  @JoinColumn({ name: 'id_provider' })
  provider: Provider;

  @ManyToOne(() => Petition)
  @JoinColumn({ name: 'id_petition' })
  petition: Petition;

  @Column({ type: 'int', nullable: true })
  rating: number;

  @Column({ type: 'text', nullable: true })
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