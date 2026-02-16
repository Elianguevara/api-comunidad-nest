import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('n_petition_state')
export class PetitionState {
  @PrimaryGeneratedColumn({ name: 'id_state' })
  idState: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;
}