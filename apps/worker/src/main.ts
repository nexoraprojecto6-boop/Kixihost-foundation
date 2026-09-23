// Ponto de entrada do Worker (Data Plane orchestration).
//
// O Worker é o único componente que executa builds e faz o
// provisionamento de deployments na infraestrutura cloud. Corre em
// produção como um processo cloud (não depende do computador local —
// ver regra 3/52 do documento de fundação).
//
// TODO(Fase 5): inicializar as BullMQ Queues/Workers para os jobs
// definidos em src/jobs/, ligados a REDIS_URL.

export {};
