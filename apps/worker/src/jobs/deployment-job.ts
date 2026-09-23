// Job de deployment: consome eventos de push/criação de deployment da
// queue e executa o pipeline definido em @kixihost/deployments.
//
// TODO(Fase 5): implementar processor real com BullMQ.
export const DEPLOYMENT_QUEUE_NAME = "deployments";
