import { Module } from "@nestjs/common";
import { BarbershopsController } from "./barbershops.controller";
import { BarbershopsService } from "./barbershops.service";

@Module({
  controllers: [BarbershopsController],
  providers: [BarbershopsService],
  exports: [BarbershopsService],
})
export class BarbershopsModule {}
