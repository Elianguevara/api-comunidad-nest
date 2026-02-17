import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Petition } from './entities/petition.entity';
import { PetitionState } from './entities/petition-state.entity';
import { Customer } from '../users/entities/customer.entity';
import { CreatePetitionDto } from './dto/petition.dto';

@Injectable()
export class PetitionsService {
  constructor(
    @InjectRepository(Petition)
    private readonly petitionRepository: Repository<Petition>,
    @InjectRepository(PetitionState)
    private readonly stateRepository: Repository<PetitionState>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  // --- Mapeador: Transforma la entidad de BD al JSON que espera React ---
  private mapToDto(petition: Petition) {
    return {
      idPetition: petition.idPetition,
      description: petition.description,
      state: petition.state?.name || 'PENDIENTE',
      profession: petition.profession?.name || 'No especificada',
      city: petition.city?.name || 'No especificada',
      typePetition: petition.typePetition?.typePetitionName || 'General',
      // Unimos nombre y apellido del usuario que creó la petición
      customerName: petition.customer?.user ? `${petition.customer.user.name} ${petition.customer.user.lastname}` : 'Usuario',
      dateSince: petition.dateSince,
    };
  }

  async getFeed(userEmail: string, page: number, size: number) {
    const [petitions, total] = await this.petitionRepository.findAndCount({
      where: { 
        customer: { user: { email: Not(userEmail) } },
        isDeleted: false 
      },
      relations: ['typePetition', 'city', 'profession', 'state', 'customer', 'customer.user'],
      order: { dateSince: 'DESC' },
      skip: page * size,
      take: size,
    });

    return {
      content: petitions.map(p => this.mapToDto(p)),
      pageable: { pageNumber: page, pageSize: size },
      totalElements: total,
      totalPages: Math.ceil(total / size),
    };
  }

  async getMyPetitions(userEmail: string, page: number, size: number) {
    const [petitions, total] = await this.petitionRepository.findAndCount({
      where: { 
        customer: { user: { email: userEmail } },
        isDeleted: false 
      },
      relations: ['typePetition', 'city', 'profession', 'state', 'customer', 'customer.user'],
      order: { dateSince: 'DESC' },
      skip: page * size,
      take: size,
    });

    return {
      content: petitions.map(p => this.mapToDto(p)),
      pageable: { pageNumber: page, pageSize: size },
      totalElements: total,
      totalPages: Math.ceil(total / size),
    };
  }

  async create(userEmail: string, dto: CreatePetitionDto) {
    const customer = await this.customerRepository.findOne({
      where: { user: { email: userEmail } },
      relations: ['user']
    });

    if (!customer) {
      throw new BadRequestException('El usuario no tiene un perfil de cliente asociado.');
    }

    let initialState = await this.stateRepository.findOne({ where: { name: 'ACTIVA' } });
    if (!initialState) {
      initialState = await this.stateRepository.findOne({ where: { idState: 1 } });
    }
    
    // Validación adicional para calmar a TypeScript
    if (!initialState) {
      throw new BadRequestException('Estado inicial no configurado en la base de datos.');
    }

    // Usamos 'as any' en las relaciones para que TypeORM no se confunda al recibir solo el ID
    const newPetition = this.petitionRepository.create({
      description: dto.description,
      dateSince: dto.dateSince ? new Date(dto.dateSince) : new Date(),
      dateUntil: dto.dateUntil ? new Date(dto.dateUntil) : undefined,
      typePetition: { idTypePetition: dto.idTypePetition } as any, // <--- CAMBIADO
      city: { idCity: dto.idCity } as any,                         // <--- CAMBIADO
      profession: { idProfession: dto.idProfession } as any,       // <--- CAMBIADO
      customer: { idCustomer: customer.idCustomer } as any,
      state: initialState,
    });

    const savedPetition = await this.petitionRepository.save(newPetition);
    
    // Buscamos la petición completa recién guardada para devolver los nombres de ciudad, profesión, etc.
    return this.findOne(savedPetition.idPetition, userEmail);
  }

  async findOne(id: number, userEmail: string) {
    const petition = await this.petitionRepository.findOne({
      where: { idPetition: id, isDeleted: false },
      relations: ['typePetition', 'city', 'profession', 'state', 'customer', 'customer.user'],
    });
    if (!petition) throw new NotFoundException('Petición no encontrada');
    return this.mapToDto(petition);
  }

  async remove(id: number, userEmail: string) {
    const petition = await this.petitionRepository.findOne({ where: { idPetition: id } });
    if (!petition) throw new NotFoundException('Petición no encontrada');

    petition.isDeleted = true;
    await this.petitionRepository.save(petition);
    return null;
  }

  async complete(id: number, userEmail: string) {
    const petition = await this.petitionRepository.findOne({ where: { idPetition: id } });
    if (!petition) throw new NotFoundException('Petición no encontrada');

    const finalState = await this.stateRepository.findOne({ where: { name: 'FINALIZADA' } }) 
                    || await this.stateRepository.findOne({ where: { idState: 3 } });
    
    // Validación contra nulos
    if (!finalState) {
       throw new BadRequestException('Estado FINALIZADA no encontrado en la base de datos.');
    }

    petition.state = finalState;
    await this.petitionRepository.save(petition);
    return this.mapToDto(petition);
  }

  async reactivate(id: number, userEmail: string) {
    const petition = await this.petitionRepository.findOne({ where: { idPetition: id } });
    if (!petition) throw new NotFoundException('Petición no encontrada');

    const activeState = await this.stateRepository.findOne({ where: { name: 'ACTIVA' } })
                     || await this.stateRepository.findOne({ where: { idState: 1 } });
    
    // Validación contra nulos
    if (!activeState) {
       throw new BadRequestException('Estado ACTIVA no encontrado en la base de datos.');
    }
    
    petition.state = activeState;
    petition.isDeleted = false;
    await this.petitionRepository.save(petition);
    return this.mapToDto(petition);
  }
}