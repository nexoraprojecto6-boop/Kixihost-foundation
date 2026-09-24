import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { DeploymentsController } from "./deployments.controller";
import { DeploymentsService } from "./deployments.service";

@Module({
  imports: [AuthModule],
  controllers: [DeploymentsController],
  providers: [DeploymentsService],
  exports: [DeploymentsService],
})
export class DeploymentsModule {}
