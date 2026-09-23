# Módulo: redis
# Provisiona a instância Redis/Valkey gerida do ambiente (usada por
# BullMQ no worker).
variable "environment" { type = string }

# TODO(Fase 13): recurso real digitalocean_database_cluster (engine = redis/valkey).
