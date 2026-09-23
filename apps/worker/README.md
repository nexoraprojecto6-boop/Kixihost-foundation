# @kixihost/worker

Processo cloud responsável por executar o pipeline de deployment,
verificação de domínios/SSL e reconciliação de pagamentos. Nunca corre
código de clientes fora de containers isolados (Data Plane).
