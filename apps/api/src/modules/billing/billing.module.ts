import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { BillingController } from "./billing.controller";
import { BillingService } from "./billing.service";
import { PayPayController } from "./paypay.controller";

@Module({
  imports: [AuthModule],
  controllers: [BillingController, PayPayController],
  providers: [BillingService],
  exports: [BillingService],
})
export class BillingModule {}
