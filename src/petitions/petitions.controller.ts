import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Patch, 
  Delete, 
  Body, 
  Param, 
  Query, 
  UseGuards, 
  Request, 
  HttpCode, 
  HttpStatus, 
  DefaultValuePipe, 
  ParseIntPipe 
} from '@nestjs/common';
import { PetitionsService } from './petitions.service';
import { AuthGuard } from '@nestjs/passport';
// Asumiendo que tienes estos DTOs creados
import { PetitionRequestDto } from './dto/petition.request.dto'; 

@Controller('petitions')
@UseGuards(AuthGuard('jwt'))
export class PetitionsController {
  constructor(private readonly petitionService: PetitionsService) {}

  @Post()
  createPetition(@Request() req, @Body() request: PetitionRequestDto) {
    return this.petitionService.createPetition(req.user.email, request);
  }

  @Get('feed')
  getFeed(
    @Request() req,
    @Query('page', new DefaultValuePipe(0), ParseIntPipe) page: number,
    @Query('size', new DefaultValuePipe(10), ParseIntPipe) size: number,
  ) {
    return this.petitionService.getFeed(req.user.email, page, size);
  }

  @Get('my')
  getMyPetitions(
    @Request() req,
    @Query('page', new DefaultValuePipe(0), ParseIntPipe) page: number,
    @Query('size', new DefaultValuePipe(10), ParseIntPipe) size: number,
  ) {
    return this.petitionService.getMyPetitions(req.user.email, page, size);
  }

  @Get(':id')
  getPetitionById(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.petitionService.getPetitionById(id, req.user.email);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // Retorna 204 como en Java
  async deletePetition(@Request() req, @Param('id', ParseIntPipe) id: number) {
    await this.petitionService.deletePetition(id, req.user.email);
  }

  @Put(':id/complete')
  completePetition(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.petitionService.completePetition(id, req.user.email);
  }

  @Patch(':id/reactivate')
  reactivatePetition(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.petitionService.reactivatePetition(id, req.user.email);
  }
}