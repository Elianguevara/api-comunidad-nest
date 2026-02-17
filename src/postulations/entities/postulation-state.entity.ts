import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'n_postulation_state' })
export class PostulationState {
  
  @PrimaryGeneratedColumn({ name: 'id_state' })
  idState: number;

  // Si en la base de datos de la escuela estas columnas tienen nombres distintos,
  // ajusta el campo 'name'. Por lo general, Hibernate las deja tal cual si son una sola palabra.
  @Column({ name: 'name', type: 'varchar', length: 255, nullable: true })
  name: string;

  @Column({ name: 'description', type: 'varchar', length: 255, nullable: true })
  description: string;
}