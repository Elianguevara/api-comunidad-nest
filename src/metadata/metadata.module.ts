import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { City } from './entities/city.entity';
import { Profession } from './entities/profession.entity';
import { TypeProvider } from './entities/type-provider.entity';
import { TypePetition } from '../petitions/entities/type-petition.entity';
import { MetadataController } from './metadata.controller'; // <-- NUEVO
import { MetadataService } from './metadata.service';       // <-- NUEVO

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Category, 
      City, 
      Profession, 
      TypeProvider, 
      TypePetition // <-- Agregamos esta para poder inyectarla en el servicio
    ])
  ],
  controllers: [MetadataController], // <-- NUEVO
  providers: [MetadataService],      // <-- NUEVO
  exports: [TypeOrmModule],
})
export class MetadataModule {}