import { Controller, Get, Put, Delete, Body, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/user-profile.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMyProfile(@Request() req) {
    return this.usersService.getMyProfile(req.user.email);
  }

  @Put('me')
  updateMyUser(@Request() req, @Body() request: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.email, request);
  }

  @Delete('me')
  deleteMyAccount(@Request() req) {
    this.usersService.deleteUserByEmail(req.user.email);
    return { message: "Tu cuenta ha sido eliminada exitosamente (Baja lógica)." };
  }
}