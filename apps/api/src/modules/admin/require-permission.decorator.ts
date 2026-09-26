import { SetMetadata } from "@nestjs/common";
import type { AdminPermission } from "@kixihost/auth";

export const REQUIRE_PERMISSION_KEY = "requirePermission";
export const RequirePermission = (permission: AdminPermission) =>
  SetMetadata(REQUIRE_PERMISSION_KEY, permission);
