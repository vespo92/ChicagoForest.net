# Chicago Forest Network - AWS Infrastructure
#
# DISCLAIMER: This is part of an AI-generated theoretical framework
# for educational and research purposes. The Chicago Forest Network
# is a conceptual project exploring decentralized energy networks.
#
# Usage:
#   terraform init
#   terraform plan -var="node_count=3"
#   terraform apply
#
# This module creates:
# - VPC with public/private subnets
# - EC2 instances for Forest nodes
# - Security groups for mesh networking
# - EBS volumes for persistent storage
# - Network Load Balancer for external access

terraform {
  required_version = ">= 1.0.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# =============================================================================
# Variables
# =============================================================================

variable "aws_region" {
  description = "AWS region for deployment"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (e.g., production, staging, development)"
  type        = string
  default     = "production"
}

variable "project_name" {
  description = "Project name for resource tagging"
  type        = string
  default     = "chicago-forest"
}

variable "node_count" {
  description = "Number of Forest nodes to deploy"
  type        = number
  default     = 3
}

variable "gateway_count" {
  description = "Number of Gateway nodes to deploy"
  type        = number
  default     = 1
}

variable "instance_type" {
  description = "EC2 instance type for Forest nodes"
  type        = string
  default     = "t3.medium"
}

variable "gateway_instance_type" {
  description = "EC2 instance type for Gateway nodes"
  type        = string
  default     = "t3.large"
}

variable "storage_size" {
  description = "EBS volume size in GB for each node"
  type        = number
  default     = 50
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "forest_subnet" {
  description = "CIDR block for Forest mesh network (theoretical)"
  type        = string
  default     = "10.42.0.0/16"
}

variable "ssh_key_name" {
  description = "Name of SSH key pair for EC2 access"
  type        = string
}

variable "allowed_ssh_cidrs" {
  description = "CIDR blocks allowed to SSH to instances"
  type        = list(string)
  default     = []
}

variable "docker_image" {
  description = "Docker image for Forest node"
  type        = string
  default     = "ghcr.io/chicago-forest/forest-node:latest"
}

# =============================================================================
# Provider Configuration
# =============================================================================

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "terraform"
      Disclaimer  = "AI-generated theoretical framework"
    }
  }
}

# =============================================================================
# Data Sources
# =============================================================================

data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# =============================================================================
# VPC and Networking
# =============================================================================

resource "aws_vpc" "forest" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "${var.project_name}-vpc"
  }
}

resource "aws_internet_gateway" "forest" {
  vpc_id = aws_vpc.forest.id

  tags = {
    Name = "${var.project_name}-igw"
  }
}

resource "aws_subnet" "public" {
  count                   = min(length(data.aws_availability_zones.available.names), 3)
  vpc_id                  = aws_vpc.forest.id
  cidr_block              = cidrsubnet(var.vpc_cidr, 8, count.index)
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.project_name}-public-${count.index + 1}"
    Type = "public"
  }
}

resource "aws_subnet" "private" {
  count             = min(length(data.aws_availability_zones.available.names), 3)
  vpc_id            = aws_vpc.forest.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, count.index + 100)
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name = "${var.project_name}-private-${count.index + 1}"
    Type = "private"
  }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.forest.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.forest.id
  }

  tags = {
    Name = "${var.project_name}-public-rt"
  }
}

resource "aws_route_table_association" "public" {
  count          = length(aws_subnet.public)
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

# NAT Gateway for private subnets
resource "aws_eip" "nat" {
  domain = "vpc"

  tags = {
    Name = "${var.project_name}-nat-eip"
  }
}

resource "aws_nat_gateway" "forest" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.public[0].id

  tags = {
    Name = "${var.project_name}-nat"
  }

  depends_on = [aws_internet_gateway.forest]
}

resource "aws_route_table" "private" {
  vpc_id = aws_vpc.forest.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.forest.id
  }

  tags = {
    Name = "${var.project_name}-private-rt"
  }
}

resource "aws_route_table_association" "private" {
  count          = length(aws_subnet.private)
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private.id
}

# =============================================================================
# Security Groups
# =============================================================================

