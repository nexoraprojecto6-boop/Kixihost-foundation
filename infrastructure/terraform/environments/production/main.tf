# Ambiente: production
#
# Compõe os módulos de infraestrutura (network, database, redis,
# compute, monitoring, backups) para este ambiente específico.
# Cada ambiente tem secrets e infraestrutura próprios (regra 44).

module "network" {
  source = "../../modules/network"
  environment = "production"
}

module "database" {
  source = "../../modules/database"
  environment = "production"
}

module "redis" {
  source = "../../modules/redis"
  environment = "production"
}

module "compute" {
  source = "../../modules/compute"
  environment = "production"
}

module "monitoring" {
  source = "../../modules/monitoring"
  environment = "production"
}

module "backups" {
  source = "../../modules/backups"
  environment = "production"
}
