---
title: "Building and Testing Kubernetes Locally: Verifying an Upstream Fix with Kind"
authors:
- admin
date: "2025-11-05T00:00:00Z"
doi: ""

# Schedule page publish date (NOT publication's date).
# publishDate: "20-01-01T00:00:00Z"

# Publication type.
# Accepts a single type but formatted as a YAML list (for Hugo requirements).
# Enter a publication type from the CSL standard.
# # publication_types:["stocazzo"]

# Publication name and optional abbreviated publication name.
publication: ""
publication_short: ""

# abstract: "Boost Your Kubernetes Workflow: Aesthetic & Productivity Hacks"

# Summary. An optional shortened abstract.
summary: A hands-on guide to building Kubernetes from source, testing a Kind cluster, and verifying an upstream PR that fixes a validation bug.
tags:
- Kubernetes

featured: true
draft: false

links:
url_pdf: ''
url_code: ''
url_dataset: ''
url_poster: ''
url_project: ''
url_slides: ''
url_source: ''
url_video: ''

# Featured image
# To use, add an image named `featured.jpg/png` to your page's folder. 
image:
  caption: ''
  focal_point: ""
  preview_only: false

# Associated Projects (optional).
#   Associate this publication with one or more of your projects.
#   Simply enter your project's folder or file name without extension.
#   E.g. `internal-project` references `content/project/internal-project/index.md`.
#   Otherwise, set `projects: []`.
projects:
- internal-project

# Slides (optional).
#   Associate this publication with Markdown slides.
#   Simply enter your slide deck's filename without extension.
#   E.g. `slides: "example"` references `content/slides/example/index.md`.
#   Otherwise, set `slides: ""`.
slides: example
---


## Intro

Kubernetes is huge, but its open-source nature means anyone can explore, build, and even contribute directly to its core.

