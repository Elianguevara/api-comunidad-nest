import { Controller, Get, Put, Body, Param, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { UpdateProviderProfileDto } from './dto/user-profile.dto';

@Controller('providers') // Rutas: /api/providers
@UseGuards(AuthGuard('jwt'))
export class ProvidersController {
  constructor(private readonly usersService: UsersService) {}

  @Put('profile')
  updateProviderProfile(@Request() req, @Body() data: UpdateProviderProfileDto) {
    return this.usersService.updateProviderProfile(req.user.email, data);
  }

  @Get(':id')
  getPublicProfile(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getProviderPublicProfile(id);
  }
}