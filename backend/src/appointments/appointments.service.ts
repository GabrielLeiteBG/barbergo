import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AppointmentsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.appointment.findMany({
      orderBy: { appointmentAt: 'asc' },
      include: {
        customer: true,
        barbershop: true,
      },
    });
  }

  async findOne(id: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        customer: true,
        barbershop: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found.');
    }

    return appointment;
  }

  create(data: {
    serviceName: string;
    appointmentAt: string;
    status?: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELED';
    notes?: string;
    customerId: string;
    barbershopId: string;
  }) {
    return this.prisma.appointment.create({
      data: {
        serviceName: data.serviceName,
        appointmentAt: new Date(data.appointmentAt),
        status: data.status,
        notes: data.notes,
        customerId: data.customerId,
        barbershopId: data.barbershopId,
      },
      include: {
        customer: true,
        barbershop: true,
      },
    });
  }
}
