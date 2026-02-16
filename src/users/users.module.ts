import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Address } from './entities/address.entity'; // <-- Importar
import { Customer } from './entities/customer.entity'; // <-- Importar
import { UsersService } from './users.service';

@Module({
  // Agregamos Address y Customer aquí
  imports: [TypeOrmModule.forFeature([User, Role, Address, Customer])],
  providers: [UsersService],
  exports: [UsersService, TypeOrmModule], // <-- Exportamos TypeOrmModule para que PetitionsModule pueda usar Customer
})
export class UsersModule {}