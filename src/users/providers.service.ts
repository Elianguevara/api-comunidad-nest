import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Provider } from './entities/provider.entity';
import { ProviderCity } from './entities/provider-city.entity';
import { User } from './entities/user.entity';
import { Profession } from '../metadata/entities/profession.entity';
import { City } from '../metadata/entities/city.entity';
import { GradeProvider } from '../grades/entities/grade-provider.entity';

import { ProviderProfileRequestDto } from './dto/provider-profile.request.dto';
import { ProviderPublicProfileResponseDto } from './dto/provider-public-profile.response.dto';

@Injectable()
export class ProvidersService {
  constructor(
    @InjectRepository(Provider) private providerRepo: Repository<Provider>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Profession) private professionRepo: Repository<Profession>,
    @InjectRepository(City) private cityRepo: Repository<City>,
    @InjectRepository(ProviderCity) private providerCityRepo: Repository<ProviderCity>,
    @InjectRepository(GradeProvider) private gradeProviderRepo: Repository<GradeProvider>,
  ) {}

  async updateProfile(email: string, request: ProviderProfileRequestDto): Promise<void> {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const provider = await this.providerRepo.findOne({ where: { user: { idUser: user.idUser } } });
    if (!provider) throw new NotFoundException('Perfil de proveedor no encontrado.');

    const profession = await this.professionRepo.findOne({ where: { idProfession: request.idProfession } });
    if (!profession) throw new NotFoundException('Profesión no válida');

    provider.profession = profession;
    // CORRECCIÓN AQUÍ: Usamos ?? para que si es undefined, asigne un string vacío.
    provider.description = request.description ?? provider.description ?? ''; 
    await this.providerRepo.save(provider);

    // Actualizar Ciudades de Cobertura
    await this.providerCityRepo.delete({ providerId: provider.idProvider });

    if (request.cityIds && request.cityIds.length > 0) {
      for (const cityId of request.cityIds) {
        const city = await this.cityRepo.findOne({ where: { idCity: cityId } });
        if (!city) throw new NotFoundException(`Ciudad no encontrada: ${cityId}`);

        const providerCity = this.providerCityRepo.create({
          providerId: provider.idProvider,
          cityId: city.idCity,
          provider: provider,
          city: city,
        });

        await this.providerCityRepo.save(providerCity);
      }
    }
  }

  async getPublicProfile(idProvider: number): Promise<ProviderPublicProfileResponseDto> {
    const provider = await this.providerRepo.findOne({
      where: { idProvider },
      relations: ['user', 'profession', 'providerCities', 'providerCities.city']
    });

    if (!provider) throw new NotFoundException('Proveedor no encontrado.');

    const user = provider.user;
    const cities = provider.providerCities?.map(pc => pc.city.name) || [];
    const professions = provider.profession ? [provider.profession.name] : [];

    const avgResult = await this.gradeProviderRepo
      .createQueryBuilder('grade')
      .select('AVG(grade.rating)', 'average')
      .where('grade.id_provider = :id', { id: idProvider })
      .getRawOne();
      
    const avg = avgResult && avgResult.average ? parseFloat(avgResult.average) : 0;
    const finalRating = Math.round(avg * 10.0) / 10.0;

    const totalReviews = await this.gradeProviderRepo.count({
      where: { provider: { idProvider } }
    });

    return {
      idProvider: provider.idProvider,
      userId: user.idUser,
      name: user.name,
      lastname: user.lastname,
      profileImage: user.profileImage,
      biography: provider.description,
      professions: professions,
      cities: cities,
      rating: finalRating,
      totalReviews: totalReviews || 0,
    };
  }
}