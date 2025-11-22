# Chicago Forest Network - GCP Infrastructure
#
# DISCLAIMER: This is part of an AI-generated theoretical framework
# for educational and research purposes. The Chicago Forest Network
# is a conceptual project exploring decentralized energy networks.
#
# Usage:
#   terraform init
#   terraform plan -var="project_id=your-project"
#   terraform apply

terraform {
  required_version = ">= 1.0.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

# =============================================================================
# Variables
# =============================================================================

variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "GCP region"
  type        = string
  default     = "us-central1"
}

variable "zone" {
  description = "GCP zone"
  type        = string
  default     = "us-central1-a"
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

variable "machine_type" {
  description = "GCE machine type for nodes"
  type        = string
  default     = "e2-medium"
}

variable "gateway_machine_type" {
  description = "GCE machine type for gateways"
  type        = string
  default     = "e2-standard-2"
}

variable "disk_size_gb" {
  description = "Boot disk size in GB"
  type        = number
  default     = 50
}

variable "network_cidr" {
  description = "CIDR for VPC network"
  type        = string
  default     = "10.0.0.0/16"
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

provider "google" {
  project = var.project_id
  region  = var.region
}

# =============================================================================
# Labels (GCP equivalent of tags)
# =============================================================================

locals {
  common_labels = {
    project     = "chicago-forest"
    environment = var.environment
    managed-by  = "terraform"
  }
}

# =============================================================================
# VPC Network
# =============================================================================

resource "google_compute_network" "forest" {
  name                    = "chicago-forest-vpc"
  auto_create_subnetworks = false
  description             = "Chicago Forest Network VPC - AI-generated theoretical framework"
}

resource "google_compute_subnetwork" "forest" {
  name                     = "chicago-forest-subnet"
  ip_cidr_range            = var.network_cidr
  region                   = var.region
  network                  = google_compute_network.forest.id
  private_ip_google_access = true

  secondary_ip_range {
    range_name    = "forest-mesh"
    ip_cidr_range = var.forest_subnet
  }

  log_config {
    aggregation_interval = "INTERVAL_5_SEC"
    flow_sampling        = 0.5
  }
}

# =============================================================================
# Cloud Router and NAT
# =============================================================================

resource "google_compute_router" "forest" {
  name    = "chicago-forest-router"
  region  = var.region
  network = google_compute_network.forest.id
}

resource "google_compute_router_nat" "forest" {
  name                               = "chicago-forest-nat"
  router                             = google_compute_router.forest.name
  region                             = var.region
  nat_ip_allocate_option             = "AUTO_ONLY"
  source_subnetwork_ip_ranges_to_nat = "ALL_SUBNETWORKS_ALL_IP_RANGES"

  log_config {
    enable = true
    filter = "ERRORS_ONLY"
  }
}

# =============================================================================
# Firewall Rules
# =============================================================================

resource "google_compute_firewall" "allow_internal" {
  name    = "chicago-forest-allow-internal"
  network = google_compute_network.forest.name

  allow {
    protocol = "icmp"
  }

  allow {
    protocol = "tcp"
  }

  allow {
    protocol = "udp"
  }

  source_ranges = [var.network_cidr, var.forest_subnet]
  description   = "Allow internal communication between Forest nodes"
}

resource "google_compute_firewall" "allow_p2p" {
  name    = "chicago-forest-allow-p2p"
  network = google_compute_network.forest.name

  allow {
    protocol = "udp"
    ports    = ["42000"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["forest-node", "forest-gateway"]
  description   = "Allow P2P mesh communication"
}

resource "google_compute_firewall" "allow_wireguard" {
  name    = "chicago-forest-allow-wireguard"
  network = google_compute_network.forest.name

  allow {
    protocol = "udp"
    ports    = ["51820"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["forest-node", "forest-gateway"]
  description   = "Allow WireGuard VPN"
}

resource "google_compute_firewall" "allow_gateway_http" {
  name    = "chicago-forest-allow-gateway-http"
  network = google_compute_network.forest.name

  allow {
    protocol = "tcp"
    ports    = ["80", "443"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["forest-gateway"]
  description   = "Allow HTTP/HTTPS to gateway"
}

resource "google_compute_firewall" "allow_health_check" {
  name    = "chicago-forest-allow-health-check"
  network = google_compute_network.forest.name

  allow {
    protocol = "tcp"
    ports    = ["8080"]
  }

  # GCP health check IP ranges
  source_ranges = ["35.191.0.0/16", "130.211.0.0/22"]
  target_tags   = ["forest-node", "forest-gateway"]
  description   = "Allow GCP health checks"
}

resource "google_compute_firewall" "allow_iap_ssh" {
  name    = "chicago-forest-allow-iap-ssh"
  network = google_compute_network.forest.name

  allow {
    protocol = "tcp"
    ports    = ["22"]
  }

  # IAP IP range
  source_ranges = ["35.235.240.0/20"]
  target_tags   = ["forest-node", "forest-gateway"]
  description   = "Allow SSH via IAP"
}

# =============================================================================
# Service Account
# =============================================================================

resource "google_service_account" "forest_node" {
  account_id   = "forest-node-sa"
  display_name = "Chicago Forest Node Service Account"
  description  = "Service account for Forest node VMs"
}

resource "google_project_iam_member" "forest_node_logging" {
  project = var.project_id
  role    = "roles/logging.logWriter"
  member  = "serviceAccount:${google_service_account.forest_node.email}"
}

resource "google_project_iam_member" "forest_node_monitoring" {
  project = var.project_id
  role    = "roles/monitoring.metricWriter"
  member  = "serviceAccount:${google_service_account.forest_node.email}"
}

# =============================================================================
# Instance Template - Forest Nodes
# =============================================================================

resource "google_compute_instance_template" "forest_node" {
  name_prefix  = "chicago-forest-node-"
  machine_type = var.machine_type
  region       = var.region

  disk {
    source_image = "ubuntu-os-cloud/ubuntu-2204-lts"
    auto_delete  = true
    boot         = true
    disk_size_gb = var.disk_size_gb
    disk_type    = "pd-ssd"
  }

  network_interface {
    network    = google_compute_network.forest.id
    subnetwork = google_compute_subnetwork.forest.id
  }

  service_account {
    email  = google_service_account.forest_node.email
    scopes = ["cloud-platform"]
  }

  metadata = {
    enable-oslogin = "TRUE"
  }

  metadata_startup_script = templatefile("${path.module}/templates/node-startup.sh", {
    docker_image  = var.docker_image
    forest_subnet = var.forest_subnet
    environment   = var.environment
  })

  tags = ["forest-node"]

  labels = local.common_labels

  lifecycle {
    create_before_destroy = true
  }
}

# =============================================================================
# Managed Instance Group - Forest Nodes
# =============================================================================

resource "google_compute_region_instance_group_manager" "forest_nodes" {
  name               = "chicago-forest-nodes"
  base_instance_name = "forest-node"
  region             = var.region

  version {
    instance_template = google_compute_instance_template.forest_node.id
  }

  target_size = var.node_count

  named_port {
    name = "api"
    port = 8080
  }

  named_port {
    name = "p2p"
    port = 42000
  }

  named_port {
    name = "wireguard"
    port = 51820
  }

  auto_healing_policies {
    health_check      = google_compute_health_check.forest_node.id
    initial_delay_sec = 300
  }

  update_policy {
    type                         = "PROACTIVE"
    minimal_action               = "REPLACE"
    max_surge_fixed              = 1
    max_unavailable_fixed        = 0
    instance_redistribution_type = "PROACTIVE"
  }
}

# =============================================================================
# Gateway Instances
# =============================================================================

resource "google_compute_instance" "forest_gateway" {
  count        = var.gateway_count
  name         = "forest-gateway-${count.index + 1}"
  machine_type = var.gateway_machine_type
  zone         = var.zone

  boot_disk {
    initialize_params {
      image = "ubuntu-os-cloud/ubuntu-2204-lts"
      size  = var.disk_size_gb
      type  = "pd-ssd"
    }
  }

  network_interface {
    network    = google_compute_network.forest.id
    subnetwork = google_compute_subnetwork.forest.id

    access_config {
      // Ephemeral public IP
    }
  }

  # Gateway needs IP forwarding enabled
  can_ip_forward = true

  service_account {
    email  = google_service_account.forest_node.email
    scopes = ["cloud-platform"]
  }

  metadata = {
    enable-oslogin = "TRUE"
  }

  metadata_startup_script = templatefile("${path.module}/templates/gateway-startup.sh", {
    docker_image  = var.docker_image
    forest_subnet = var.forest_subnet
    environment   = var.environment
    gateway_index = count.index + 1
  })

  tags = ["forest-gateway"]

  labels = merge(local.common_labels, {
    role = "gateway"
  })
}

# =============================================================================
# Health Check
# =============================================================================

resource "google_compute_health_check" "forest_node" {
  name                = "chicago-forest-health-check"
  check_interval_sec  = 30
  timeout_sec         = 10
  healthy_threshold   = 2
  unhealthy_threshold = 3

  http_health_check {
    port         = 8080
    request_path = "/health"
  }
}

# =============================================================================
# Load Balancer (Regional)
# =============================================================================

resource "google_compute_region_backend_service" "forest" {
  name                  = "chicago-forest-backend"
  region                = var.region
  protocol              = "UDP"
  load_balancing_scheme = "EXTERNAL"
  health_checks         = [google_compute_health_check.forest_node.id]

  backend {
    group = google_compute_region_instance_group_manager.forest_nodes.instance_group
  }
}

resource "google_compute_forwarding_rule" "p2p" {
  name                  = "chicago-forest-p2p"
  region                = var.region
  ip_protocol           = "UDP"
  load_balancing_scheme = "EXTERNAL"
  port_range            = "42000"
  backend_service       = google_compute_region_backend_service.forest.id
}

resource "google_compute_forwarding_rule" "wireguard" {
  name                  = "chicago-forest-wireguard"
  region                = var.region
  ip_protocol           = "UDP"
  load_balancing_scheme = "EXTERNAL"
  port_range            = "51820"
  backend_service       = google_compute_region_backend_service.forest.id
}

# =============================================================================
# Outputs
# =============================================================================

output "network_name" {
  description = "Name of the VPC network"
  value       = google_compute_network.forest.name
}

output "subnet_name" {
  description = "Name of the subnet"
  value       = google_compute_subnetwork.forest.name
}

output "gateway_public_ips" {
  description = "Public IPs of gateway instances"
  value       = google_compute_instance.forest_gateway[*].network_interface[0].access_config[0].nat_ip
}

output "p2p_endpoint" {
  description = "P2P endpoint IP"
  value       = google_compute_forwarding_rule.p2p.ip_address
}

output "wireguard_endpoint" {
  description = "WireGuard endpoint IP"
  value       = google_compute_forwarding_rule.wireguard.ip_address
}

output "instance_group" {
  description = "Instance group URL"
  value       = google_compute_region_instance_group_manager.forest_nodes.instance_group
}
