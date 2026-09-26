import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from "@nestjs/common";
import { AdminSessionGuard, type AdminAuthenticatedRequest } from "./admin-session.guard";
import { PermissionGuard } from "./permission.guard";
import { RequirePermission } from "./require-permission.decorator";
import { AdminDashboardService } from "./admin-dashboard.service";
import { AdminUsersService } from "./admin-users.service";

@Controller("admin")
@UseGuards(AdminSessionGuard, PermissionGuard)
export class AdminController {
  constructor(
    private readonly dashboardService: AdminDashboardService,
    private readonly usersService: AdminUsersService,
  ) {}

  @Get("dashboard")
  @RequirePermission("dashboard.view")
  getDashboard() {
    return this.dashboardService.getOverview();
  }

  @Get("users")
  @RequirePermission("users.view")
  searchUsers(@Query("q") query: string) {
    return this.usersService.search(query ?? "");
  }

  @Get("users/:id")
  @RequirePermission("users.view")
  getUser(@Param("id") id: string) {
    return this.usersService.getProfile(id);
  }

  @Post("users/:id/suspend")
  @RequirePermission("users.suspend")
  suspendUser(@Req() req: AdminAuthenticatedRequest, @Param("id") id: string, @Body("reason") reason: string) {
    return this.usersService.suspend(req.userId, id, reason ?? "Sem motivo indicado");
  }

  @Post("users/:id/block")
  @RequirePermission("users.block")
  blockUser(@Req() req: AdminAuthenticatedRequest, @Param("id") id: string, @Body("reason") reason: string) {
    return this.usersService.block(req.userId, id, reason ?? "Sem motivo indicado");
  }

  @Post("users/:id/reactivate")
  @RequirePermission("users.reactivate")
  reactivateUser(@Req() req: AdminAuthenticatedRequest, @Param("id") id: string) {
    return this.usersService.reactivate(req.userId, id);
  }

  @Post("users/:id/change-plan")
  @RequirePermission("users.change_plan")
  changePlan(@Req() req: AdminAuthenticatedRequest, @Param("id") id: string, @Body("planId") planId: string) {
    return this.usersService.changePlan(req.userId, id, planId);
  }

  @Post("users/:id/notify")
  @RequirePermission("users.notify")
  notifyUser(
    @Req() req: AdminAuthenticatedRequest,
    @Param("id") id: string,
    @Body("title") title: string,
    @Body("message") message: string,
  ) {
    return this.usersService.notify(req.userId, id, title, message);
  }

  @Post("users/:id/grant-credit")
  @RequirePermission("users.grant_credit")
  grantCredit(
    @Req() req: AdminAuthenticatedRequest,
    @Param("id") id: string,
    @Body("amountKz") amountKz: number,
    @Body("reason") reason: string,
  ) {
    return this.usersService.grantPromotionalCredit(req.userId, id, amountKz, reason ?? "Crédito promocional");
  }
}
