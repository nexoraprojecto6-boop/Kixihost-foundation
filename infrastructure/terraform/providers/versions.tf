# Versões de providers Terraform/OpenTofu para o KixiHost.
# Terraform NÃO é executado durante a criação da fundação (regra 45).

terraform {
  required_version = ">= 1.7.0"

  required_providers {
    digitalocean = {
      source  = "digitalocean/digitalocean"
      version = "~> 2.41"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.44"
    }
  }
}
