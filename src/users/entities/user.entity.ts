import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('n_user') // Mismo nombre de tabla que en Spring Boot
export class User {
  @PrimaryGeneratedColumn({ name: 'id_user' })
  idUser: number;

  @Column()
  name: string;

  @Column()
  lastname: string;

  @Column({ name: 'profile_image', nullable: true })
  profileImage: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: true })
  enabled: boolean;

  @Column({ name: 'date_create', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  dateCreate: Date;

  @Column({ name: 'date_update', type: 'timestamp', nullable: true })
  dateUpdate: Date;

  @Column({ name: 'last_login', type: 'timestamp', nullable: true })
  lastLogin: Date;

  @Column({ name: 'is_superuser', default: false })
  isSuperuser: boolean;

  @Column({ name: 'date_joined', type: 'timestamp', nullable: true })
  dateJoined: Date;

  @Column({ name: 'is_staff', default: false })
  isStaff: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}