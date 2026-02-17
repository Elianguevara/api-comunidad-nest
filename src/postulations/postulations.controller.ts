import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Body, 
  Param, 
  Query, 
  UseGuards, 
  Request, 
  DefaultValuePipe, 
  ParseIntPipe 
} from '@nestjs/common';
import { PostulationsService } from './postulations.service';
import { PostulationRequestDto } from './dto/postulation.request.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('postulations')
@UseGuards(AuthGuard('jwt')) // Protege todas las rutas simulando SecurityContextHolder
export class PostulationsController {
  constructor(private readonly postulationsService: PostulationsService) {}

  @Post()
  create(@Request() req, @Body() request: PostulationRequestDto) {
    return this.postulationsService.createPostulation(req.user.email, request);
  }

  @Get('petition/:idPetition')
  getByPetition(@Request() req, @Param('idPetition', ParseIntPipe) idPetition: number) {
    return this.postulationsService.getPostulationsByPetition(idPetition, req.user.email);
  }

  @Get('my')
  getMyPostulations(
    @Request() req,
    @Query('page', new DefaultValuePipe(0), ParseIntPipe) page: number,
    @Query('size', new DefaultValuePipe(10), ParseIntPipe) size: number,
  ) {
    return this.postulationsService.getMyPostulations(req.user.email, page, size);
  }

  @Put(':idPostulation/accept')
  acceptPostulation(@Request() req, @Param('idPostulation', ParseIntPipe) idPostulation: number) {
    this.postulationsService.acceptPostulation(idPostulation, req.user.email);
    // En NestJS podemos devolver un objeto o un string simple
    return { message: "Postulación aceptada y petición adjudicada correctamente." };
  }

  @Get('check/:idPetition')
  checkIfApplied(@Request() req, @Param('idPetition', ParseIntPipe) idPetition: number) {
    return this.postulationsService.checkIfApplied(idPetition, req.user.email);
  }
}