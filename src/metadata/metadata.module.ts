import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { City } from './entities/city.entity';
import { Profession } from './entities/profession.entity';
import { TypeProvider } from './entities/type-provider.entity';

@Module({
  // Agregamos Profession y TypeProvider aquí
  imports: [TypeOrmModule.forFeature([Category, City, Profession, TypeProvider])],
  exports: [TypeOrmModule],
})
export class MetadataModule {}