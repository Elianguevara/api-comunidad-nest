import { Controller, Get, Put, Delete, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/user-profile.dto';

@Controller('users') // Rutas: /api/users
@UseGuards(AuthGuard('jwt')) // Protegido por token
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMyProfile(@Request() req) {
    return this.usersService.getMyProfile(req.user.email);
  }

  @Put('me')
  updateMyProfile(@Request() req, @Body() updateData: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.email, updateData);
  }

  @Delete('me')
  deleteMyAccount(@Request() req) {
    return this.usersService.deleteUser(req.user.email);
  }
}