import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CustomersService } from './customers.service';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  findAll() {
    return this.customersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(id);
  }

  @Post()
  create(
    @Body()
    body: {
      name: string;
      phone: string;
      email?: string;
      notes?: string;
      barbershopId: string;
    },
  ) {
    return this.customersService.create(body);
  }
}
