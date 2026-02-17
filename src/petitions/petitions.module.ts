import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PetitionsController } from './petitions.controller';
import { PetitionsService } from './petitions.service';

// 1. Entidades propias del módulo de peticiones
import { Petition } from './entities/petition.entity';
import { PetitionState } from './entities/petition-state.entity';
import { TypePetition } from './entities/type-petition.entity';
import { PetitionAttachment } from './entities/petition-attachment.entity';

// 2. Entidades externas necesarias para las inyecciones en el servicio
import { User } from '../users/entities/user.entity';
import { Customer } from '../users/entities/customer.entity';
import { Profession } from '../metadata/entities/profession.entity';
import { City } from '../metadata/entities/city.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Petition,
      PetitionState,
      TypePetition,
      PetitionAttachment,
      User,
      Customer,
      Profession,
      City
    ]),
  ],
  controllers: [PetitionsController],
  providers: [PetitionsService],
  exports: [PetitionsService, TypeOrmModule], // Exportamos el servicio y TypeOrmModule por si otros módulos lo necesitan
})
export class PetitionsModule {}