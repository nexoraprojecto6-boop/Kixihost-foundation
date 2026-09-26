import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { SessionAuthService } from "./session-auth.service";
import { SessionGuard } from "./session.guard";

@Module({
  controllers: [AuthController],
  providers: [AuthService, SessionAuthService, SessionGuard],
  exports: [AuthService, SessionAuthService, SessionGuard],
})
export class AuthModule {}
