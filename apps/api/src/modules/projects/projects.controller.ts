import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { createProjectSchema } from "@kixihost/validation";
import { SessionGuard, type AuthenticatedRequest } from "../auth/session.guard";
import { ProjectsService } from "./projects.service";

@Controller("projects")
@UseGuards(SessionGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get("repositories")
  async listRepositories(@Req() req: AuthenticatedRequest) {
    return this.projectsService.listAvailableRepositories(req.userId);
  }

  @Post()
  async create(@Req() req: AuthenticatedRequest, @Body() body: unknown) {
    const input = createProjectSchema.parse(body);
    return this.projectsService.createProject(req.userId, input);
  }

  @Get()
  async list(@Req() req: AuthenticatedRequest) {
    return this.projectsService.listProjects(req.userId);
  }

  @Get(":id")
  async getOne(@Req() req: AuthenticatedRequest, @Param("id") id: string) {
    return this.projectsService.getProject(req.userId, id);
  }
}
