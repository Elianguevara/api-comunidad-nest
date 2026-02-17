import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { City } from './entities/city.entity';
import { Profession } from './entities/profession.entity';
import { TypePetition } from '../petitions/entities/type-petition.entity';

@Injectable()
export class MetadataService {
  constructor(
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
    @InjectRepository(Profession)
    private readonly professionRepository: Repository<Profession>,
    @InjectRepository(TypePetition)
    private readonly typePetitionRepository: Repository<TypePetition>,
  ) {}

  async getAllCities() {
    return this.cityRepository.find();
  }

  async getAllProfessions() {
    return this.professionRepository.find();
  }

  async getAllTypes() {
    return this.typePetitionRepository.find();
  }
}