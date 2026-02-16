import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, AuthResponseDto } from './dto/auth.dto';

// Replicamos el @RequestMapping("/api/auth") exacto para no romper React
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() request: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(request);
  }

  @Post('login')
  async authenticate(@Body() request: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(request);
  }
}