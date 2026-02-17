import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';

import { Petition } from './entities/petition.entity';
import { PetitionState } from './entities/petition-state.entity';
import { PetitionAttachment } from './entities/petition-attachment.entity';
import { TypePetition } from './entities/type-petition.entity';
import { Customer } from '../users/entities/customer.entity';
import { User } from '../users/entities/user.entity';
import { Profession } from '../metadata/entities/profession.entity';
import { City } from '../metadata/entities/city.entity';

import { PetitionRequestDto } from './dto/petition.request.dto';
import { PetitionResponseDto } from './dto/petition.response.dto';

@Injectable()
export class PetitionsService {
  private readonly logger = new Logger(PetitionsService.name);

  constructor(
    @InjectRepository(Petition) private petitionRepo: Repository<Petition>,
    @InjectRepository(PetitionState) private petitionStateRepo: Repository<PetitionState>,
    @InjectRepository(PetitionAttachment) private petitionAttachmentRepo: Repository<PetitionAttachment>,
    @InjectRepository(TypePetition) private typePetitionRepo: Repository<TypePetition>,
    @InjectRepository(Customer) private customerRepo: Repository<Customer>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Profession) private professionRepo: Repository<Profession>,
    @InjectRepository(City) private cityRepo: Repository<City>,
  ) {}

  async createPetition(email: string, request: PetitionRequestDto): Promise<PetitionResponseDto> {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) throw new NotFoundException('Usuario no encontrado.');

    const customer = await this.customerRepo.findOne({ where: { user: { idUser: user.idUser } } });
    if (!customer) throw new ForbiddenException('El usuario no tiene perfil de Cliente activo.');

    const profession = await this.professionRepo.findOne({ where: { idProfession: request.idProfession } });
    if (!profession) throw new NotFoundException('Profesión no encontrada.');

    const typePetition = await this.typePetitionRepo.findOne({ where: { idTypePetition: request.idTypePetition } });
    if (!typePetition) throw new NotFoundException('Tipo de petición no encontrado.');

    const city = await this.cityRepo.findOne({ where: { idCity: request.idCity } });
    if (!city) throw new NotFoundException('Ciudad no encontrada.');

    const state = await this.petitionStateRepo.findOne({ where: { name: 'PUBLICADA' } });
    if (!state) throw new BadRequestException("Estado 'PUBLICADA' no configurado en BD.");

    // 1. Guardar petición principal (CORREGIDO EL dateUntil)
    const petition = this.petitionRepo.create({
      customer,
      description: request.description,
      dateSince: new Date(),
      // Cambiamos null por undefined para que TypeScript y TypeORM sean felices
      dateUntil: request.dateUntil ? new Date(request.dateUntil) : undefined, 
      isDeleted: false,
      profession,
      typePetition,
      city,
      state,
    });

    const savedPetition = await this.petitionRepo.save(petition);

    // 2. Guardar imagen adjunta si existe
    if (request.imageUrl && request.imageUrl.trim() !== '') {
      const attachment = this.petitionAttachmentRepo.create({
        petition: savedPetition,
        url: request.imageUrl,
        userCreate: user,
        dateCreate: new Date(),
      });
      await this.petitionAttachmentRepo.save(attachment);
    }

    return this.mapToResponse(savedPetition);
  }

  async getFeed(email: string, page: number, size: number) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const [petitions, total] = await this.petitionRepo.findAndCount({
      where: {
        state: { name: 'PUBLICADA' },
        customer: { user: { idUser: Not(user.idUser) } }, // Filtro para no ver las propias
      },
      relations: ['customer', 'customer.user', 'city', 'typePetition', 'profession', 'state'],
      order: { dateSince: 'DESC' },
      skip: page * size,
      take: size,
    });

    const content = await Promise.all(petitions.map(p => this.mapToResponse(p)));

    return {
      content,
      pageable: { pageNumber: page, pageSize: size },
      totalElements: total,
      totalPages: Math.ceil(total / size),
    };
  }

  async getMyPetitions(email: string, page: number, size: number) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const customer = await this.customerRepo.findOne({ where: { user: { idUser: user.idUser } } });
    if (!customer) throw new ForbiddenException('No se encontró perfil de cliente para este usuario.');

    const [petitions, total] = await this.petitionRepo.findAndCount({
      where: { customer: { idCustomer: customer.idCustomer } },
      relations: ['customer', 'customer.user', 'city', 'typePetition', 'profession', 'state'],
      order: { dateSince: 'DESC' },
      skip: page * size,
      take: size,
    });

    const content = await Promise.all(petitions.map(p => this.mapToResponse(p)));

    return {
      content,
      pageable: { pageNumber: page, pageSize: size },
      totalElements: total,
      totalPages: Math.ceil(total / size),
    };
  }

  async getPetitionById(id: number, email: string): Promise<PetitionResponseDto> {
    const petition = await this.petitionRepo.findOne({
      where: { idPetition: id },
      relations: ['customer', 'customer.user', 'city', 'typePetition', 'profession', 'state']
    });
    if (!petition) throw new NotFoundException(`Solicitud no encontrada con ID: ${id}`);

    return this.mapToResponse(petition);
  }

  async completePetition(id: number, userEmail: string): Promise<PetitionResponseDto> {
    const petition = await this.findAndValidateOwnership(id, userEmail);

    const finishedState = await this.petitionStateRepo.findOne({ where: { name: 'FINALIZADA' } });
    if (!finishedState) throw new BadRequestException("Estado 'FINALIZADA' no configurado en BD.");

    petition.state = finishedState;
    const saved = await this.petitionRepo.save(petition);
    
    this.logger.log(`Petición ID ${id} marcada como FINALIZADA por el usuario ${userEmail}`);
    return this.mapToResponse(saved);
  }

  async deletePetition(id: number, email: string): Promise<void> {
    const petition = await this.findAndValidateOwnership(id, email);

    const cancelledState = await this.petitionStateRepo.findOne({ where: { name: 'CANCELADA' } });
    if (!cancelledState) throw new BadRequestException("Estado 'CANCELADA' no configurado en BD.");

    petition.isDeleted = true;
    petition.state = cancelledState;

    await this.petitionRepo.save(petition);
    this.logger.log(`Petición ID ${id} cancelada por el usuario ${email}`);
  }

  async reactivatePetition(id: number, userEmail: string): Promise<PetitionResponseDto> {
    const petition = await this.findAndValidateOwnership(id, userEmail);

    if (petition.dateUntil && new Date(petition.dateUntil) < new Date()) {
      throw new BadRequestException("No se puede reactivar una solicitud con fecha de cierre vencida.");
    }

    const publicState = await this.petitionStateRepo.findOne({ where: { name: 'PUBLICADA' } });
    if (!publicState) throw new BadRequestException("Estado 'PUBLICADA' no configurado en BD.");

    petition.state = publicState;
    petition.isDeleted = false;

    const saved = await this.petitionRepo.save(petition);
    return this.mapToResponse(saved);
  }

  // --- Helpers ---
  private async findAndValidateOwnership(id: number, email: string): Promise<Petition> {
    const petition = await this.petitionRepo.findOne({
      where: { idPetition: id },
      relations: ['customer', 'customer.user', 'state']
    });

    if (!petition) throw new NotFoundException('Solicitud no encontrada');
    if (petition.customer?.user?.email !== email) {
      throw new ForbiddenException('No tienes permisos sobre esta solicitud.');
    }

    return petition;
  }

  private async mapToResponse(petition: Petition): Promise<PetitionResponseDto> {
    // Buscar la imagen en la tabla de adjuntos
    const attachments = await this.petitionAttachmentRepo.find({
      where: { petition: { idPetition: petition.idPetition } }
    });

    return {
      idPetition: petition.idPetition,
      description: petition.description,
      typePetitionName: petition.typePetition?.typePetitionName || "Sin categoría",
      professionName: petition.profession?.name || "Profesión no especificada",
      stateName: petition.state?.name || "ESTADO_DESCONOCIDO",
      dateSince: petition.dateSince,
      dateUntil: petition.dateUntil,
      customerName: petition.customer?.user ? `${petition.customer.user.name} ${petition.customer.user.lastname}` : "Usuario Desconocido",
      cityName: petition.city?.name || "Ubicación no especificada",
      imageUrl: attachments.length > 0 ? attachments[0].url : null,
    };
  }
}