import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get()
  findAll() {
    return this.appointmentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(id);
  }

  @Post()
  create(
    @Body()
    body: {
      serviceName: string;
      appointmentAt: string;
      status?: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELED';
      notes?: string;
      customerId: string;
      barbershopId: string;
    },
  ) {
    return this.appointmentsService.create(body);
  }
}
