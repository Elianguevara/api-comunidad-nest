import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { CustomersService } from './customers.service';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get(':idCustomer')
  getPublicProfile(@Param('idCustomer', ParseIntPipe) idCustomer: number) {
    return this.customersService.getPublicProfile(idCustomer);
  }
}
