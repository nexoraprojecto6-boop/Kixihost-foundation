# Módulo: backups
# Configura política de backup do PostgreSQL e armazenamento externo,
# incluindo retenção e testes de restauração (ver regra 40).
variable "environment" { type = string }

# TODO(Fase 13): recursos reais de backup automatizado + retenção.
