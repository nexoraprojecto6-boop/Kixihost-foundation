import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { AdminController } from "./admin.controller";
import { AdminMfaController } from "./admin-mfa.controller";
import { AdminDashboardService } from "./admin-dashboard.service";
import { AdminUsersService } from "./admin-users.service";
import { AuditLogService } from "./audit-log.service";
import { AdminSessionGuard } from "./admin-session.guard";
import { PermissionGuard } from "./permission.guard";

@Module({
  imports: [AuthModule],
  controllers: [AdminController, AdminMfaController],
  providers: [AdminDashboardService, AdminUsersService, AuditLogService, AdminSessionGuard, PermissionGuard],
})
export class AdminModule {}
