# Módulo: compute
# Provisiona os servidores/droplets do Control Plane (api, worker, web,
# admin) e do pool do Data Plane (execução de apps de clientes).
variable "environment" { type = string }

# TODO(Fase 13): recursos reais digitalocean_droplet / autoscaling pool.
