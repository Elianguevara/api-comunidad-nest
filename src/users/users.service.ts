import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Customer } from './entities/customer.entity';
import { Provider } from './entities/provider.entity';
import { UpdateProfileDto, UpdateProviderProfileDto } from './dto/user-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Customer) private customerRepository: Repository<Customer>,
    @InjectRepository(Provider) private providerRepository: Repository<Provider>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async create(userData: Partial<User>): Promise<User> {
    const newUser = this.userRepository.create(userData);
    return this.userRepository.save(newUser);
  }

  // --- 1. Obtener mi perfil completo ---
  async getMyProfile(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const customer = await this.customerRepository.findOne({ 
      where: { user: { idUser: user.idUser } },
      relations: ['address']
    });

    const provider = await this.providerRepository.findOne({
      where: { user: { idUser: user.idUser } },
      relations: ['profession', 'cities', 'address']
    });

    const role = provider ? 'PROVIDER' : 'CUSTOMER';

    // --- CORRECCIÓN: Le decimos a TypeScript que puede ser string o undefined ---
    let fullAddress: string | undefined = undefined;
    
    if (provider?.address) {
      fullAddress = `${provider.address.street || ''} ${provider.address.number || ''}`.trim();
    } else if (customer?.address) {
      fullAddress = `${customer.address.street || ''} ${customer.address.number || ''}`.trim();
    }

    // Armamos exactamente el JSON que espera React
    return {
      id: user.idUser, 
      name: user.name,
      lastname: user.lastname,
      email: user.email,
      role: role,
      profileImage: user.profileImage,
      providerId: provider?.idProvider, 
      customerId: customer?.idCustomer, 
      description: provider?.description,
      profession: provider?.profession?.name, 
      phone: customer?.phone,
      address: fullAddress,
      stats: role === 'PROVIDER' 
        ? [{ label: 'Nivel', value: 'Profesional' }, { label: 'Trabajos', value: '0' }] 
        : [{ label: 'Actividad', value: 'Alta' }, { label: 'Peticiones', value: '0' }]
    };
  }

  // --- 2. Actualizar datos base (Nombre, Foto, Teléfono) ---
  async updateProfile(email: string, data: UpdateProfileDto) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    if (data.name) user.name = data.name;
    if (data.lastname) user.lastname = data.lastname;
    if (data.profileImage) user.profileImage = data.profileImage;
    await this.userRepository.save(user);

    if (data.phone) {
      const customer = await this.customerRepository.findOne({ 
        where: { user: { idUser: user.idUser } } 
      });
      if (customer) {
        customer.phone = data.phone;
        await this.customerRepository.save(customer);
      }
    }

    return this.getMyProfile(email);
  }

  // --- 3. Actualizar datos profesionales (Proveedor) ---
  async updateProviderProfile(email: string, data: UpdateProviderProfileDto) {
    const provider = await this.providerRepository.findOne({
      where: { user: { email } },
      relations: ['cities', 'profession']
    });

    if (!provider) throw new NotFoundException('Perfil de proveedor no encontrado');

    if (data.description !== undefined) {
      provider.description = data.description;
    }
    
    if (data.idProfession) {
      provider.profession = { idProfession: data.idProfession } as any;
    }

    if (data.cityIds) {
      provider.cities = data.cityIds.map(id => ({ idCity: id })) as any;
    }

    await this.providerRepository.save(provider);
    return { mensaje: 'Perfil de proveedor actualizado correctamente.' };
  }

  // --- 4. Ver el Perfil Público de un Proveedor ---
  async getProviderPublicProfile(id: number) {
    const provider = await this.providerRepository.findOne({
      where: { idProvider: id },
      relations: ['user', 'profession', 'cities']
    });

    if (!provider) throw new NotFoundException('Proveedor no encontrado.');

    return {
      idProvider: provider.idProvider,
      userId: provider.user.idUser,
      name: provider.user.name,
      lastname: provider.user.lastname,
      profileImage: provider.user.profileImage,
      biography: provider.description,
      professions: provider.profession ? [provider.profession.name] : [],
      cities: provider.cities?.map(c => c.name) || [],
      rating: 0.0, 
      totalReviews: 0,
    };
  }

  // --- 5. Eliminar cuenta (Baja Lógica) ---
  async deleteUser(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    user.isActive = false;
    user.enabled = false;
    await this.userRepository.save(user);

    return { mensaje: 'Tu cuenta ha sido eliminada exitosamente (Baja lógica).' };
  }
}