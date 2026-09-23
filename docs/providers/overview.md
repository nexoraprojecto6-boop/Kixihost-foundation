# Providers de Infraestrutura

Abstracção via `InfrastructureProvider` (`packages/providers`).
Provider inicial: DigitalOcean. Providers planeados: Hetzner, OVHcloud.

Erros de provider nunca chegam em bruto ao utilizador — passam sempre
pelo error mapper (`packages/providers/src/errors/error-mapper.ts`),
que os traduz para `KixiError`.
