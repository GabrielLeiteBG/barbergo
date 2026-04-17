import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  private async getUserBarbershopId(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { barbershopId: true },
    });

    if (!user?.barbershopId) {
      throw new NotFoundException('Barbershop not found.');
    }

    return user.barbershopId;
  }

  async findAll(userId: string) {
    const barbershopId = await this.getUserBarbershopId(userId);

    return this.prisma.customer.findMany({
      where: { barbershopId },
      orderBy: { createdAt: 'desc' },
      include: {
        appointments: true,
      },
    });
  }

  async findOne(userId: string, customerId: string) {
    const barbershopId = await this.getUserBarbershopId(userId);

    const customer = await this.prisma.customer.findFirst({
      where: {
        id: customerId,
        barbershopId,
      },
      include: {
        appointments: true,
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found.');
    }

    return customer;
  }

  async create(
    userId: string,
    data: {
      name: string;
      phone: string;
      email?: string;
      notes?: string;
    },
  ) {
    const barbershopId = await this.getUserBarbershopId(userId);

    return this.prisma.customer.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email,
        notes: data.notes,
        barbershopId,
      },
    });
  }
}
