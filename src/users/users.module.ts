import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Servicios
import { UsersService } from './users.service';
import { ProvidersService } from './providers.service'; // <-- 1. Importar el servicio
import { CustomersService } from './customers.service';

// Controladores
import { UsersController } from './users.controller';
import { ProvidersController } from './providers.controller';
import { CustomersController } from './customers.controller';

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
import { GradeCustomer } from '../grades/entities/grade-customer.entity';
import { Petition } from '../petitions/entities/petition.entity';

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
      GradeProvider,    // <-- Agregado para el cálculo de promedios
      GradeCustomer,
      Petition,
    ])
  ],
  controllers: [
    UsersController, 
    ProvidersController,
    CustomersController,
  ],
  providers: [
    UsersService,
    ProvidersService, // <-- 2. Registrar el servicio aquí
    CustomersService,
  ],
  exports: [UsersService, ProvidersService, CustomersService, TypeOrmModule],
})
export class UsersModule {}
