import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostulationsController } from './postulations.controller';
import { PostulationsService } from './postulations.service';
import { Postulation } from './entities/postulation.entity';
import { PostulationState } from './entities/postulation-state.entity';
import { Petition } from '../petitions/entities/petition.entity';
import { PetitionState } from '../petitions/entities/petition-state.entity';
import { Provider } from '../users/entities/provider.entity';
import { User } from '../users/entities/user.entity';
import { NotificationsModule } from '../notifications/notifications.module'; // <-- IMPORTANTE

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Postulation, 
      PostulationState, 
      Petition, 
      PetitionState, 
      Provider, 
      User
    ]),
    NotificationsModule, // <-- AGREGA ESTO AQUÍ
  ],
  controllers: [PostulationsController],
  providers: [PostulationsService],
})
export class PostulationsModule {}