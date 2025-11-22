# Chicago Forest Network - DigitalOcean Infrastructure
#
# DISCLAIMER: This is part of an AI-generated theoretical framework
# for educational and research purposes. The Chicago Forest Network
# is a conceptual project exploring decentralized energy networks.
#
# Usage:
#   export DIGITALOCEAN_TOKEN="your-api-token"
#   terraform init
#   terraform plan -var="ssh_key_fingerprint=xx:xx:xx"
#   terraform apply

terraform {
  required_version = ">= 1.0.0"

  required_providers {
    digitalocean = {
      source  = "digitalocean/digitalocean"
      version = "~> 2.0"
    }
  }
}

# =============================================================================
# Variables
# =============================================================================

variable "do_token" {
  description = "DigitalOcean API token"
  type        = string
  sensitive   = true
  default     = ""
}

variable "region" {
  description = "DigitalOcean region"
  type        = string
  default     = "nyc1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "node_count" {
  description = "Number of Forest nodes"
  type        = number
  default     = 3
}

variable "gateway_count" {
  description = "Number of Gateway nodes"
  type        = number
  default     = 1
}

variable "node_size" {
  description = "Droplet size for nodes"
  type        = string
  default     = "s-2vcpu-4gb"
}

variable "gateway_size" {
  description = "Droplet size for gateways"
  type        = string
  default     = "s-4vcpu-8gb"
}

variable "ssh_key_fingerprint" {
  description = "SSH key fingerprint for droplet access"
  type        = string
}

variable "forest_subnet" {
  description = "Forest mesh network CIDR (theoretical)"
  type        = string
  default     = "10.42.0.0/16"
}

variable "docker_image" {
  description = "Docker image for Forest node"
  type        = string
  default     = "ghcr.io/chicago-forest/forest-node:latest"
}

# =============================================================================
# Provider
# =============================================================================

provider "digitalocean" {
  token = var.do_token != "" ? var.do_token : null
}

# =============================================================================
# VPC
# =============================================================================

resource "digitalocean_vpc" "forest" {
  name     = "chicago-forest-vpc"
  region   = var.region
  ip_range = "10.100.0.0/16"

  description = "Chicago Forest Network VPC - AI-generated theoretical framework"
}

# =============================================================================
# Firewall
# =============================================================================

