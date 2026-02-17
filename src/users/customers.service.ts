import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { GradeCustomer } from '../grades/entities/grade-customer.entity';
import { Petition } from '../petitions/entities/petition.entity';
import { CustomerPublicProfileResponseDto } from './dto/customer-public-profile.response.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer) private customerRepo: Repository<Customer>,
    @InjectRepository(GradeCustomer) private gradeCustomerRepo: Repository<GradeCustomer>,
    @InjectRepository(Petition) private petitionRepo: Repository<Petition>,
  ) {}

  async getPublicProfile(idCustomer: number): Promise<CustomerPublicProfileResponseDto> {
    const customer = await this.customerRepo.findOne({
      where: { idCustomer },
      relations: ['user', 'address', 'address.city'],
    });
    if (!customer) throw new NotFoundException('Cliente no encontrado.');

    const avgResult = await this.gradeCustomerRepo
      .createQueryBuilder('grade')
      .select('AVG(grade.rating)', 'average')
      .where('grade.id_customer = :idCustomer', { idCustomer })
      .andWhere('grade.is_visible = :isVisible', { isVisible: true })
      .getRawOne();

    const avg = avgResult?.average ? parseFloat(avgResult.average) : 0;
    const rating = Math.round(avg * 10.0) / 10.0;

    const totalReviews = await this.gradeCustomerRepo.count({
      where: {
        customer: { idCustomer },
        isVisible: true,
      },
    });

    const completedPetitions = await this.petitionRepo
      .createQueryBuilder('petition')
      .leftJoin('petition.customer', 'customer')
      .leftJoin('petition.state', 'state')
      .where('customer.idCustomer = :idCustomer', { idCustomer })
      .andWhere('state.name = :stateName', { stateName: 'FINALIZADA' })
      .andWhere('petition.isDeleted = :isDeleted', { isDeleted: false })
      .getCount();

    return {
      idCustomer: customer.idCustomer,
      userId: customer.user.idUser,
      name: customer.user.name,
      lastname: customer.user.lastname,
      profileImage: customer.user.profileImage ?? null,
      city: customer.address?.city?.name,
      rating,
      totalReviews,
      completedPetitions,
    };
  }
}
