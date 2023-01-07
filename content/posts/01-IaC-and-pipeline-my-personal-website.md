---
title: "How to deploy your own website on AWS with Terraform and Git Hub Actions!"
date: 2023-01-06T13:41:''+01:00
tags: [AWS, Terraform, IaC, Git, Infrastructure, Best Practices]
categories: [AWS, Terraform, Pipeline]
draft: true
---

One of my resolutions for 2023 was to write constantly on this blog. I thought a lot about what to bring as my first article.
What better topic than what is behind this site?

In this article we will cover the following topics:

1. Setup the infrastructrue of our website using Terraform, Terraform Cluod and Git Hub Actions 
1. Create a repository for our website using HUGO
2. Create a CI/CD pipeline for our website using Git Hub Actions


Let's begin!

### 1. Setup the infrastructrue of our website using Terraform, Terraform Cluod and Git Hub Actions

Why should we use all these tools? Couldn't we just do some *Click Ops* and build what we needed directly from the AWS interface?

The answer is obviously no, although it is a personal project I have tried to immerse myself in a situation as real as possible. So I started imagining what could happen if not just me but a whole team worked on this project and if we needed to handle a bigger workload.

If I wanted to do things wrong I could host my website on a Raspberry Pi.
But we are Cloud Engineers, we like to **scale**. Right?


Let's try to spend a few words to describe the goals I wanted to achieve and the choices I made to achieve them

### Infrastructure as Code (IaC) -> Terraform

I needed something that would allow me to describe my infrastructure as code, as I said above I wanted to avoid *Click Ops*. 
Of all the tools available on the market, I chose Terraform to achieve this goal. What the hell is **Terraform** and why should I use it?

Terraform is a tool for building, changing, and versioning infrastructure safely and efficiently. It can manage infrastructure for a variety of cloud providers, including AWS, Azure, Google Cloud, DigitalOcean, and more, as well as on-premises environments.

With Terraform, you can define infrastructure as code (IaC) and use configuration files to create and manage infrastructure resources. This makes it easier to version control your infrastructure and collaborate with others. Terraform also provides a number of helpful features, such as dependency management, resource targeting, and the ability to roll back changes.

In this phase we will go one step further because we will not manage the status of our Terraform project locally, but we will use **Terraform Cloud**, a web-based application that provides collaboration, governance, and automation features for teams using Terraform. It is designed to make it easier to use Terraform in a collaborative environment by providing features such as remote state management, version control, and a private module registry.


Here you will find the repository that contains the Terraform code for this project: [perosona-website-iac](https://github.com/ettoreciarcia/personal-website-iac.git)


The repository is public, you can clone it using the command

```shell
git clone https://github.com/ettoreciarcia/personal-website-iac.git
```

The Terraform project has this structure

```shell
.
├── .pre-commit-config.yaml
├── personal-website.auto.tfvars
├── .github/
    ├── workflows/
├── modules/
│   ├── infra/  <--- Create infra resources here
│   └── security/ <-- Create IAM reosurce here
├── static/
└── themes/
    └── PaperMod/
```

This is the infrastructure this code will provision

![infrastructure](../img/infrastructure.png)

### Continuos Integration/Continous Deployment  CI/CD) -> Git Hub Actions

Here the choice was almost forced as my IaC repository is on Git Hub and I have a Premium account which gives me access to free minutes of calculation using GH Actions.
Automating Terraform with CI/CD enforces configuration best practices, promotes collaboration and automates the Terraform workflow.


Maybe the benefits of using Terraform Cloud and Git Hub Actions at the same time aren't apparent in this project because I'm the only one working on it, or if you try to replicate my infrastructure you'll be the only one working on it.

But trust me, in case multiple people from the same team or even different teams are working on the same Terraform project, these additions are almost a must have