resource "digitalocean_firewall" "forest_node" {
  name = "chicago-forest-node-fw"

  # Apply to droplets with these tags
  tags = ["forest-node"]

  # SSH (restricted - update with your IPs)
  inbound_rule {
    protocol         = "tcp"
    port_range       = "22"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  # P2P mesh
  inbound_rule {
    protocol         = "udp"
    port_range       = "42000"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  # WireGuard
  inbound_rule {
    protocol         = "udp"
    port_range       = "51820"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  # Internal API
  inbound_rule {
    protocol         = "tcp"
    port_range       = "8080"
    source_addresses = ["10.100.0.0/16"]
  }

  # Metrics
  inbound_rule {
    protocol         = "tcp"
    port_range       = "9090"
    source_addresses = ["10.100.0.0/16"]
  }

  # ICMP
  inbound_rule {
    protocol         = "icmp"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  # All outbound
  outbound_rule {
    protocol              = "tcp"
    port_range            = "1-65535"
    destination_addresses = ["0.0.0.0/0", "::/0"]
  }

  outbound_rule {
    protocol              = "udp"
    port_range            = "1-65535"
    destination_addresses = ["0.0.0.0/0", "::/0"]
  }

  outbound_rule {
    protocol              = "icmp"
    destination_addresses = ["0.0.0.0/0", "::/0"]
  }
}

resource "digitalocean_firewall" "forest_gateway" {
  name = "chicago-forest-gateway-fw"

  tags = ["forest-gateway"]

  # SSH
  inbound_rule {
    protocol         = "tcp"
    port_range       = "22"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  # HTTP/HTTPS
  inbound_rule {
    protocol         = "tcp"
    port_range       = "80"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  inbound_rule {
    protocol         = "tcp"
    port_range       = "443"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  # P2P mesh
  inbound_rule {
    protocol         = "udp"
    port_range       = "42000"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  # WireGuard
  inbound_rule {
    protocol         = "udp"
    port_range       = "51820"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  # API
  inbound_rule {
    protocol         = "tcp"
    port_range       = "8080"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  # ICMP
  inbound_rule {
    protocol         = "icmp"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  # All outbound
  outbound_rule {
    protocol              = "tcp"
    port_range            = "1-65535"
    destination_addresses = ["0.0.0.0/0", "::/0"]
  }

  outbound_rule {
    protocol              = "udp"
    port_range            = "1-65535"
    destination_addresses = ["0.0.0.0/0", "::/0"]
  }

  outbound_rule {
    protocol              = "icmp"
    destination_addresses = ["0.0.0.0/0", "::/0"]
  }
}

# =============================================================================
# SSH Key
# =============================================================================

data "digitalocean_ssh_key" "forest" {
  name = var.ssh_key_fingerprint
}

# =============================================================================
# Forest Node Droplets
# =============================================================================

resource "digitalocean_droplet" "forest_node" {
  count    = var.node_count
  name     = "forest-node-${count.index + 1}"
  region   = var.region
  size     = var.node_size
  image    = "ubuntu-22-04-x64"
  vpc_uuid = digitalocean_vpc.forest.id

  ssh_keys = [data.digitalocean_ssh_key.forest.id]
  tags     = ["forest-node", "chicago-forest", var.environment]

  user_data = templatefile("${path.module}/templates/node-cloud-init.yaml", {
    node_name     = "forest-node-${count.index + 1}"
    node_index    = count.index + 1
    docker_image  = var.docker_image
    forest_subnet = var.forest_subnet
    environment   = var.environment
  })

  # Enable monitoring
  monitoring = true

  # Enable backups
  backups = true

  lifecycle {
    ignore_changes = [user_data]
  }
}

# =============================================================================
# Gateway Droplets
# =============================================================================

resource "digitalocean_droplet" "forest_gateway" {
  count    = var.gateway_count
  name     = "forest-gateway-${count.index + 1}"
  region   = var.region
  size     = var.gateway_size
  image    = "ubuntu-22-04-x64"
  vpc_uuid = digitalocean_vpc.forest.id

  ssh_keys = [data.digitalocean_ssh_key.forest.id]
  tags     = ["forest-gateway", "chicago-forest", var.environment]

  user_data = templatefile("${path.module}/templates/gateway-cloud-init.yaml", {
    node_name     = "forest-gateway-${count.index + 1}"
    gateway_index = count.index + 1
    docker_image  = var.docker_image
    forest_subnet = var.forest_subnet
    environment   = var.environment
  })

  monitoring = true
  backups    = true

  lifecycle {
    ignore_changes = [user_data]
  }
}

# =============================================================================
# Volumes for Data Storage
# =============================================================================

resource "digitalocean_volume" "forest_data" {
  count                   = var.node_count
  name                    = "forest-data-${count.index + 1}"
  region                  = var.region
  size                    = 50
  initial_filesystem_type = "ext4"
  description             = "Data volume for Forest node ${count.index + 1}"

  tags = ["forest-data", "chicago-forest"]
}

resource "digitalocean_volume_attachment" "forest_data" {
  count      = var.node_count
  droplet_id = digitalocean_droplet.forest_node[count.index].id
  volume_id  = digitalocean_volume.forest_data[count.index].id
}

# =============================================================================
# Load Balancer
# =============================================================================

resource "digitalocean_loadbalancer" "forest" {
  name     = "chicago-forest-lb"
  region   = var.region
  vpc_uuid = digitalocean_vpc.forest.id

  # P2P forwarding (TCP fallback since DO doesn't support UDP LB)
  forwarding_rule {
    entry_port      = 42000
    entry_protocol  = "tcp"
    target_port     = 42000
    target_protocol = "tcp"
  }

  # API
  forwarding_rule {
    entry_port      = 8080
    entry_protocol  = "tcp"
    target_port     = 8080
    target_protocol = "tcp"
  }

  # HTTPS
  forwarding_rule {
    entry_port      = 443
    entry_protocol  = "tcp"
    target_port     = 443
    target_protocol = "tcp"
  }

  healthcheck {
    port     = 8080
    protocol = "http"
    path     = "/health"
  }

  droplet_tag = "forest-gateway"

  redirect_http_to_https = false
  enable_proxy_protocol  = false
}

# =============================================================================
# Reserved IPs for Gateways
# =============================================================================

resource "digitalocean_reserved_ip" "forest_gateway" {
  count  = var.gateway_count
  region = var.region
}

resource "digitalocean_reserved_ip_assignment" "forest_gateway" {
  count      = var.gateway_count
  ip_address = digitalocean_reserved_ip.forest_gateway[count.index].ip_address
  droplet_id = digitalocean_droplet.forest_gateway[count.index].id
}

# =============================================================================
# DNS Records (if you have a domain configured)
# =============================================================================

# Uncomment and configure if you have a domain
# resource "digitalocean_record" "forest_gateway" {
#   count  = var.gateway_count
#   domain = "your-domain.com"
#   type   = "A"
#   name   = "gateway-${count.index + 1}.forest"
#   value  = digitalocean_reserved_ip.forest_gateway[count.index].ip_address
#   ttl    = 300
# }

# =============================================================================
# Project
# =============================================================================

resource "digitalocean_project" "forest" {
  name        = "Chicago Forest Network"
  description = "AI-generated theoretical framework for decentralized mesh networking"
  purpose     = "Service or API"
  environment = var.environment == "production" ? "Production" : "Development"

  resources = concat(
    [for d in digitalocean_droplet.forest_node : d.urn],
    [for d in digitalocean_droplet.forest_gateway : d.urn],
    [for v in digitalocean_volume.forest_data : v.urn],
    [digitalocean_loadbalancer.forest.urn]
  )
}

# =============================================================================
# Outputs
# =============================================================================

output "vpc_id" {
  description = "VPC ID"
  value       = digitalocean_vpc.forest.id
}

output "node_ips" {
  description = "Private IPs of Forest nodes"
  value       = digitalocean_droplet.forest_node[*].ipv4_address_private
}

output "node_public_ips" {
  description = "Public IPs of Forest nodes"
  value       = digitalocean_droplet.forest_node[*].ipv4_address
}

output "gateway_reserved_ips" {
  description = "Reserved (static) IPs for gateways"
  value       = digitalocean_reserved_ip.forest_gateway[*].ip_address
}

output "load_balancer_ip" {
  description = "Load balancer IP"
  value       = digitalocean_loadbalancer.forest.ip
}

output "connection_info" {
  description = "Connection endpoints"
  value = {
    api_endpoint       = "http://${digitalocean_loadbalancer.forest.ip}:8080"
    gateway_ips        = digitalocean_reserved_ip.forest_gateway[*].ip_address
    wireguard_endpoint = "${digitalocean_reserved_ip.forest_gateway[0].ip_address}:51820"
    p2p_endpoint       = "${digitalocean_reserved_ip.forest_gateway[0].ip_address}:42000"
  }
}
