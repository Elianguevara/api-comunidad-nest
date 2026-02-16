import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async create(userData: Partial<User>): Promise<User> {
    // Le agregamos "as string" para asegurarle a TypeScript que no será undefined
    const existingUser = await this.findByEmail(userData.email as string);
    if (existingUser) {
      throw new ConflictException('El email ya está registrado'); 
    }
    
    const newUser = this.userRepository.create(userData);
    return this.userRepository.save(newUser);
  }
}