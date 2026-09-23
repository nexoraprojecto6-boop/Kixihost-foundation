// Ponto de entrada da API NestJS (Control Plane).
//
// Esta app NUNCA executa código de clientes — é responsável apenas por
// autenticação, projectos, deployments (orquestração), billing,
// pagamentos, domínios e administração. A execução real das aplicações
// dos clientes acontece no Data Plane, fora deste processo.

import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });

  app.use(cookieParser());

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
