import { Controller, Get, Post, Body, Param, Delete, Put, Patch, Query, UseGuards, Request, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { PetitionsService } from './petitions.service';
import { CreatePetitionDto } from './dto/petition.dto';
import { AuthGuard } from '@nestjs/passport';

// Replicamos el @RequestMapping("/api/petitions") de Java
@Controller('petitions') 
@UseGuards(AuthGuard('jwt')) // ¡ESTE ES EL GUARDIÁN! Protege todas las rutas de este controlador
export class PetitionsController {
  constructor(private readonly petitionsService: PetitionsService) {}

  // Equivalente a @PostMapping
  @Post()
  createPetition(@Request() req, @Body() createPetitionDto: CreatePetitionDto) {
    // req.user contiene el payload que definimos en jwt.strategy.ts
    return this.petitionsService.create(req.user.email, createPetitionDto);
  }

  // Equivalente a @GetMapping("/feed")
  @Get('feed')
  getFeed(
    @Request() req,
    @Query('page', new DefaultValuePipe(0), ParseIntPipe) page: number,
    @Query('size', new DefaultValuePipe(10), ParseIntPipe) size: number,
  ) {
    return this.petitionsService.getFeed(req.user.email, page, size);
  }

  // Equivalente a @GetMapping("/my")
  @Get('my')
  getMyPetitions(
    @Request() req,
    @Query('page', new DefaultValuePipe(0), ParseIntPipe) page: number,
    @Query('size', new DefaultValuePipe(10), ParseIntPipe) size: number,
  ) {
    return this.petitionsService.getMyPetitions(req.user.email, page, size);
  }

  // Equivalente a @GetMapping("/{id}")
  @Get(':id')
  getPetitionById(@Request() req, @Param('id') id: string) {
    return this.petitionsService.findOne(+id, req.user.email);
  }

  // Equivalente a @DeleteMapping("/{id}")
  @Delete(':id')
  deletePetition(@Request() req, @Param('id') id: string) {
    return this.petitionsService.remove(+id, req.user.email);
  }

  // Equivalente a @PutMapping("/{id}/complete")
  @Put(':id/complete')
  completePetition(@Request() req, @Param('id') id: string) {
    return this.petitionsService.complete(+id, req.user.email);
  }

  // Equivalente a @PatchMapping("/{id}/reactivate")
  @Patch(':id/reactivate')
  reactivatePetition(@Request() req, @Param('id') id: string) {
    return this.petitionsService.reactivate(+id, req.user.email);
  }
}