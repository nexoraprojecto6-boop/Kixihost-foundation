import type { PayPayConfig } from "./config";
import type { PayPayCreateOrderRequest, PayPayCreateOrderResponse } from "./types";

// Cliente HTTP de baixo nível para a API PayPay.
//
// TODO(Fase 9): implementar chamadas HTTP reais aos endpoints descritos
// na documentação oficial (https://portal.paypayafrica.com/dist/guide/apidoc_pt.html).
// Não inventar endpoints, parâmetros ou respostas.
export class PayPayClient {
  constructor(private readonly config: PayPayConfig) {}

  async createOrder(_request: PayPayCreateOrderRequest): Promise<PayPayCreateOrderResponse> {
    throw new Error("PayPayClient.createOrder: not yet implemented (Fase 9)");
  }
}
