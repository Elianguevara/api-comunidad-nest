import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Address } from './address.entity';

@Entity('n_customer')
export class Customer {
  @PrimaryGeneratedColumn({ name: 'id_customer' })
  idCustomer: number;

  // RELACIÓN 1 A 1 CON USER
  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'idUser' })
  user: User;

  @Column({ nullable: true })
  dni: string;

  @Column({ nullable: true })
  phone: string;

  // RELACIÓN 1 A 1 CON ADDRESS
  @OneToOne(() => Address, { cascade: true })
  @JoinColumn({ name: 'address_id' })
  address: Address;
}