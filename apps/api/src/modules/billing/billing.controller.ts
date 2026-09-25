import { Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard, type AuthenticatedRequest } from "../auth/session.guard";
import { BillingService } from "./billing.service";

@Controller("billing")
@UseGuards(SessionGuard)
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get("wallet")
  getWallet(@Req() req: AuthenticatedRequest) {
    return this.billingService.getWalletBalance(req.userId);
  }

  @Get("wallet/history")
  getHistory(@Req() req: AuthenticatedRequest) {
    return this.billingService.getWalletHistory(req.userId);
  }

  @Get("subscription")
  getSubscription(@Req() req: AuthenticatedRequest) {
    return this.billingService.getSubscription(req.userId);
  }

  @Get("plans")
  listPlans() {
    return this.billingService.listPlans();
  }

  @Post("subscription/cancel")
  cancelSubscription(@Req() req: AuthenticatedRequest) {
    return this.billingService.cancelSubscription(req.userId);
  }
}
