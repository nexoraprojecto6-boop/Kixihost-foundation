import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { initiateWalletDepositSchema } from "@kixihost/validation";
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

  @Post("wallet/deposit")
  async deposit(@Req() req: AuthenticatedRequest, @Body() body: unknown) {
    const input = initiateWalletDepositSchema.parse(body);
    return this.billingService.initiateWalletDeposit(req.userId, input.amountKz, req.ip ?? "0.0.0.0");
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
