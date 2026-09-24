import { Controller, Get, Param, Req, UseGuards } from "@nestjs/common";
import { SessionGuard, type AuthenticatedRequest } from "../auth/session.guard";
import { DeploymentsService } from "./deployments.service";

@Controller()
@UseGuards(SessionGuard)
export class DeploymentsController {
  constructor(private readonly deploymentsService: DeploymentsService) {}

  @Get("projects/:projectId/deployments")
  async listByProject(@Req() req: AuthenticatedRequest, @Param("projectId") projectId: string) {
    return this.deploymentsService.listByProject(req.userId, projectId);
  }

  @Get("deployments/:id")
  async getOne(@Req() req: AuthenticatedRequest, @Param("id") id: string) {
    return this.deploymentsService.getWithLogs(req.userId, id);
  }
}
