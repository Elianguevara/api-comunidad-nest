import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Servicios
import { UsersService } from './users.service';
import { ProvidersService } from './providers.service'; // <-- 1. Importar el servicio

// Controladores
import { UsersController } from './users.controller';
import { ProvidersController } from './providers.controller';

// Entidades propias del módulo
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Address } from './entities/address.entity';
import { Customer } from './entities/customer.entity';
import { Provider } from './entities/provider.entity';
import { ProviderCity } from './entities/provider-city.entity'; // <-- Clave para el perfil
import { ProviderCategory } from './entities/provider-category.entity';

// Entidades externas necesarias para las inyecciones de ProvidersService
import { Profession } from '../metadata/entities/profession.entity';
import { City } from '../metadata/entities/city.entity';
import { GradeProvider } from '../grades/entities/grade-provider.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User, 
      Role, 
      Address, 
      Customer, 
      Provider,
      ProviderCity,     // <-- Agregado
      ProviderCategory, // <-- Agregado
      Profession,       // <-- Agregado
      City,             // <-- Agregado
      GradeProvider     // <-- Agregado para el cálculo de promedios
    ])
  ],
  controllers: [
    UsersController, 
    ProvidersController
  ],
  providers: [
    UsersService,
    ProvidersService // <-- 2. Registrar el servicio aquí
  ],
  exports: [UsersService, ProvidersService, TypeOrmModule],
})
export class UsersModule {}