In this walkthrough, we’re going to do exactly that: build Kubernetes directly from the upstream source, run it in a local cluster using [Kind](https://kind.sigs.k8s.io/) (Kubernetes IN Docker), and then test a specific upstream pull request that fixes a bug in the ValidatingAdmissionPolicy subsystem.

The idea is simple but powerful:

1. First, we’ll build a clean Kubernetes release straight from the official repository and create a Kind cluster using that freshly built image
2. Then, we’ll reproduce a known issue affecting ValidatingAdmissionPolicyBinding when using a ConfigMap as parameters
3. Finally, we’ll rebuild Kubernetes again, this time from the branch that contains the proposed fix and verify that the issue has been resolved


Before we start, make sure you have:

- A machine with enough resources (My configuration is 16GB RAM, 8vCPU)
- Docker and Kind installed. They’ll be used to build and run our custom Kubernetes images.
- Plenty of disk space: do not use a small instance with only 20 GB of storage! The build process will quickly fill it up. Plan for at least 40–50 GB of free space to avoid frustration.


## Background: The Issue

The problem appeared when using a **ValidatingAdmissionPolicy** with a **ValidatingAdmissionPolicyBinding** referencing a **ConfigMap** as its parameter.
The behavior was inconsistent depending on whether the resources were created one by one or all together in batch.

Here’s the upstream issue I opened: [ValidatingAdmissionPolicyBinding fails to resolve ConfigMap params when resources are recreated in batch \#133827](https://github.com/kubernetes/kubernetes/issues/133827).

Here you can find the PR from [Afshin Paydar](https://github.com/afshin-paydar)

In short:

- Creating the ConfigMap, ValidatingAdmissionPolicy, and ValidatingAdmissionPolicyBinding together works at first.
- Deleting and recreating them together causes the policy to fail with
```
failed to configure binding: no params found for policy binding with Deny parameterNotFoundAction
```

Recreating them one by one works fine.

Once recreated sequentially, the issue doesn’t reappear, even if you delete and recreate them in batch again.

This is especially relevant for GitOps workflows, where resources are usually applied in batch by automation tools rather than manually.

## The Test Setup

I used a Debian 12 virtual machine with:
- 16GB RAM
- 8 vCPU

That’s enough to build Kubernetes locally, although compilation will use every bit of your CPU.

### Installing dependencies

```shell
sudo apt-get update
sudo apt-get install -y ca-certificates curl git make rsync
```

### Installing Docker and Kind

```
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

sudo tee /etc/apt/sources.list.d/docker.sources <<EOF
Types: deb
URIs: https://download.docker.com/linux/debian
Suites: $(. /etc/os-release && echo "$VERSION_CODENAME")
Components: stable
Signed-By: /etc/apt/keyrings/docker.asc
EOF

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# install kind
[ $(uname -m) = x86_64 ] && curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.30.0/kind-linux-amd64
chmod +x ./kind
sudo mv ./kind /usr/local/bin/kind

# install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
```

## Building Kubernetes From Source

```shell
git clone https://github.com/kubernetes/kubernetes.git
cd kubernetes
time make
```

If you only need to rebuild a specific component, such as the API server, you can use 

```shell
make WHAT=cmd/kube-apiserver
```

to save time.

After a few minutes, the _output directory will contain all compiled binaries (kube-apiserver, kubelet, kubectl, etc.).
On my machine the full build took about 4 minutes 45 seconds of wall time, consuming nearly all 8 cores.

## Creating a Custom Kind Image

Once built, Kind can package your binaries into a runnable cluster node image:

```shell
kind build node-image --image custom-kubernetes:v1.0.0
```

Define a simple cluster configuration

```yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
  image: custom-kubernetes:v1.0.0
- role: worker
  image: custom-kubernetes:v1.0.0
- role: worker
  image: custom-kubernetes:v1.0.0
```

Then start the cluster:

```shell
kind create cluster --config cluster-config.yaml
```

You now have a fully local Kubernetes cluster running your freshly compiled binaries.

## Fetching and Building the PR Fix

To test the PR that fixes the ValidatingAdmissionPolicy race condition, fetch the author’s branch directly:

```shell
git fetch https://github.com/afshin-paydar/kubernetes.git ValidatingAdmissionPolicyBinding_fails:pr-134423
git checkout pr-134423
make
```

Rebuild your Kind image from this patched version:

```shell
kind build node-image --image custom-kubernetes:v1.0.1
```

## Reproducing the Bug and Verifying the Fix

The issue can be reproduced with the following resources (simplified):

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: demo-policy-params
  namespace: default
data:
  maxReplicas: "5"
---
apiVersion: admissionregistration.k8s.io/v1
kind: ValidatingAdmissionPolicy
metadata:
  name: "demo-policy.example.com"
spec:
  paramKind:
    apiVersion: v1
    kind: ConfigMap
  failurePolicy: Fail
  matchConstraints:
    resourceRules:
    - apiGroups: ["apps"]
      apiVersions: ["v1"]
      operations: ["CREATE", "UPDATE"]
      resources: ["deployments"]
  validations:
  - expression: "int(object.spec.replicas) <= int(params.data.maxReplicas)"
    message: "Too many replicas"
---
apiVersion: admissionregistration.k8s.io/v1
kind: ValidatingAdmissionPolicyBinding
metadata:
  name: "demo-binding-test.example.com"
spec:
  policyName: "demo-policy.example.com"
  paramRef:
    name: demo-policy-params
    namespace: default
    parameterNotFoundAction: Deny
  validationActions: [Deny]
```

And a test deployment

```
apiVersion: apps/v1
kind: Deployment
metadata:
  name: test
spec:
  replicas: 6
  selector:
    matchLabels:
      app: test
  template:
    metadata:
      labels:
        app: test
    spec:
      containers:
      - name: test
        image: busybox:latest
        command: ["sleep", "3600"]
```

Before the fix, deleting and recreating the policy objects in batch produced the error
```
failed to configure binding: no params found for policy binding with Deny parameterNotFoundAction.
```
After building the PR and running it in the Kind cluster, the policy correctly reloaded the new ConfigMap every time. ISSUE RESOLVED!.

## Conclusions

Testing upstream Kubernetes code locally is not just for maintainers.
With a little setup, anyone can build, patch, and run Kubernetes from source, gaining deep insight into its internals.

The fix from [Afshin Paydar](https://github.com/afshin-paydar) on the issue [ValidatingAdmissionPolicyBinding fails to resolve ConfigMap params when resources are recreated in batch \#133827](https://github.com/kubernetes/kubernetes/issues/133827) is a perfect example of how open collaboration keeps Kubernetes evolving one commit at a time.

And the best part? Anyone with curiosity and a bit of patience can do the same

Kubernetes is a community before it is a project. Building it from source is not just a technical act, but a way to take part in its ecosystem of shared knowledge. Every upstream bug fix is a small collective victory