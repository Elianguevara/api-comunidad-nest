import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Postulation } from './entities/postulation.entity';
import { PostulationState } from './entities/postulation-state.entity';
import { Petition } from '../petitions/entities/petition.entity';
import { PetitionState } from '../petitions/entities/petition-state.entity';
import { Provider } from '../users/entities/provider.entity';
import { User } from '../users/entities/user.entity';
import { PostulationRequestDto } from './dto/postulation.request.dto';
import { PostulationResponseDto } from './dto/postulation.response.dto';
import { NotificationsService } from '../notifications/notifications.service'; // <-- IMPORTADO

@Injectable()
export class PostulationsService {
  constructor(
    @InjectRepository(Postulation) private postulationRepo: Repository<Postulation>,
    @InjectRepository(PostulationState) private postulationStateRepo: Repository<PostulationState>,
    @InjectRepository(Petition) private petitionRepo: Repository<Petition>,
    @InjectRepository(PetitionState) private petitionStateRepo: Repository<PetitionState>,
    @InjectRepository(Provider) private providerRepo: Repository<Provider>,
    @InjectRepository(User) private userRepo: Repository<User>,
    private readonly notificationService: NotificationsService, // <-- INYECTADO
  ) {}

  async createPostulation(email: string, request: PostulationRequestDto): Promise<PostulationResponseDto> {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) throw new NotFoundException('Usuario no encontrado.');

    const provider = await this.providerRepo.findOne({ 
      where: { user: { idUser: user.idUser } },
      relations: ['user'] 
    });
    if (!provider) throw new ForbiddenException('Acceso denegado: Solo proveedores pueden postularse.');

    const petition = await this.petitionRepo.findOne({ 
      where: { idPetition: request.idPetition },
      relations: ['state', 'customer', 'customer.user', 'profession'] // Cargamos relaciones para notificar
    });
    if (!petition) throw new NotFoundException('La petición no existe.');

    if (petition.state.name !== 'PUBLICADA') {
      throw new BadRequestException(`No puedes postularte a una solicitud que está ${petition.state.name}`);
    }

    const exists = await this.postulationRepo.findOne({
      where: { 
        petition: { idPetition: petition.idPetition },
        provider: { idProvider: provider.idProvider }
      }
    });
    if (exists) throw new BadRequestException('Ya te has postulado a este trabajo.');

    const initialState = await this.postulationStateRepo.findOne({ where: { name: 'PENDIENTE' } });
    if (!initialState) throw new BadRequestException('Error interno: Estado PENDIENTE no configurado.');

    const postulation = this.postulationRepo.create({
      petition: petition,
      provider: provider,
      proposal: `Presupuesto: $${request.budget} | Detalle: ${request.description}`,
      winner: false,
      isDeleted: false,
      state: initialState,
    });

    const savedPostulation = await this.postulationRepo.save(postulation);

    // --- NOTIFICACIÓN AL CLIENTE ---
    await this.notificationService.notifyNewPostulation(petition);

