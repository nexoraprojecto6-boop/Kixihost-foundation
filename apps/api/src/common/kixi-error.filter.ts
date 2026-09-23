// Exception filter global: converte qualquer KixiError (ou erro
// desconhecido) numa resposta HTTP segura, nunca expondo stack traces
// ou detalhes internos ao cliente (ver regra 36).
//
// TODO(Fase 2): implementar como @Catch() do NestJS.
export {};
