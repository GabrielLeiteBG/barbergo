import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { Request } from "express";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { AppointmentsService } from "./appointments.service";

@Controller("appointments")
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Req() req: Request) {
    const user = req.user as { id: string };
    return this.appointmentsService.findAll(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(":id")
  findOne(@Req() req: Request, @Param("id") id: string) {
    const user = req.user as { id: string };
    return this.appointmentsService.findOne(user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Req() req: Request,
    @Body()
    body: {
      customerId: string;
      serviceName: string;
      appointmentAt: string;
      notes?: string;
    },
  ) {
    const user = req.user as { id: string };
    return this.appointmentsService.create(user.id, body);
  }

  @Post("public")
  createPublic(
    @Body()
    body: {
      barbershopId: string;
      customerName: string;
      customerPhone: string;
      customerEmail?: string;
      serviceName: string;
      appointmentAt: string;
      notes?: string;
    },
  ) {
    return this.appointmentsService.createPublic(body);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":id/confirm")
  confirm(@Req() req: Request, @Param("id") id: string) {
    const user = req.user as { id: string };
    return this.appointmentsService.confirm(user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":id/complete")
  complete(@Req() req: Request, @Param("id") id: string) {
    const user = req.user as { id: string };
    return this.appointmentsService.complete(user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":id/cancel")
  cancel(@Req() req: Request, @Param("id") id: string) {
    const user = req.user as { id: string };
    return this.appointmentsService.cancel(user.id, id);
  }
}
