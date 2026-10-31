---
title: Personal Website
date: 2022-12-01
link: /publication/01-how-to-deploy-your-website/
tags:
  - Terraform
  - AWS
  - CI/CD
image: ./featured.png
featured:
  order: 2
  challenge: Publish technical articles and project notes with a repeatable deployment workflow.
  solution: Build a static site with Astro and deploy it to S3 behind CloudFront using GitHub Actions.
  outcome: Markdown content goes from a Git push to the live site, with search generated during the build.
---

A website built with Astro and hosted on S3 behind CloudFront, featuring automatic deployments via GitHub Actions. Infrastructure is provisioned through Terraform.

Originally built with Hugo, the site moved to Astro in October 2026 while preserving its existing article URLs. Content is written in Markdown, and Pagefind generates the search index as part of each build.

**Cost: $0.60 per month / SLA: 99.9%**