resource "aws_security_group" "forest_node" {
  name        = "${var.project_name}-node-sg"
  description = "Security group for Chicago Forest Network nodes"
  vpc_id      = aws_vpc.forest.id

  # SSH access (restricted)
  dynamic "ingress" {
    for_each = length(var.allowed_ssh_cidrs) > 0 ? [1] : []
    content {
      from_port   = 22
      to_port     = 22
      protocol    = "tcp"
      cidr_blocks = var.allowed_ssh_cidrs
      description = "SSH access"
    }
  }

  # P2P mesh communication
  ingress {
    from_port   = 42000
    to_port     = 42000
    protocol    = "udp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "P2P mesh communication"
  }

  # WireGuard
  ingress {
    from_port   = 51820
    to_port     = 51820
    protocol    = "udp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "WireGuard VPN"
  }

  # Internal API (VPC only)
  ingress {
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
    description = "Internal API"
  }

  # Prometheus metrics (VPC only)
  ingress {
    from_port   = 9090
    to_port     = 9090
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
    description = "Prometheus metrics"
  }

  # Inter-node communication
  ingress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    self        = true
    description = "Inter-node communication"
  }

  # All outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "All outbound traffic"
  }

  tags = {
    Name = "${var.project_name}-node-sg"
  }
}

resource "aws_security_group" "forest_gateway" {
  name        = "${var.project_name}-gateway-sg"
  description = "Security group for Chicago Forest Network gateways"
  vpc_id      = aws_vpc.forest.id

  # All ingress from nodes
  ingress {
    from_port       = 0
    to_port         = 0
    protocol        = "-1"
    security_groups = [aws_security_group.forest_node.id]
    description     = "All traffic from Forest nodes"
  }

  # HTTP/HTTPS
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTP"
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTPS"
  }

  # P2P and WireGuard
  ingress {
    from_port   = 42000
    to_port     = 42000
    protocol    = "udp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "P2P mesh"
  }

  ingress {
    from_port   = 51820
    to_port     = 51820
    protocol    = "udp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "WireGuard"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "All outbound"
  }

  tags = {
    Name = "${var.project_name}-gateway-sg"
  }
}

# =============================================================================
# IAM Role for EC2 Instances
# =============================================================================

