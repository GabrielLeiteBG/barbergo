import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CustomersService } from './customers.service';

@Controller('customers')
@UseGuards(JwtAuthGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  findAll(@Req() req: Request) {
    const user = req.user as { id: string };
    return this.customersService.findAll(user.id);
  }

  @Get(':id')
  findOne(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as { id: string };
    return this.customersService.findOne(user.id, id);
  }

  @Post()
  create(
    @Req() req: Request,
    @Body()
    body: {
      name: string;
      phone: string;
      email?: string;
      notes?: string;
    },
  ) {
    const user = req.user as { id: string };
    return this.customersService.create(user.id, body);
  }
}
