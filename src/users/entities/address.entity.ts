import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { City } from '../../metadata/entities/city.entity';

@Entity('n_address')
export class Address {
  @PrimaryGeneratedColumn({ name: 'id_address' })
  idAddress: number;

  @Column({ nullable: true }) street: string;
  @Column({ nullable: true }) number: string;
  @Column({ nullable: true }) floor: string;
  @Column({ nullable: true }) apartment: string;
  
  @Column({ name: 'postal_code', nullable: true }) 
  postalCode: string;

  // RELACIÓN MANY-TO-ONE CON CITY
  @ManyToOne(() => City)
  @JoinColumn({ name: 'id_city' })
  city: City;

  @CreateDateColumn({ name: 'date_create' })
  dateCreate: Date;

  @UpdateDateColumn({ name: 'date_update', nullable: true })
  dateUpdate: Date;
}