    return this.mapToResponse(savedPostulation, provider, petition, request.budget);
  }

  async getPostulationsByPetition(idPetition: number, email: string): Promise<PostulationResponseDto[]> {
    const postulations = await this.postulationRepo.find({
      where: { petition: { idPetition } },
      relations: ['provider', 'provider.user', 'petition', 'state']
    });

    return postulations.map(p => this.mapToResponse(p, p.provider, p.petition));
  }

  async acceptPostulation(idPostulation: number, clientEmail: string): Promise<void> {
    const winner = await this.postulationRepo.findOne({
      where: { idPostulation },
      relations: [
        'petition', 
        'petition.customer', 
        'petition.customer.user', 
        'petition.state',
        'provider',
        'provider.user'
      ]
    });
    if (!winner) throw new NotFoundException('Postulación no encontrada.');

    const petition = winner.petition;

    if (petition.customer.user.email !== clientEmail) {
      throw new ForbiddenException('No tienes permisos para realizar esta acción.');
    }

    const currentState = petition.state.name;
    if (currentState === 'CANCELADA' || currentState === 'FINALIZADA') {
      throw new BadRequestException(`No se puede adjudicar una solicitud que está ${currentState}`);
    }

    const acceptedState = await this.postulationStateRepo.findOne({ where: { name: 'ACEPTADA' } });
    if (!acceptedState) throw new BadRequestException("Estado 'ACEPTADA' no configurado.");
    
    winner.state = acceptedState;
    winner.winner = true;
    await this.postulationRepo.save(winner);

    const adjudicadaState = await this.petitionStateRepo.findOne({ where: { name: 'ADJUDICADA' } });
    if (!adjudicadaState) throw new BadRequestException("Estado 'ADJUDICADA' no configurado.");
    
    petition.state = adjudicadaState;
    await this.petitionRepo.save(petition);

    // --- NOTIFICACIÓN AL GANADOR ---
    await this.notificationService.notifyPostulationAccepted(winner);

    const rejectedState = await this.postulationStateRepo.findOne({ where: { name: 'RECHAZADA' } });
    if (!rejectedState) throw new BadRequestException("Estado 'RECHAZADA' no configurado.");

    const others = await this.postulationRepo.find({
      where: { 
        petition: { idPetition: petition.idPetition },
        idPostulation: Not(winner.idPostulation)
      },
      relations: ['provider', 'provider.user', 'petition']
    });

    for (const loser of others) {
      loser.state = rejectedState;
      await this.postulationRepo.save(loser);
      // --- NOTIFICACIÓN DE RECHAZO A LOS DEMÁS ---
      await this.notificationService.notifyPostulationRejected(loser);
    }
  }

  async getMyPostulations(email: string, page: number, size: number) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) throw new NotFoundException('Usuario no encontrado.');

    const provider = await this.providerRepo.findOne({ where: { user: { idUser: user.idUser } } });
    if (!provider) throw new ForbiddenException('Perfil de proveedor no encontrado.');

    const [postulations, total] = await this.postulationRepo.findAndCount({
      where: { provider: { idProvider: provider.idProvider } },
      relations: ['provider', 'provider.user', 'petition', 'state'],
      order: { createdDate: 'DESC' },
      skip: page * size,
      take: size,
    });

    return {
      content: postulations.map(p => this.mapToResponse(p, p.provider, p.petition)),
      pageable: { pageNumber: page, pageSize: size },
      totalElements: total,
      totalPages: Math.ceil(total / size),
    };
  }

  async checkIfApplied(idPetition: number, email: string): Promise<boolean> {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) throw new NotFoundException('Usuario no encontrado.');

    const provider = await this.providerRepo.findOne({ where: { user: { idUser: user.idUser } } });
    if (!provider) throw new ForbiddenException('No eres proveedor.');

    const count = await this.postulationRepo.count({
      where: {
        petition: { idPetition },
        provider: { idProvider: provider.idProvider }
      }
    });

    return count > 0;
  }

  private mapToResponse(p: Postulation, provider: Provider, petition: Petition, originalBudget?: number): PostulationResponseDto {
    const finalRating = 0.0; 

    let budget = originalBudget || 0;
    if (!originalBudget && p.proposal) {
      const match = p.proposal.match(/Presupuesto: \$([\d.]+)/);
      if (match) budget = parseFloat(match[1]);
    }

    return {
      idPostulation: p.idPostulation,
      description: p.proposal,
      budget: budget,
      providerId: provider.idProvider,
      providerName: `${provider.user.name} ${provider.user.lastname}`,
      providerImage: provider.user.profileImage,
      providerRating: finalRating,
      petitionTitle: petition.description,
      petitionId: petition.idPetition,
      stateName: p.state?.name || 'PENDIENTE',
      isWinner: p.winner,
      datePostulation: p.createdDate ? p.createdDate.toISOString() : new Date().toISOString(),
      proposal: p.proposal,
    };
  }
}