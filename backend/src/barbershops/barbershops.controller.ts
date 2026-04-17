import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { Request } from "express";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { BarbershopsService } from "./barbershops.service";

@Controller("barbershops")
@UseGuards(JwtAuthGuard)
export class BarbershopsController {
  constructor(private readonly barbershopsService: BarbershopsService) {}

  @Post()
  create(
    @Req() req: Request,
    @Body()
    body: {
      name: string;
      phone?: string;
      email?: string;
      address?: string;
      opensAt?: string;
      closesAt?: string;
      workingDays?: string;
    },
  ) {
    const user = req.user as { id: string };
    return this.barbershopsService.create(user.id, body);
  }

  @Get("me")
  findMine(@Req() req: Request) {
    const user = req.user as { id: string };
    return this.barbershopsService.findMine(user.id);
  }

  @Patch("me")
  updateMine(
    @Req() req: Request,
    @Body()
    body: {
      name?: string;
      phone?: string;
      email?: string;
      address?: string;
      opensAt?: string;
      closesAt?: string;
      workingDays?: string;
    },
  ) {
    const user = req.user as { id: string };
    return this.barbershopsService.updateMine(user.id, body);
  }
}
