import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto, LoginDto, AuthResponseDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(request: RegisterDto): Promise<AuthResponseDto> {
    // 1. Encriptar la contraseña (Igual que BCryptPasswordEncoder de Spring)
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(request.password, saltRounds);

    // 2. Guardar el usuario en la tabla n_user
    const savedUser = await this.usersService.create({
      name: request.name,
      lastname: request.lastname,
      email: request.email,
      password: hashedPassword,
    });

    // TODO: En el próximo paso enlazaremos el Rol en las tablas n_role y n_user_role 
    // como hacía Java. Por ahora usamos el del request para que el JWT funcione.

    // 3. Generar Token JWT
    const payload = { sub: savedUser.idUser, email: savedUser.email, role: request.role };
    const token = this.jwtService.sign(payload);

    // 4. Devolver exactamente lo que espera React
    return {
      token,
      role: request.role,
      name: savedUser.name,
      email: savedUser.email,
    };
  }

  async login(request: LoginDto): Promise<AuthResponseDto> {
    console.log('1. Intentando hacer login con el email:', request.email);

    // 1. Buscar usuario por email
    const user = await this.usersService.findByEmail(request.email);
    if (!user) {
      console.log('❌ Error: Usuario no encontrado en la BD');
      throw new UnauthorizedException('Credenciales inválidas');
    }
    console.log('2. Usuario encontrado:', user.email);

    // 2. Verificar que las contraseñas coincidan
    const isPasswordMatching = await bcrypt.compare(request.password, user.password);
    if (!isPasswordMatching) {
      console.log('❌ Error: La contraseña no coincide. Contraseña ingresada:', request.password);
      throw new UnauthorizedException('Credenciales inválidas');
    }
    console.log('3. Contraseña correcta. Generando token...');

    // TODO: Mapear el rol real desde la BD. Usamos 'CUSTOMER' por defecto temporalmente.
    const userRole = 'CUSTOMER'; 

    // 3. Generar Token JWT
    const payload = { sub: user.idUser, email: user.email, role: userRole };
    const token = this.jwtService.sign(payload);

    console.log('✅ Login exitoso!');

    // 4. Respuesta a React
    return {
      token,
      role: userRole,
      name: user.name,
      email: user.email,
    };
  }
}