import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { AppointmentStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AppointmentsService {
  constructor(private readonly prisma: PrismaService) {}

  private timeToMinutes(time: string) {
    const [hours, minutes] = time.split(':').map(Number);

    if (
      !Number.isInteger(hours) ||
      !Number.isInteger(minutes) ||
      hours < 0 ||
      hours > 23 ||
      minutes < 0 ||
      minutes > 59
    ) {
      throw new BadRequestException('Invalid barbershop schedule configuration.');
    }

    return hours * 60 + minutes;
  }

  private getAppointmentMinutes(date: Date) {
    return date.getHours() * 60 + date.getMinutes();
  }

  private validateWorkingDay(appointmentDate: Date, workingDays?: string | null) {
    if (!workingDays) {
      return;
    }

    const allowedDays = workingDays
      .split(',')
      .map((day) => day.trim())
      .filter((day) => day !== '')
      .map((day) => Number(day));

    if (
      allowedDays.some(
        (day) => !Number.isInteger(day) || day < 0 || day > 6,
      )
    ) {
      throw new BadRequestException('Invalid barbershop schedule configuration.');
    }

    if (!allowedDays.includes(appointmentDate.getDay())) {
      throw new BadRequestException(
        'Appointment is outside the barbershop working days.',
      );
    }
  }

  private validateWorkingHours(
    appointmentDate: Date,
    opensAt?: string | null,
    closesAt?: string | null,
  ) {
    if (!opensAt || !closesAt) {
      return;
    }

    const opensAtMinutes = this.timeToMinutes(opensAt);
    const closesAtMinutes = this.timeToMinutes(closesAt);
    const appointmentMinutes = this.getAppointmentMinutes(appointmentDate);

    if (appointmentMinutes < opensAtMinutes || appointmentMinutes > closesAtMinutes) {
      throw new BadRequestException(
        'Appointment is outside the barbershop working hours.',
      );
    }
  }

  private validateBarbershopSchedule(
    appointmentDate: Date,
    schedule: {
      opensAt?: string | null;
      closesAt?: string | null;
      workingDays?: string | null;
    },
  ) {
    this.validateWorkingDay(appointmentDate, schedule.workingDays);
    this.validateWorkingHours(
      appointmentDate,
      schedule.opensAt,
      schedule.closesAt,
    );
  }

  async findAll(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user?.barbershopId) {
      throw new NotFoundException("Barbershop not found for this user.");
    }

    return this.prisma.appointment.findMany({
      where: {
        barbershopId: user.barbershopId,
      },
      include: {
        customer: true,
      },
      orderBy: {
        appointmentAt: "asc",
      },
    });
  }

  async findOne(userId: string, appointmentId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user?.barbershopId) {
      throw new NotFoundException("Barbershop not found for this user.");
    }

    const appointment = await this.prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        barbershopId: user.barbershopId,
      },
      include: {
        customer: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException("Appointment not found.");
    }

    return appointment;
  }

  async create(
    userId: string,
    data: {
      customerId: string;
      serviceName: string;
      appointmentAt: string;
      notes?: string;
    },
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        barbershop: {
          select: {
            id: true,
            opensAt: true,
            closesAt: true,
            workingDays: true,
          },
        },
      },
    });

    if (!user?.barbershopId) {
      throw new NotFoundException("Barbershop not found for this user.");
    }

    const appointmentDate = new Date(data.appointmentAt);

    if (appointmentDate.getTime() <= Date.now()) {
      throw new BadRequestException("Appointment date must be in the future.");
    }

    if (user.barbershop) {
      this.validateBarbershopSchedule(appointmentDate, user.barbershop);
    }

    const customer = await this.prisma.customer.findFirst({
      where: {
        id: data.customerId,
        barbershopId: user.barbershopId,
      },
    });

    if (!customer) {
      throw new NotFoundException("Customer not found.");
    }

    const conflictingAppointment = await this.prisma.appointment.findFirst({
      where: {
        barbershopId: user.barbershopId,
        appointmentAt: appointmentDate,
        status: {
          in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED],
        },
      },
    });

    if (conflictingAppointment) {
      throw new BadRequestException("This time slot is already booked.");
    }

    return this.prisma.appointment.create({
      data: {
        serviceName: data.serviceName,
        appointmentAt: appointmentDate,
        notes: data.notes,
        customerId: customer.id,
        barbershopId: user.barbershopId,
        status: AppointmentStatus.PENDING,
      },
      include: {
        customer: true,
      },
    });
  }

  async createPublic(data: {
    barbershopId: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    serviceName: string;
    appointmentAt: string;
    notes?: string;
  }) {
    const barbershop = await this.prisma.barbershop.findUnique({
      where: { id: data.barbershopId },
      select: {
        id: true,
        opensAt: true,
        closesAt: true,
        workingDays: true,
      },
    });

    if (!barbershop) {
      throw new NotFoundException("Barbershop not found.");
    }

    const appointmentDate = new Date(data.appointmentAt);

    if (appointmentDate.getTime() <= Date.now()) {
      throw new BadRequestException("Appointment date must be in the future.");
    }

    this.validateBarbershopSchedule(appointmentDate, barbershop);

    const conflictingAppointment = await this.prisma.appointment.findFirst({
      where: {
        barbershopId: data.barbershopId,
        appointmentAt: appointmentDate,
        status: {
          in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED],
        },
      },
    });

    if (conflictingAppointment) {
      throw new BadRequestException("This time slot is already booked.");
    }

    let customer = await this.prisma.customer.findFirst({
      where: {
        phone: data.customerPhone,
        barbershopId: data.barbershopId,
      },
    });

    if (!customer) {
      customer = await this.prisma.customer.create({
        data: {
          name: data.customerName,
          phone: data.customerPhone,
          email: data.customerEmail,
          barbershopId: data.barbershopId,
        },
      });
    }

    return this.prisma.appointment.create({
      data: {
        serviceName: data.serviceName,
        appointmentAt: appointmentDate,
        notes: data.notes,
        customerId: customer.id,
        barbershopId: data.barbershopId,
        status: AppointmentStatus.PENDING,
      },
      include: {
        customer: true,
      },
    });
  }

  async updateStatus(
    userId: string,
    appointmentId: string,
    status: AppointmentStatus,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user?.barbershopId) {
      throw new NotFoundException("Barbershop not found for this user.");
    }

    const appointment = await this.prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        barbershopId: user.barbershopId,
      },
    });

    if (!appointment) {
      throw new NotFoundException("Appointment not found.");
    }

    return this.prisma.appointment.update({
      where: { id: appointment.id },
      data: { status },
      include: {
        customer: true,
      },
    });
  }

  async cancel(userId: string, appointmentId: string) {
    return this.updateStatus(userId, appointmentId, AppointmentStatus.CANCELED);
  }

  async complete(userId: string, appointmentId: string) {
    return this.updateStatus(
      userId,
      appointmentId,
      AppointmentStatus.COMPLETED,
    );
  }

  async confirm(userId: string, appointmentId: string) {
    return this.updateStatus(
      userId,
      appointmentId,
      AppointmentStatus.CONFIRMED,
    );
  }
}
