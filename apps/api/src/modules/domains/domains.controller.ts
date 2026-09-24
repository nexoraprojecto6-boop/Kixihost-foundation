import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { addCustomDomainSchema } from "@kixihost/validation";
import { SessionGuard, type AuthenticatedRequest } from "../auth/session.guard";
import { DomainsService } from "./domains.service";

@Controller()
@UseGuards(SessionGuard)
export class DomainsController {
  constructor(private readonly domainsService: DomainsService) {}

  @Get("projects/:projectId/domains")
  async list(@Req() req: AuthenticatedRequest, @Param("projectId") projectId: string) {
    return this.domainsService.listByProject(req.userId, projectId);
  }

  @Post("projects/:projectId/domains")
  async addCustomDomain(
    @Req() req: AuthenticatedRequest,
    @Param("projectId") projectId: string,
    @Body() body: unknown,
  ) {
    const input = addCustomDomainSchema.parse(body);
    return this.domainsService.addCustomDomain(req.userId, projectId, input.hostname);
  }

  @Post("domains/:id/verify")
  async verify(@Req() req: AuthenticatedRequest, @Param("id") id: string) {
    return this.domainsService.verifyDomain(req.userId, id);
  }
}
