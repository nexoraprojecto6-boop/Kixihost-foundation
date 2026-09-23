import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { createProjectSchema } from "@kixihost/validation";
import { ProjectsService } from "./projects.service";
// TODO(Fase 2 — follow-up): trocar por um SessionGuard real que popule req.user
// a partir do cookie kixi_session, validado por JwtSessionService.
// import { SessionGuard } from "../auth/session.guard";

@Controller("projects")
// @UseGuards(SessionGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get("repositories")
  async listRepositories(@Req() req: Request) {
    const userId = (req as Request & { userId: string }).userId;
    return this.projectsService.listAvailableRepositories(userId);
  }

  @Post()
  async create(@Req() req: Request, @Body() body: unknown) {
    const userId = (req as Request & { userId: string }).userId;
    const input = createProjectSchema.parse(body);
    return this.projectsService.createProject(userId, input);
  }

  @Get()
  async list(@Req() req: Request) {
    const userId = (req as Request & { userId: string }).userId;
    return this.projectsService.listProjects(userId);
  }

  @Get(":id")
  async getOne(@Req() req: Request, @Param("id") id: string) {
    const userId = (req as Request & { userId: string }).userId;
    return this.projectsService.getProject(userId, id);
  }
}
