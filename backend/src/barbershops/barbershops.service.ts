import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BarbershopsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    data: {
      name: string;
      phone?: string;
      email?: string;
      address?: string;
      opensAt?: string;
      closesAt?: string;
      workingDays?: string;
    },
  ) {
    const barbershop = await this.prisma.barbershop.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email,
        address: data.address,
        opensAt: data.opensAt,
        closesAt: data.closesAt,
        workingDays: data.workingDays,
      },
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        barbershopId: barbershop.id,
      },
    });

    return barbershop;
  }

  async findMine(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        barbershop: true,
      },
    });

    if (!user || !user.barbershop) {
      throw new NotFoundException('Barbershop not found.');
    }

    return user.barbershop;
  }

  async updateMine(
    userId: string,
    data: {
      name?: string;
      phone?: string;
      email?: string;
      address?: string;
      opensAt?: string;
      closesAt?: string;
      workingDays?: string;
    },
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user?.barbershopId) {
      throw new NotFoundException('Barbershop not found.');
    }

    return this.prisma.barbershop.update({
      where: { id: user.barbershopId },
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email,
        address: data.address,
        opensAt: data.opensAt,
        closesAt: data.closesAt,
        workingDays: data.workingDays,
      },
    });
  }
}