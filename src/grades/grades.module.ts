import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GradesController } from './grades.controller';
import { GradesService } from './grades.service';

// Entidades propias
import { Grade } from './entities/grade.entity';
import { GradeCustomer } from './entities/grade-customer.entity';
import { GradeProvider } from './entities/grade-provider.entity';

// Entidades externas necesarias para las validaciones
import { User } from '../users/entities/user.entity';
import { Customer } from '../users/entities/customer.entity';
import { Provider } from '../users/entities/provider.entity';
import { Petition } from '../petitions/entities/petition.entity';
import { Postulation } from '../postulations/entities/postulation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Grade,
      GradeCustomer,
      GradeProvider,
      User,
      Customer,
      Provider,
      Petition,
      Postulation,
    ]),
  ],
  controllers: [GradesController],
  providers: [GradesService],
  exports: [GradesService],
})
export class GradesModule {}