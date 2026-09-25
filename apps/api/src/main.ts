// Ponto de entrada da API NestJS (Control Plane).

import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import cookieParser from "cookie-parser";
import { json, urlencoded } from "express";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });

  app.use(cookieParser());
  app.use(json());
  // A PayPay envia notificações como application/x-www-form-urlencoded
  // (documentação oficial, secção 4) — necessário para o PayPayController.
  app.use(urlencoded({ extended: true }));

  app.enableCors({
    origin: [process.env.APP_URL ?? "http://localhost:3000"],
    credentials: true,
  });

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`KixiHost API a correr na porta ${port}`);
}

bootstrap();
