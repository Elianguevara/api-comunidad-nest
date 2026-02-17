import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from '../users/entities/user.entity';
import { Customer } from '../users/entities/customer.entity';
import { Provider } from '../users/entities/provider.entity';
import { Role } from '../users/entities/role.entity';
import { UserRole } from '../users/entities/user-role.entity';

import { RegisterRequestDto } from './dto/register.request.dto'; // Asumo que tienes estos DTOs
import { LoginRequestDto } from './dto/login.request.dto';
import { AuthResponseDto } from './dto/auth.response.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Customer) private customerRepo: Repository<Customer>,
    @InjectRepository(Provider) private providerRepo: Repository<Provider>,
    @InjectRepository(Role) private roleRepo: Repository<Role>,
    @InjectRepository(UserRole) private userRoleRepo: Repository<UserRole>,
    private jwtService: JwtService,
  ) {}

  async register(request: RegisterRequestDto): Promise<AuthResponseDto> {
    // 1. Validaciones Previas
    const emailExists = await this.userRepo.count({ where: { email: request.email } });
    if (emailExists > 0) {
      throw new BadRequestException("El correo electrónico ya está registrado en el sistema.");
    }

    const nameExists = await this.userRepo.count({ where: { name: request.name, lastname: request.lastname } });
    if (nameExists > 0) {
      throw new BadRequestException("Ya existe un usuario registrado con ese Nombre y Apellido.");
    }

    // 2. Crear Usuario Base
    const hashedPassword = await bcrypt.hash(request.password, 10);
    const user = this.userRepo.create({
      name: request.name,
      lastname: request.lastname,
      email: request.email,
      password: hashedPassword,
      dateCreate: new Date(),
      enabled: true,
      isActive: true,
      isStaff: false,
      isSuperuser: false,
    });
    const savedUser = await this.userRepo.save(user);

    // 3. Determinar y Asignar Rol
    const isProvider = request.role?.toUpperCase() === 'PROVIDER';
    const dbRoleName = isProvider ? 'ROLE_PROVIDER' : 'ROLE_USER';
    const frontendRole = isProvider ? 'PROVIDER' : 'CUSTOMER';

    const roleEntity = await this.roleRepo.findOne({ where: { name: dbRoleName } });
    if (!roleEntity) {
      throw new BadRequestException(`Error interno: Rol no encontrado en BD (${dbRoleName})`);
    }

    const userRole = this.userRoleRepo.create({
      user: savedUser,
      role: roleEntity,
    });
    await this.userRoleRepo.save(userRole);

    // 4. Crear Perfil Específico
    if (isProvider) {
      const provider = this.providerRepo.create({ user: savedUser });
      await this.providerRepo.save(provider);
    } else {
      const customer = this.customerRepo.create({ user: savedUser });
      await this.customerRepo.save(customer);
    }

    // 5. Generar Token JWT
    const payload = { email: savedUser.email, sub: savedUser.idUser, role: frontendRole };
    const jwtToken = this.jwtService.sign(payload);

    return {
      token: jwtToken,
      role: frontendRole,
      name: `${savedUser.name} ${savedUser.lastname}`,
      email: savedUser.email,
    };
  }

  async login(request: LoginRequestDto): Promise<AuthResponseDto> {
    // 1. Recuperar usuario
    const user = await this.userRepo.findOne({ where: { email: request.email } });
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 2. Validar credenciales (contraseña)
    const isPasswordValid = await bcrypt.compare(request.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 3. Obtener rol para el frontend (Lógica exacta de Java)
    const roleName = await this.getFrontendRoleNameByUser(user.idUser);

    // 4. Generar token
    const payload = { email: user.email, sub: user.idUser, role: roleName };
    const jwtToken = this.jwtService.sign(payload);

    return {
      token: jwtToken,
      role: roleName, // <-- ESTO ES LO QUE LEE REACT PARA MOSTRAR LA VISTA DE PROVEEDOR
      name: `${user.name} ${user.lastname}`,
      email: user.email,
    };
  }

  // Método auxiliar calcado de tu versión Java
  private async getFrontendRoleNameByUser(userId: number): Promise<string> {
    const userRoles = await this.userRoleRepo.find({
      where: { user: { idUser: userId } },
      relations: ['role']
    });

    if (!userRoles || userRoles.length === 0) return "CUSTOMER";

    const dbRole = userRoles[0].role.name;

    if (dbRole.toUpperCase() === "ROLE_PROVIDER") {
      return "PROVIDER";
    } else {
      return "CUSTOMER";
    }
  }
}