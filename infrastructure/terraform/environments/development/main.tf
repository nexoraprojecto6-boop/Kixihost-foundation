# Ambiente: development
#
# Compõe os módulos de infraestrutura (network, database, redis,
# compute, monitoring, backups) para este ambiente específico.
# Cada ambiente tem secrets e infraestrutura próprios (regra 44).

module "network" {
  source = "../../modules/network"
  environment = "development"
}

module "database" {
  source = "../../modules/database"
  environment = "development"
}

module "redis" {
  source = "../../modules/redis"
  environment = "development"
}

module "compute" {
  source = "../../modules/compute"
  environment = "development"
}

module "monitoring" {
  source = "../../modules/monitoring"
  environment = "development"
}

module "backups" {
  source = "../../modules/backups"
  environment = "development"
}
