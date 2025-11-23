# Chicago Forest Network - Terraform Infrastructure

> **DISCLAIMER**: This is part of an AI-generated theoretical framework for educational and research purposes. The Chicago Forest Network is a conceptual project exploring decentralized energy and mesh networking. This infrastructure code is NOT operational - use it as a reference or starting point.

## Overview

This directory contains Terraform modules for deploying Chicago Forest Network infrastructure across major cloud providers:

- **aws/** - Amazon Web Services
- **gcp/** - Google Cloud Platform
- **digital-ocean/** - DigitalOcean

## Architecture

Each cloud deployment creates:

```
                           Internet
                               |
                        [Load Balancer]
                        (P2P, WireGuard, API)
                               |
              +----------------+----------------+
              |                                 |
      [Gateway Nodes]                   [Gateway Nodes]
    (Public IPs, NAT, VPN)            (Public IPs, NAT, VPN)
              |                                 |
              +----------------+----------------+
                               |
                          [VPC/Network]
                               |
         +----------+----------+----------+
         |          |          |          |
    [Node 1]   [Node 2]   [Node 3]   [Node N]
   (Private)  (Private)  (Private)  (Private)
         |          |          |          |
         +----------+----------+----------+
                               |
                    [Forest Mesh Network]
                   (BATMAN-adv + WireGuard)
```

## Quick Start

### Prerequisites

1. Install Terraform 1.0+
2. Configure cloud provider credentials
3. (Optional) Remote state backend

### AWS Deployment

```bash
cd aws

# Initialize
terraform init

# Create variables file
cat > terraform.tfvars << EOF
aws_region        = "us-east-1"
environment       = "production"
node_count        = 3
gateway_count     = 1
ssh_key_name      = "your-key-name"
allowed_ssh_cidrs = ["YOUR.IP.ADDRESS/32"]
EOF

# Plan
terraform plan

# Apply
terraform apply
```

### GCP Deployment

```bash
cd gcp

# Initialize
terraform init

# Authenticate
gcloud auth application-default login

# Create variables file
cat > terraform.tfvars << EOF
project_id    = "your-project-id"
region        = "us-central1"
environment   = "production"
node_count    = 3
gateway_count = 1
EOF

# Apply
terraform apply
```

### DigitalOcean Deployment

```bash
cd digital-ocean

# Initialize
terraform init

# Set token
export DIGITALOCEAN_TOKEN="your-api-token"

# Create variables file
cat > terraform.tfvars << EOF
region               = "nyc1"
environment          = "production"
node_count           = 3
gateway_count        = 1
ssh_key_fingerprint  = "your-ssh-key-fingerprint"
EOF

# Apply
terraform apply
```

## Module Structure

```
terraform/
├── README.md                  # This file
├── aws/
│   ├── main.tf               # Main AWS configuration
│   ├── variables.tf          # Input variables (optional, inline)
│   ├── outputs.tf            # Outputs (optional, inline)
│   └── templates/
│       ├── node-user-data.sh
│       └── gateway-user-data.sh
├── gcp/
│   ├── main.tf
│   └── templates/
│       ├── node-startup.sh
│       └── gateway-startup.sh
└── digital-ocean/
    ├── main.tf
    └── templates/
        ├── node-cloud-init.yaml
        └── gateway-cloud-init.yaml
```

## Variables Reference

### Common Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `environment` | Environment name | `production` |
| `node_count` | Number of Forest nodes | `3` |
| `gateway_count` | Number of Gateway nodes | `1` |
| `forest_subnet` | Forest mesh CIDR | `10.42.0.0/16` |
| `docker_image` | Forest node Docker image | `ghcr.io/chicago-forest/forest-node:latest` |

### AWS Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `aws_region` | AWS region | `us-east-1` |
| `instance_type` | EC2 instance type | `t3.medium` |
| `gateway_instance_type` | Gateway instance type | `t3.large` |
| `vpc_cidr` | VPC CIDR block | `10.0.0.0/16` |
| `ssh_key_name` | SSH key pair name | Required |

### GCP Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `project_id` | GCP project ID | Required |
| `region` | GCP region | `us-central1` |
| `machine_type` | Node machine type | `e2-medium` |
| `gateway_machine_type` | Gateway machine type | `e2-standard-2` |

### DigitalOcean Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `region` | DO region | `nyc1` |
| `node_size` | Droplet size | `s-2vcpu-4gb` |
| `gateway_size` | Gateway size | `s-4vcpu-8gb` |
| `ssh_key_fingerprint` | SSH key fingerprint | Required |

## Outputs

Each module provides these outputs:

| Output | Description |
|--------|-------------|
| `vpc_id` / `network_name` | Network identifier |
| `node_ips` | Private IPs of Forest nodes |
| `gateway_public_ips` | Public IPs of gateways |
| `load_balancer_dns` / `load_balancer_ip` | Load balancer endpoint |
| `connection_info` | Formatted connection endpoints |

## Security Considerations

### Network Security

- Nodes are deployed in private subnets (where supported)
- Gateways have public IPs for external connectivity
- Security groups/firewalls restrict traffic to essential ports
- SSH access should be limited to specific IPs

### Secrets Management

- SSH keys should be pre-created and managed securely
- WireGuard keys are generated on instance startup
- Consider using cloud provider secrets managers

### Best Practices

1. **State Management**: Use remote state (S3, GCS, DO Spaces)
2. **Encryption**: Enable encryption for EBS/persistent disks
3. **Backups**: Enable automated backups for persistent storage
4. **Monitoring**: Use cloud-native monitoring (CloudWatch, Stackdriver)
5. **IAM**: Apply least-privilege IAM policies

## Remote State Configuration

### AWS S3 Backend

```hcl
terraform {
  backend "s3" {
    bucket         = "your-terraform-state-bucket"
    key            = "chicago-forest/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-locks"
  }
}
```

### GCS Backend

```hcl
terraform {
  backend "gcs" {
    bucket = "your-terraform-state-bucket"
    prefix = "chicago-forest"
  }
}
```

## Cost Estimation

| Provider | Monthly Estimate (3 nodes + 1 gateway) |
|----------|----------------------------------------|
| AWS | ~$150-200 (t3.medium + t3.large) |
| GCP | ~$120-180 (e2-medium + e2-standard-2) |
| DigitalOcean | ~$100-150 (s-2vcpu-4gb + s-4vcpu-8gb) |

*Estimates vary by region and exclude data transfer costs*

## Cleanup

To destroy all resources:

```bash
# Review what will be destroyed
terraform plan -destroy

# Destroy
terraform destroy
```

**Warning**: This will delete all data. Backup any important information first.

## Troubleshooting

### Common Issues

**State Lock Error**:
```bash
terraform force-unlock LOCK_ID
```

**Provider Authentication**:
- AWS: Check `~/.aws/credentials` or environment variables
- GCP: Run `gcloud auth application-default login`
- DO: Verify `DIGITALOCEAN_TOKEN` is set

**Network Connectivity**:
- Verify security groups allow required ports
- Check NAT gateway/Cloud NAT is functioning
- Ensure instances have route to internet

### Debugging

```bash
# Enable debug logging
export TF_LOG=DEBUG
terraform apply

# View state
terraform state list
terraform state show <resource>
```

## Contributing

This is part of the Chicago Forest Network theoretical framework. Contributions that improve infrastructure reliability, security, or cost-efficiency are welcome.

## Related Documentation

- [Docker Deployment](../docker/README.md)
- [Kubernetes Deployment](../kubernetes/README.md)
- [Home Node Setup Guide](../guides/home-node-setup.md)
- [Ansible Playbooks](../ansible/playbooks/)

## License

MIT License - See repository root for details.
