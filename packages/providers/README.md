# @kixihost/providers

Abstração de infraestrutura cloud (`InfrastructureProvider`).

Providers suportados (fundação): `digitalocean`, `hetzner`, `ovh`.
Provider activo inicialmente: **DigitalOcean**.

Toda a integração com um provider de infraestrutura deve passar por
`ProviderFactory` — nunca importar um SDK de provider fora deste package.
