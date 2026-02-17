import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { City } from './entities/city.entity';
import { Profession } from './entities/profession.entity';
import { TypeProvider } from './entities/type-provider.entity';
import { Department } from './entities/department.entity'; // <-- NUEVO
import { TypePetition } from '../petitions/entities/type-petition.entity';
import { MetadataController } from './metadata.controller'; 
import { MetadataService } from './metadata.service';       

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Category, 
      City, 
      Profession, 
      TypeProvider, 
      TypePetition,
      Department // <-- Agregado para que TypeORM conozca la tabla
    ])
  ],
  controllers: [MetadataController], 
  providers: [MetadataService],      
  exports: [TypeOrmModule],
})
export class MetadataModule {}