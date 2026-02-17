import { Entity, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';
import { Role } from './role.entity';

@Entity({ name: 'n_user_role' })
export class UserRole {
  @PrimaryColumn({ name: 'id_user' })
  userId: number;

  @PrimaryColumn({ name: 'id_role' })
  roleId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'id_user' })
  user: User;

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'id_role' })
  role: Role;
}