// Ponto de entrada da API NestJS (Control Plane).
//
// Esta app NUNCA executa código de clientes — é responsável apenas por
// autenticação, projectos, deployments (orquestração), billing,
// pagamentos, domínios e administração. A execução real das aplicações
// dos clientes acontece no Data Plane, fora deste processo.

import "reflect-metadata";
// TODO(Fase 2): import { NestFactory } from "@nestjs/core";
// TODO(Fase 2): import { AppModule } from "./app.module";
//
// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);
//   await app.listen(process.env.PORT ?? 4000);
// }
// bootstrap();

export {};
