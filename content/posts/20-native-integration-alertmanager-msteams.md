---
title: "The native integration between Alert Manager and Microsoft Teams"
date: 2024-04-26T15:18:25+02:00
draft: false
summary: "Prom2Teams is dead. Long live Prom2Teams. Native integration between Alert Manager and Microsoft Teams."
weight: 882
tags: ["How to", "Kubernetes", "Monitoring", "Alert Manager", "Microsoft Teams", "Integration"]
categories: ["How to", "Kubernetes", "Monitoring", "Alert Manager", "Microsoft Teams", "Integration"]
showToc: true
cover:
  image: "../img/20/cover.png"
---

## 0 Context

You needed to send alerts from your Kubernetes cluster to Microsoft Teams.

When setting up alerting, Alert Manager did not support Microsoft Teams among the receivers, so a third-party product (prom2teams) was used instead.

With this [Pull Request](https://github.com/prometheus/alertmanager/pull/3324) Alert Manager has added Teams to the receiver.

The Version of Alert Manager to which this feature has been added: **0.26.0 / 2023-08-23** [Link](https://github.com/prometheus/alertmanager/releases/tag/v0.26.0)

Let's say we have a Kubernetes cluster that until recently was using Prom2Teams to compensate for the lack of native integration between Alert Manager and Microsoft Teams.

What is Prom2Teams?

Prom2Teams is a Python-built service that receives alert notifications from a pre-configured Prometheus Alertmanager instance and forwards them to Microsoft Teams using defined connectors.

But Prom2Teams has always worked, so why should we remove it?
Because the project is no longer supported and may cease to function in future Kubernetes versions.

Remember: **all debts we incur to our API server will eventually have to be paid** 😊


## 1 Homelab Scenario

You can clone the repository where I stored the code for this article using the following command:

```bash
git clone https://github.com/ettoreciarcia/blog-example.git
```

You'll find everything you need inside the folder "alert-manager-integration-msteams".

You may have noticed there's a file named .env-example containing two environment variables. In my case, I used two different webhooks for testing. If you use the same webhook, remember to change the variables in the project accordingly. Insert your webhooks inside the .env-example file and rename it to .env.


You'll find everything you need to create the webhooks at this [link](https://learn.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/add-incoming-webhook)

Then, use the command:

```bash
set -a; source .env; set +a
```

(For my personal projects, I use [direnv](https://direnv.net/), I recommend checking it out)

The following Makefile should help you recreate the scenario, remember to change the values of your MS Teams Webhook.

For creating our test cluster, we will use Kind.

Below is the configuration file we will use for our test cluster:

```yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
name: poc-am-teams
nodes:
  - role: control-plane
    image: kindest/node:v1.28.0
  - role: worker
    image: kindest/node:v1.28.0
  - role: worker
    image: kindest/node:v1.28.0
```

And here's the Makefile that will create everything we need:

```yaml
init-cluster:
	kind create cluster --config kind-config.yaml

delete-cluster:
	kind delete clusters poc-am-teams

init-prometheus:
	helm repo add prometheus-community https://prometheus-community.github.io/helm-charts && \
	kubectl create ns monitoring && \
	helm repo update && \
	helm install monitoring-stack prometheus-community/kube-prometheus-stack -n monitoring

init-prom2teams:
ifndef WEBHOOK_URL
	$(error WEBHOOK_URL not defined!)
endif
	helm install prom2teams $(PWD)/prom2teams/helm -n monitoring --set prom2teams.connector=$(WEBHOOK_URL)

delete-prom2teams:
	helm uninstall prom2teams -n monitoring

setup-everything: init-cluster init-prometheus init-prom2teams
```


At this point, all you need to do is run the command:

```bash
make setup-everything
```


Remember to pass your webhook to the Makefile for configuring the notification reception on Microsoft Teams.

In just over a minute, everything needed for our PoC will be up and running!

You can verify that everything is in place by running the command:

```
kubectl get pods -A 
```


You should see some friendly pods created in a namespace called "monitoring"

## 2 Let's test the old integration between Alert Manager and Prom2Teams

Before proceeding, let's create a new object for the AlertManagerConfig CRD that defines how to send notifications from AlertManager to Prom2Teams. In our case, we'll use a very basic configuration.

```yaml
---
apiVersion: monitoring.coreos.com/v1alpha1
kind: AlertmanagerConfig
metadata:
  namespace: monitoring
  name: prom2teams-am-config
spec:
  route:
    matchers:
      - name: namespace
        matchType: "=~"
        value: ".*"
      - name: alertname
        matchType: "=~"
        value: ".*"
    receiver: prom2teams
  receivers:
    - name: prom2teams
      webhookConfigs:
        - url: "http://prom2teams.monitoring:8089/v2/Connector"
          sendResolved: true
```


Let's test the triggering of alerts by creating some test alarms.

We can do this by using the web service provided by Prom2Teams, forwarding the calls to our host with the command:

```bash
kubectl port-forward -n monitoring svc/prom2teams 8089
```

Now we should be able to reach the internal ClusterIP service within the Cluster that exposes the Prom2Teams pods

Visiting the page **http://localhost:8089**

You should land on the web interface of Prom2Teams.

![prom2teams-web](../img/20/prom2teams.png)


And from here, we can create a fake alert using the following body:

```json
{
  "receiver": "admin@example.com",
  "status": "firing",
  "alerts": [
    {
      "status": "firing",
      "startsAt": "2024-05-01T08:00:00Z",
      "endsAt": "2024-05-01T08:30:00Z",
      "generatorURL": "http://prometheus.example.com/generator",
      "labels": {
        "alertname": "HighDiskUsage",
        "fstype": "ext4",
        "device": "/dev/sda1",
        "instance": "node-1",
        "job": "node-exporter",
        "mountpoint": "/",
        "severity": "critical"
      },
      "annotations": {
        "description": "Disk usage on root partition is above 90%.",
        "summary": "High disk usage detected",
        "runbook_url": "http://runbook.example.com/high-disk-usage"
      }
    }
  ],
  "externalURL": "http://alertmanager.example.com",
  "version": "4"
}
```


Now you should see the alert firing on Alert Manager and then receive the corresponding notification on the Microsoft Teams channel where you entered the webhook!

## 3 Native integration

But now there's native integration for Microsoft Teams among the AlertManager receivers! This will allow us to remove the prom2teams intermediary.

Here's an example of an AlertManagerConfig CRD to configure the reception of alerts without the need to forward them to prom2teams first.


```yaml
---
apiVersion: monitoring.coreos.com/v1alpha1
kind: AlertmanagerConfig
metadata:
  namespace: monitoring
  name: native-am-config
spec:
  route:
    matchers:
      - name: namespace
        matchType: "=~"
        value: ".*"
      - name: alertname
        matchType: "=~"
        value: ".*"
    receiver: microsoft-teams
  receivers:
    - name: microsoft-teams
      msteamsConfigs:
        - webhookUrl:
            key: webhookUrl
            name: teams-webhook-secret 
          sendResolved: true
---
apiVersion: v1
kind: Secret
metadata:
  name: teams-webhook-secret
  namespace: monitoring
type: Opaque
stringData:
  webhookUrl: <YOUR_WEBHOOK>
```

And we're done!

![MSTeams](../img/20/teams.jpg)

## 4 Removing the resources you no longer need

At this point, you can delete all resources related to Prom2Teams as you won't need them anymore!

In our case, the command would simply be:

```bash
make delete-prom2teams
```

In your environments, this phase will depend on how you installed Prom2Teams

We can remove our PoC cluster with the command:

```bash
make delete-cluster
```

## 5 Conclusions

In this article, we removed a third-party component that allowed us to integrate AlertManager with the previously unsupported notification receiving system.

A huge thanks goes to the creators of Prom2Teams, who for all these years enabled us to receive notifications about the health status of Kubernetes clusters within Microsoft Teams (I'm glad to use Slack for work).

The project will be decommissioned in the near future, but SREs and DevOps will not forget it.

Prom2Teams is dead. Long live Prom2Teams!

## 6 Useful Links

- [MS Teams Receiver in AlertManager](https://prometheus.io/docs/alerting/latest/configuration/#receiver)

- [Prom2Teams Project](https://github.com/idealista/prom2teams)

- [Create Incoming Webhooks in Microsoft Teams](https://learn.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/add-incoming-webhook)