resource "aws_iam_role" "forest_node" {
  name = "${var.project_name}-node-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ssm" {
  role       = aws_iam_role.forest_node.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_instance_profile" "forest_node" {
  name = "${var.project_name}-node-profile"
  role = aws_iam_role.forest_node.name
}

# =============================================================================
# EC2 Instances - Forest Nodes
# =============================================================================

resource "aws_instance" "forest_node" {
  count                  = var.node_count
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  key_name               = var.ssh_key_name
  subnet_id              = aws_subnet.private[count.index % length(aws_subnet.private)].id
  vpc_security_group_ids = [aws_security_group.forest_node.id]
  iam_instance_profile   = aws_iam_instance_profile.forest_node.name

  root_block_device {
    volume_type           = "gp3"
    volume_size           = 20
    delete_on_termination = true
    encrypted             = true
  }

  user_data = base64encode(templatefile("${path.module}/templates/node-user-data.sh", {
    node_name    = "forest-node-${count.index + 1}"
    node_index   = count.index + 1
    docker_image = var.docker_image
    forest_subnet = var.forest_subnet
    environment  = var.environment
  }))

  tags = {
    Name        = "${var.project_name}-node-${count.index + 1}"
    Role        = "forest-node"
    NodeIndex   = count.index + 1
  }

  lifecycle {
    ignore_changes = [ami, user_data]
  }
}

# =============================================================================
# EC2 Instances - Gateway Nodes
# =============================================================================

resource "aws_instance" "forest_gateway" {
  count                  = var.gateway_count
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.gateway_instance_type
  key_name               = var.ssh_key_name
  subnet_id              = aws_subnet.public[count.index % length(aws_subnet.public)].id
  vpc_security_group_ids = [aws_security_group.forest_gateway.id]
  iam_instance_profile   = aws_iam_instance_profile.forest_node.name

  # Gateway needs source/dest check disabled for routing
  source_dest_check = false

  root_block_device {
    volume_type           = "gp3"
    volume_size           = 30
    delete_on_termination = true
    encrypted             = true
  }

  user_data = base64encode(templatefile("${path.module}/templates/gateway-user-data.sh", {
    node_name     = "forest-gateway-${count.index + 1}"
    node_index    = count.index + 1
    docker_image  = var.docker_image
    forest_subnet = var.forest_subnet
    environment   = var.environment
  }))

  tags = {
    Name      = "${var.project_name}-gateway-${count.index + 1}"
    Role      = "forest-gateway"
    NodeIndex = count.index + 1
  }
}

# =============================================================================
# EBS Volumes for Data Storage
# =============================================================================

resource "aws_ebs_volume" "forest_data" {
  count             = var.node_count
  availability_zone = aws_instance.forest_node[count.index].availability_zone
  size              = var.storage_size
  type              = "gp3"
  encrypted         = true

  tags = {
    Name = "${var.project_name}-data-${count.index + 1}"
  }
}

resource "aws_volume_attachment" "forest_data" {
  count       = var.node_count
  device_name = "/dev/sdf"
  volume_id   = aws_ebs_volume.forest_data[count.index].id
  instance_id = aws_instance.forest_node[count.index].id
}

# =============================================================================
# Network Load Balancer
# =============================================================================

resource "aws_lb" "forest" {
  name               = "${var.project_name}-nlb"
  internal           = false
  load_balancer_type = "network"
  subnets            = aws_subnet.public[*].id

  enable_cross_zone_load_balancing = true

  tags = {
    Name = "${var.project_name}-nlb"
  }
}

resource "aws_lb_target_group" "p2p" {
  name     = "${var.project_name}-p2p"
  port     = 42000
  protocol = "UDP"
  vpc_id   = aws_vpc.forest.id

  health_check {
    enabled             = true
    port                = 8080
    protocol            = "TCP"
    healthy_threshold   = 2
    unhealthy_threshold = 2
  }
}

resource "aws_lb_target_group" "wireguard" {
  name     = "${var.project_name}-wg"
  port     = 51820
  protocol = "UDP"
  vpc_id   = aws_vpc.forest.id

  health_check {
    enabled             = true
    port                = 8080
    protocol            = "TCP"
    healthy_threshold   = 2
    unhealthy_threshold = 2
  }
}

resource "aws_lb_listener" "p2p" {
  load_balancer_arn = aws_lb.forest.arn
  port              = 42000
  protocol          = "UDP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.p2p.arn
  }
}

resource "aws_lb_listener" "wireguard" {
  load_balancer_arn = aws_lb.forest.arn
  port              = 51820
  protocol          = "UDP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.wireguard.arn
  }
}

resource "aws_lb_target_group_attachment" "gateway_p2p" {
  count            = var.gateway_count
  target_group_arn = aws_lb_target_group.p2p.arn
  target_id        = aws_instance.forest_gateway[count.index].id
  port             = 42000
}

resource "aws_lb_target_group_attachment" "gateway_wg" {
  count            = var.gateway_count
  target_group_arn = aws_lb_target_group.wireguard.arn
  target_id        = aws_instance.forest_gateway[count.index].id
  port             = 51820
}

# =============================================================================
# Outputs
# =============================================================================

output "vpc_id" {
  description = "ID of the VPC"
  value       = aws_vpc.forest.id
}

output "forest_node_ids" {
  description = "IDs of Forest node instances"
  value       = aws_instance.forest_node[*].id
}

output "forest_node_private_ips" {
  description = "Private IPs of Forest nodes"
  value       = aws_instance.forest_node[*].private_ip
}

output "gateway_public_ips" {
  description = "Public IPs of Gateway nodes"
  value       = aws_instance.forest_gateway[*].public_ip
}

output "load_balancer_dns" {
  description = "DNS name of the Network Load Balancer"
  value       = aws_lb.forest.dns_name
}

output "connection_info" {
  description = "Connection information"
  value = {
    p2p_endpoint       = "${aws_lb.forest.dns_name}:42000"
    wireguard_endpoint = "${aws_lb.forest.dns_name}:51820"
  }
}
