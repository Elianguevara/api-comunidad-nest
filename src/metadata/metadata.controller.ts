import { Controller, Get } from '@nestjs/common';
import { MetadataService } from './metadata.service';

@Controller('metadata')
export class MetadataController {
  constructor(private readonly metadataService: MetadataService) {}

  @Get('cities')
  getAllCities() {
    return this.metadataService.getAllCities();
  }

  @Get('professions')
  getAllProfessions() {
    return this.metadataService.getAllProfessions();
  }

  @Get('types')
  getAllTypes() {
    return this.metadataService.getAllTypes();
  }
}