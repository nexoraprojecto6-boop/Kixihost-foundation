# Control Plane vs Data Plane

| Control Plane | Data Plane |
|---|---|
| apps/api, apps/worker (orquestração), apps/web, apps/admin | Containers efémeros que correm código de clientes |
| Nunca executa código não confiável | Isolado por container, limites de CPU/RAM/disco, timeouts, network policies |
| Gerido directamente pela equipa KixiHost | Gerido através de InfrastructureProvider (packages/providers) |

Regra inegociável: código de clientes nunca corre dentro do Control Plane.
