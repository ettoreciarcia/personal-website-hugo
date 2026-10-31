---
title: Shared Homelab
date: 2023-05-10
link: /publication/08-network-overlay/
tags:
  - Networking
  - Homelab
  - Terraform
image: ./featured.png
featured:
  order: 1
  challenge: Run a Kubernetes cluster across homelabs in different countries.
  solution: Connect the nodes through Headscale, with AWS infrastructure managed in Terraform and server configuration in Ansible.
  outcome: A shared network that lets geographically distributed nodes participate in the same cluster.
---

Project born out of the need to have a Kubernetes cluster with nodes in different homelabs (in different countries) and realized by setting up the necessary infrastructure on AWS using Terraform and a Headscale server configured with Ansible. **Cost: 0 USD, SLA (single EC2 instance for the Headscale server): 99.5%**
