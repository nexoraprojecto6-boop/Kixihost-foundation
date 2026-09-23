# Ambiente: staging
#
# Compõe os módulos de infraestrutura (network, database, redis,
# compute, monitoring, backups) para este ambiente específico.
# Cada ambiente tem secrets e infraestrutura próprios (regra 44).

module "network" {
  source = "../../modules/network"
  environment = "staging"
}

module "database" {
  source = "../../modules/database"
  environment = "staging"
}

module "redis" {
  source = "../../modules/redis"
  environment = "staging"
}

module "compute" {
  source = "../../modules/compute"
  environment = "staging"
}

module "monitoring" {
  source = "../../modules/monitoring"
  environment = "staging"
}

module "backups" {
  source = "../../modules/backups"
  environment = "staging"
}
