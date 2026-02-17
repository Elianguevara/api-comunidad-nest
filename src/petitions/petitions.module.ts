import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PetitionsController } from './petitions.controller';
import { PetitionsService } from './petitions.service';
import { PetitionState } from './entities/petition-state.entity';
import { TypePetition } from './entities/type-petition.entity';
import { Petition } from './entities/petition.entity';
import { UsersModule } from '../users/users.module'; // <-- 1. Importar esto

@Module({
  imports: [
    TypeOrmModule.forFeature([PetitionState, TypePetition, Petition]),
    UsersModule, // <-- 2. Agregarlo aquí para poder usar el CustomerRepository
  ],
  controllers: [PetitionsController],
  providers: [PetitionsService],
  exports: [TypeOrmModule],
})
export class PetitionsModule {}