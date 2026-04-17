import { Module } from "@nestjs/common";
import { BarbershopsModule } from "./barbershops/barbershops.module";
import { ConfigModule } from "@nestjs/config";
import { AppointmentsModule } from "./appointments/appointments.module";
import { AuthModule } from "./auth/auth.module";
import { CustomersModule } from "./customers/customers.module";
import { PrismaModule } from "./prisma/prisma.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    CustomersModule,
    AppointmentsModule,
    BarbershopsModule,
  ],
})
export class AppModule {}
