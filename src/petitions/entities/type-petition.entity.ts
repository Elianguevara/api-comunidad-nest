import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('n_type_petition')
export class TypePetition {
  @PrimaryGeneratedColumn({ name: 'id_type_petition' })
  idTypePetition: number;

  @Column({ name: 'type_petition' })
  typePetitionName: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', nullable: true })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date;
}