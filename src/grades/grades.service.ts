import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GradeProvider } from './entities/grade-provider.entity';
import { GradeCustomer } from './entities/grade-customer.entity';
import { User } from '../users/entities/user.entity';
import { Customer } from '../users/entities/customer.entity';
import { Provider } from '../users/entities/provider.entity';
import { Petition } from '../petitions/entities/petition.entity';
import { Postulation } from '../postulations/entities/postulation.entity';
import { RateRequestDto } from './dto/rate.request.dto';
import { ReviewResponseDto } from './dto/review.response.dto';

@Injectable()
export class GradesService {
  constructor(
    @InjectRepository(GradeProvider) private gradeProviderRepo: Repository<GradeProvider>,
    @InjectRepository(GradeCustomer) private gradeCustomerRepo: Repository<GradeCustomer>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Customer) private customerRepo: Repository<Customer>,
    @InjectRepository(Provider) private providerRepo: Repository<Provider>,
    @InjectRepository(Petition) private petitionRepo: Repository<Petition>,
    @InjectRepository(Postulation) private postulationRepo: Repository<Postulation>,
  ) {}

  async rateProvider(email: string, request: RateRequestDto): Promise<void> {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) throw new NotFoundException('Usuario no encontrado.');

    const customer = await this.customerRepo.findOne({ where: { user: { idUser: user.idUser } } });
    if (!customer) throw new ForbiddenException('No tienes perfil de Cliente activo.');

    const provider = await this.providerRepo.findOne({ where: { idProvider: request.targetId } });
    if (!provider) throw new NotFoundException('Proveedor no encontrado.');

    const petition = await this.petitionRepo.findOne({ 
      where: { idPetition: request.petitionId },
      relations: ['customer']
    });
    if (!petition) throw new NotFoundException('Petición no encontrada.');

    // 1. VALIDACIÓN EXTRA: Verificar si ya lo calificó para ESTE trabajo específico
    const exists = await this.gradeProviderRepo.count({
      where: {
        customer: { idCustomer: customer.idCustomer },
        provider: { idProvider: provider.idProvider },
        petition: { idPetition: petition.idPetition },
      }
    });
    if (exists > 0) throw new BadRequestException('Ya has calificado a este proveedor por este trabajo.');

    // 2. VALIDACIÓN DE SEGURIDAD: ¿La petición le pertenece a este cliente?
    if (petition.customer.idCustomer !== customer.idCustomer) {
      throw new ForbiddenException('Esta petición no te pertenece.');
    }

    // 3. VALIDACIÓN: ¿El proveedor ganó ESTA petición?
    const isWinner = await this.postulationRepo.count({
      where: {
        petition: { idPetition: petition.idPetition },
        provider: { idProvider: provider.idProvider },
        winner: true
      }
    });
    if (isWinner === 0) {
      throw new BadRequestException('No puedes calificar a este proveedor porque no fue el adjudicado para esta petición.');
    }

    // Crear calificación
    const review = this.gradeProviderRepo.create({
      customer,
      provider,
      petition,
      rating: request.rating,
      comment: request.comment,
      isVisible: true,
    });

    await this.gradeProviderRepo.save(review);
  }

  async rateCustomer(email: string, request: RateRequestDto): Promise<void> {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) throw new NotFoundException('Usuario no encontrado.');

    const provider = await this.providerRepo.findOne({ where: { user: { idUser: user.idUser } } });
    if (!provider) throw new ForbiddenException('No tienes perfil de Proveedor activo.');

    const customer = await this.customerRepo.findOne({ where: { idCustomer: request.targetId } });
    if (!customer) throw new NotFoundException('Cliente no encontrado.');

    const petition = await this.petitionRepo.findOne({ 
      where: { idPetition: request.petitionId },
      relations: ['customer']
    });
    if (!petition) throw new NotFoundException('Petición no encontrada.');

    // Validación anti-spam
    const exists = await this.gradeCustomerRepo.count({
      where: {
        provider: { idProvider: provider.idProvider },
        customer: { idCustomer: customer.idCustomer },
        petition: { idPetition: petition.idPetition }
      }
    });
    if (exists > 0) throw new BadRequestException('Ya has calificado a este cliente por este trabajo.');

    // Verificar ganador y pertenencia
    const isWinner = await this.postulationRepo.count({
      where: {
        petition: { idPetition: petition.idPetition },
        provider: { idProvider: provider.idProvider },
        winner: true
      }
    });

    if (isWinner === 0 || petition.customer.idCustomer !== customer.idCustomer) {
      throw new ForbiddenException('No estás autorizado a calificar a este cliente en este trabajo.');
    }

    const review = this.gradeCustomerRepo.create({
      provider,
      customer,
      petition,
      rating: request.rating,
      comment: request.comment,
      isVisible: true,
    });

    await this.gradeCustomerRepo.save(review);
  }

  async getProviderReviews(providerId: number, page: number, size: number) {
    const [reviews, total] = await this.gradeProviderRepo.findAndCount({
      where: { provider: { idProvider: providerId } },
      relations: ['customer', 'customer.user'],
      order: { idGradeProvider: 'DESC' },
      skip: page * size,
      take: size,
    });

    const content: ReviewResponseDto[] = reviews.map(r => ({
      idReview: r.idGradeProvider,
      reviewerName: r.customer?.user?.name || 'Usuario',
      rating: r.rating,
      comment: r.comment,
      date: r.createdDate || new Date(),
    }));

    return {
      content,
      pageable: { pageNumber: page, pageSize: size },
      totalElements: total,
      totalPages: Math.ceil(total / size),
    };
  }

  async getCustomerReviews(idCustomer: number, page: number, size: number, sort: string) {
    const customer = await this.customerRepo.findOne({
      where: { idCustomer },
    });
    if (!customer) throw new NotFoundException('Cliente no encontrado.');

    const [sortFieldRaw, sortDirectionRaw] = sort.split(',');
    const sortFieldMap: Record<string, string> = {
      idGradeCustomer: 'idGradeCustomer',
      rating: 'rating',
      date: 'createdDate',
      createdDate: 'createdDate',
    };
    const orderField = sortFieldMap[sortFieldRaw] || 'idGradeCustomer';
    const orderDirection = sortDirectionRaw?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const [reviews, total] = await this.gradeCustomerRepo.findAndCount({
      where: {
        customer: { idCustomer },
        isVisible: true,
      },
      relations: ['provider', 'provider.user'],
      order: { [orderField]: orderDirection } as any,
      skip: page * size,
      take: size,
    });

    const content: ReviewResponseDto[] = reviews.map(r => ({
      idReview: r.idGradeCustomer,
      reviewerName: r.provider?.user
        ? `${r.provider.user.name} ${r.provider.user.lastname}`.trim()
        : 'Usuario',
      rating: r.rating,
      comment: r.comment,
      date: r.createdDate || new Date(),
    }));

    return {
      content,
      totalPages: Math.ceil(total / size),
      totalElements: total,
      size,
      number: page,
    };
  }

  async hasCustomerRatedProvider(email: string, providerId: number, petitionId: number): Promise<boolean> {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) return false;

    const customer = await this.customerRepo.findOne({ where: { user: { idUser: user.idUser } } });
    if (!customer) return false;

    const count = await this.gradeProviderRepo.count({
      where: {
        customer: { idCustomer: customer.idCustomer },
        provider: { idProvider: providerId },
        petition: { idPetition: petitionId },
      }
    });

    return count > 0;
  }

  async getCustomerRatingStatus(email: string, petitionId: number): Promise<any> {
    const result = {
      canRate: false,
      hasRated: false,
      customerId: null as number | null, // <-- Le decimos que puede ser number o null
      customerName: null as string | null, // <-- Le decimos que puede ser string o null
    };

    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) return result;

    const provider = await this.providerRepo.findOne({ where: { user: { idUser: user.idUser } } });
    if (!provider) return result;

    const petition = await this.petitionRepo.findOne({ 
      where: { idPetition: petitionId },
      relations: ['state', 'customer', 'customer.user']
    });

    // Solo se puede calificar si la petición está FINALIZADA
    if (!petition || petition.state?.name !== 'FINALIZADA') return result;

    result.customerId = petition.customer.idCustomer;
    result.customerName = `${petition.customer.user.name} ${petition.customer.user.lastname}`;

    // Verificar si este proveedor fue el ganador
    const isWinner = await this.postulationRepo.count({
      where: {
        petition: { idPetition: petitionId },
        provider: { idProvider: provider.idProvider },
        winner: true
      }
    });
    if (isWinner === 0) return result;

    // Verificar si ya calificó
    const hasRatedCount = await this.gradeCustomerRepo.count({
      where: {
        provider: { idProvider: provider.idProvider },
        customer: { idCustomer: petition.customer.idCustomer },
        petition: { idPetition: petitionId }
      }
    });

    result.hasRated = hasRatedCount > 0;
    result.canRate = !result.hasRated;

    return result;
  }
}
