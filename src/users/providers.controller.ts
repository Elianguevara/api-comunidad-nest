import { Controller, Get, Put, Body, Param, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { ProvidersService } from './providers.service';
import { ProviderProfileRequestDto } from './dto/provider-profile.request.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('providers')
@UseGuards(AuthGuard('jwt'))
export class ProvidersController {
  constructor(private readonly providerService: ProvidersService) {}

  @Put('profile')
  updateProfile(@Request() req, @Body() request: ProviderProfileRequestDto) {
    this.providerService.updateProfile(req.user.email, request);
    return { message: "Perfil de proveedor actualizado correctamente." };
  }

  @Get(':id')
  getPublicProfile(@Param('id', ParseIntPipe) id: number) {
    return this.providerService.getPublicProfile(id);
  }
}