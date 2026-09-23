import { Body, Controller, Headers, HttpCode, Post, RawBodyRequest, Req, UnauthorizedException } from "@nestjs/common";
import type { Request } from "express";
import { verifyGitHubWebhookSignature } from "@kixihost/github";
import { GitHubService } from "./github.service";

@Controller("github/webhooks")
export class GitHubController {
  constructor(private readonly githubService: GitHubService) {}

  @Post()
  @HttpCode(202)
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers("x-hub-signature-256") signature: string,
    @Headers("x-github-event") event: string,
    @Body() body: unknown,
  ) {
    const rawBody = req.rawBody?.toString("utf-8") ?? "";
    const secret = process.env.GITHUB_WEBHOOK_SECRET ?? "";

    if (!signature || !verifyGitHubWebhookSignature(rawBody, signature, secret)) {
      throw new UnauthorizedException("Assinatura de webhook do GitHub inválida");
    }

    // TODO: garantir idempotência via WebhookEvent (payloadHash) antes de processar.

    if (event === "push") {
      await this.githubService.handlePushEvent(body);
    }

    return { received: true };
  }
}
