import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Address } from './entities/address.entity';
import { Customer } from './entities/customer.entity';
import { Provider } from './entities/provider.entity'; // <-- 1. Importar Provider
import { UsersService } from './users.service';
import { UsersController } from './users.controller';       // <-- 2. Importar Controller
import { ProvidersController } from './providers.controller'; // <-- 3. Importar Controller

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, Address, Customer, Provider]) // <-- Agregar Provider
  ],
  controllers: [UsersController, ProvidersController], // <-- Agregar Controladores
  providers: [UsersService],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}