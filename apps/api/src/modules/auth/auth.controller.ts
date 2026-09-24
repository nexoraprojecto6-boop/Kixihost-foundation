import { Controller, Get, Query, Req, Res, UseGuards } from "@nestjs/common";
import type { Response } from "express";
import { randomBytes } from "node:crypto";
import { AuthService } from "./auth.service";
import { SessionGuard, type AuthenticatedRequest } from "./session.guard";

const STATE_COOKIE = "kixi_oauth_state";
const SESSION_COOKIE = "kixi_session";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get("github")
  redirectToGitHub(@Res() res: Response) {
    const state = randomBytes(16).toString("hex");
    res.cookie(STATE_COOKIE, state, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 5 * 60 * 1000 });
    res.redirect(this.authService.getAuthorizationUrl(state));
  }

  @Get("github/callback")
  async handleCallback(
    @Query("code") code: string,
    @Query("state") state: string,
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ) {
    const expectedState = req.cookies?.[STATE_COOKIE];
    if (!code || !state || state !== expectedState) {
      res.status(400).send("Estado OAuth inválido. Tenta autenticar novamente.");
      return;
    }

    const sessionToken = await this.authService.handleCallback(code, req.ip, req.headers["user-agent"]);

    res.clearCookie(STATE_COOKIE);
    res.cookie(SESSION_COOKIE, sessionToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.redirect(`${process.env.APP_URL}/onboarding`);
  }

  // Endpoint simples para testar se o SessionGuard está a funcionar.
  @Get("me")
  @UseGuards(SessionGuard)
  async me(@Req() req: AuthenticatedRequest) {
    return { userId: req.userId };
  }

  @Get("logout")
  @UseGuards(SessionGuard)
  async logout(@Req() req: AuthenticatedRequest, @Res() res: Response) {
    await this.authService.logout(req.sessionId);
    res.clearCookie(SESSION_COOKIE);
    res.json({ loggedOut: true });
  }
}
