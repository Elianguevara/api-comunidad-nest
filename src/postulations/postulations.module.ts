import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostulationsController } from './postulations.controller';
import { PostulationsService } from './postulations.service';

// Entidades propias del módulo
import { Postulation } from './entities/postulation.entity';
import { PostulationState } from './entities/postulation-state.entity';
import { PostulationStateHistory } from './entities/postulation-state-history.entity';

// Entidades externas necesarias para las relaciones y lógica de negocio
import { Petition } from '../petitions/entities/petition.entity';
import { PetitionState } from '../petitions/entities/petition-state.entity'; // <-- ¡Añadido!
import { Provider } from '../users/entities/provider.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Postulation,
      PostulationState,
      PostulationStateHistory,
      Petition,
      PetitionState, // <-- ¡Añadido aquí para que TypeORM cree el Repositorio!
      Provider,
      User
    ]),
  ],
  controllers: [PostulationsController],
  providers: [PostulationsService],
  exports: [PostulationsService],
})
export class PostulationsModule {}