import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from './entities/user.entity';
import { Customer } from './entities/customer.entity';
import { Provider } from './entities/provider.entity';
import { Profession } from '../metadata/entities/profession.entity';
import { UpdateProfileDto, UserProfileResponseDto, StatDTO } from './dto/user-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Customer) private customerRepository: Repository<Customer>,
    @InjectRepository(Provider) private providerRepository: Repository<Provider>,
    @InjectRepository(Profession) private professionRepository: Repository<Profession>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async create(userData: Partial<User>): Promise<User> {
    const newUser = this.userRepository.create(userData);
    return this.userRepository.save(newUser);
  }

  async getMyProfile(email: string): Promise<UserProfileResponseDto> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const provider = await this.providerRepository.findOne({
      where: { user: { idUser: user.idUser } },
      relations: ['profession', 'address']
    });

    const customer = await this.customerRepository.findOne({
      where: { user: { idUser: user.idUser } },
      relations: ['address']
    });

    // Construimos la base de la respuesta
    const response: UserProfileResponseDto = {
      id: user.idUser,
      name: user.name,
      lastname: user.lastname,
      email: user.email,
      profileImage: user.profileImage,
      role: 'ADMIN', // Por defecto, se sobreescribe abajo
      stats: [],
    };

    if (provider) {
      response.role = 'PROVIDER';
      response.providerId = provider.idProvider;
      response.description = provider.description;

      if (provider.profession) {
        response.profession = provider.profession.name;
      }

      if (provider.address) {
        response.address = `${provider.address.street || ''} ${provider.address.number || ''}`.trim();
      }

      response.stats = [
        { label: "Nivel", value: "Profesional" },
        { label: "Trabajos", value: "0" }
      ];

    } else if (customer) {
      response.role = 'CUSTOMER';
      response.customerId = customer.idCustomer;
      response.phone = customer.phone;

      if (customer.address) {
        response.address = `${customer.address.street || ''} ${customer.address.number || ''}`.trim();
      }

      response.stats = [
        { label: "Actividad", value: "Alta" },
        { label: "Peticiones", value: "0" }
      ];
    }

    return response;
  }

  async updateProfile(email: string, request: UpdateProfileDto): Promise<UserProfileResponseDto> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    // 1. Actualizar datos base
    if (request.name) user.name = request.name;
    if (request.lastname) user.lastname = request.lastname;
    if (request.profileImage !== undefined) {
      user.profileImage = request.profileImage;
    }
    
    await this.userRepository.save(user);

    // 2. Actualizar datos específicos
    const provider = await this.providerRepository.findOne({ where: { user: { idUser: user.idUser } } });
    const customer = await this.customerRepository.findOne({ where: { user: { idUser: user.idUser } } });

    if (provider) {
      if (request.description !== undefined) {
        provider.description = request.description;
      }

      if (request.idProfession) {
        const profession = await this.professionRepository.findOne({ where: { idProfession: request.idProfession } });
        if (!profession) throw new NotFoundException('Profesión inválida');
        provider.profession = profession;
      }

      await this.providerRepository.save(provider);

    } else if (customer) {
      if (request.phone !== undefined) {
        customer.phone = request.phone;
      }
      await this.customerRepository.save(customer);
    }

    // 3. Devolver el perfil actualizado
    return this.getMyProfile(email);
  }

  async deleteUserByEmail(email: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    
    user.isActive = false;
    user.enabled = false;
    await this.userRepository.save(user);
  }
}