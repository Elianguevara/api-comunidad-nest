import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PetitionsController } from './petitions.controller';
import { PetitionsService } from './petitions.service';
import { Petition } from './entities/petition.entity';
import { PetitionState } from './entities/petition-state.entity';
import { PetitionAttachment } from './entities/petition-attachment.entity';
import { TypePetition } from './entities/type-petition.entity';
import { Customer } from '../users/entities/customer.entity';
import { User } from '../users/entities/user.entity';
import { Profession } from '../metadata/entities/profession.entity';
import { City } from '../metadata/entities/city.entity';
import { NotificationsModule } from '../notifications/notifications.module'; // <-- IMPORTANTE

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Petition, 
      PetitionState, 
      PetitionAttachment, 
      TypePetition, 
      Customer, 
      User, 
      Profession, 
      City
    ]),
    NotificationsModule, // <-- AGREGA ESTO AQUÍ
  ],
  controllers: [PetitionsController],
  providers: [PetitionsService],
  exports: [PetitionsService],
})
export class PetitionsModule {}