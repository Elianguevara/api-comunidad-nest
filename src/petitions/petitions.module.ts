import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PetitionState } from './entities/petition-state.entity';
import { TypePetition } from './entities/type-petition.entity';
import { Petition } from './entities/petition.entity'; // <-- 1. Importar Petition

@Module({
  imports: [
    // 2. Agregar Petition a la lista
    TypeOrmModule.forFeature([PetitionState, TypePetition, Petition])
  ],
  exports: [TypeOrmModule],
})
export class PetitionsModule {}