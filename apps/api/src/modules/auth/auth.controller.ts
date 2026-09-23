import { Controller, Get, Query, Req, Res } from "@nestjs/common";
import type { Request, Response } from "express";
import { randomBytes } from "node:crypto";
import { AuthService } from "./auth.service";

const STATE_COOKIE = "kixi_oauth_state";
const SESSION_COOKIE = "kixi_session";

@Controller("auth/github")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  redirectToGitHub(@Res() res: Response) {
    const state = randomBytes(16).toString("hex");
    res.cookie(STATE_COOKIE, state, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 5 * 60 * 1000 });
    res.redirect(this.authService.getAuthorizationUrl(state));
  }

  @Get("callback")
  async handleCallback(
    @Query("code") code: string,
    @Query("state") state: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const expectedState = req.cookies?.[STATE_COOKIE];
    if (!code || !state || state !== expectedState) {
      res.status(400).send("Estado OAuth inválido. Tenta autenticar novamente.");
      return;
    }

    const sessionToken = await this.authService.handleCallback(
      code,
      req.ip,
      req.headers["user-agent"],
    );

    res.clearCookie(STATE_COOKIE);
    res.cookie(SESSION_COOKIE, sessionToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.redirect(`${process.env.APP_URL}/onboarding`);
  }
}
