import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      // Extrae el token del header "Authorization: Bearer <token>"
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // Rechaza tokens vencidos
      // Usa la misma clave secreta del .env
      secretOrKey: configService.get<string>('JWT_SECRET') as string,
    });
  }

  // Si el token es válido, esta función se ejecuta automáticamente.
  // Lo que devolvamos aquí, NestJS lo guardará en "req.user" para que 
  // cualquier controlador sepa quién está haciendo la petición.
  async validate(payload: any) {
    return { 
      idUser: payload.sub, 
      email: payload.email, 
      role: payload.role 
    };
  }
}