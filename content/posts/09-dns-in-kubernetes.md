---
title: "DNS in Kubernetes"
date: 2023-06-26T22:23:44+02:00
draft: false
summary: "Time to dive into how DNS works in Kubernetes!"
tags: [Kubernetes, Networking]
categories: [Kubernetes, Networking]
weight: "994"
showToc: true
cover:
  image: "../img/09/cover.png"
---

Before diving into how DNS works in Kubernetes, let's try to clarify how DNS works outside of Kubernetes.

## 1. **What is a DNS server?**

`DNS (Domain Name System) is a system that translates human-readable domain names into numerical IP addresses, enabling communication between devices on the internet.`

And what does this mean? Suppose we have two servers:

![example-dns-server](../img/09/example-dns.png)

How can we make Zerocalcare contact Secco?

The most immediate way is to use Secco's IP address.

By pinging Secco's IP address, we can see that we receive a PONG in response.

![ping-ip](../img/09/ping-ip.png)

But do we really want to remember Secco's IP address? IP addresses are difficult for humans to remember. Wouldn't it be easier to use Secco's name to reach him?

To contact Secco using his name instead of his IP address, we need a mechanism that associates Secco's name with his IP address (computers reason only with IP addresses, not hostnames).

How can we achieve this goal?

The answer is the hosts file located in **/etc/hosts**.

### 1.1 hosts file

We can modify this file and insert the following line:

``` 
192.168.0.21 secco
``` 

in Zerocalcare's hosts file.

From now on, Zerocalcare will be able to resolve Secco's hostname with the correct IP address.

Let's verify that name resolution is working with the command

``` dig secco``` 

![dig-secco](../img/09/dig-secco.png)

### 1.2 Nameserver

Now let's assume that the number of hosts within the network grows exponentially. If we want each host to be able to resolve the others using their names instead of IP addresses, we would need to modify the /etc/hosts file on every host.

And that's not all. Every time a host changes its IP address or a new host joins our network, all the hosts' hosts files would need to be modified.

It is evident that this solution cannot scale, and this is where a DNS server can come to our rescue.

Nel nostro server DNS andremo ad associare all'hostname "secco" l'inridizzo IP di secco e poi utilizzeremo il server DNS da Zerocalcare per risolvere l'indirizzo IP di secco.

In our DNS server, we will associate the IP address of Secco with the hostname "secco," and then we will use the DNS server from Zerocalcare to resolve the IP address of Secco.
To specify which DNS server to use for name resolution within a Linux system, you need to refer to the ```/etc/resolv.conf```  file.

Assuming that the IP address of the DNS server is 192.168.0.2, add the following entry to the ```/etc/resolv.conf``` file:

```nameserver 192.168.0.2``` 

NOTE: If you want to ensure that it works, remember to remove the entry added to the ```/etc/hosts```  file. If that entry is present in the hosts file, your Linux system will not attempt to resolve it using the DNS server since the /etc/hosts file takes precedence. To change the order of DNS resolution, we need to do changes into the ``` /etc/nsswitch.conf```  file.

So let's try running the same command as before and see what happened

![dig-secco-dns](../img/09/dig-secco-dns.png)

As you can see in this case the hostname was resolved by the DNS server we set up earlier.

### 1.3 Search domains

The "search domains" entry in the /etc/resolv.conf file is used to specify a list of domain names that the system should automatically append to any unqualified hostname when attempting to resolve it.

When you try to resolve a hostname without a domain suffix, the system will try to resolve it using the configured search domains. This can be helpful in situations where you frequently access hosts within a specific domain without explicitly specifying the domain name each time.

Here's an example to illustrate how the search domains work:

Let's say your /etc/resolv.conf file contains the following entry:

``` search ice-cream.com annamoapijaergelato.com``` 

Now, if you try to resolve the hostname "secco", the system will automatically append the search domains to it, making the resolved names it tries in order:

1. ice-cream.com
2. annamoapijaergelato.com

This allows you to access hosts within the "example.com" and "office.example.com" domains simply by specifying their short hostnames.

NOTE: the order of the search domains is significant, as the system will try to resolve the hostname using each domain in the specified order.

We now know enough to dive into how DNS works in Kubernetes!

## 2. DNS in Kubernetes

We will use a test cluster set up with minikube

```
minikube start --vm-driver=parallels --kubernetes-version v1.25.0 --memory=4096m --cpus=2
```

For our example we don't need particularly large clusters as we are not going to analyze the functioning of the DNS outside the cluster.

In the case of multiple nodes we could have had a DNS server external to the cluster that would have taken care of the resolution of the DNS names of our instances.
For our example, one node is sufficient

```
NAME           STATUS   ROLES           AGE     VERSION
minikube       Ready    control-plane   2m51s   v1.25.0
```

So how does Kubernetes resolve names to addresses within the Cluster?
It does so with a DNS server that is automatically deployed within our cluster (CoreDNS in our example).

Let's create some objects within our cluster and try to understand what happens under the hood.

In the previous example, we played with names and addresses using Zerocalcare and Secco. Let's try to do the same thing again, but with Kubernetes..

Here are the resources for Zerocalcare, a simple deployment with one replica and a Service to expose it within the cluster.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: zerocalcare
  namespace: dns-playground
spec:
  replicas: 1
  selector:
    matchLabels:
      app: zerocalcare
  template:
    metadata:
      labels:
        app: zerocalcare
    spec:
      containers:
        - name: zerocalcare
          image: nginx:stable-alpine3.17-slim
          ports:
            - containerPort: 80
          env:
            - name: MESSAGE
              value: "I'm Zerocalcare!"
---
apiVersion: v1
kind: Service
metadata:
  name: zerocalcare
  namespace: dns-playground
spec:
  type: ClusterIP
  selector:
    app: zerocalcare
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
```

And here are the resources for Secco. Once again, it's a Deployment with one replica and a ClusterIP service to expose this pod within the cluster.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: secco
  namespace: dns-playground
spec:
  replicas: 1
  selector:
    matchLabels:
      app: secco
  template:
    metadata:
      labels:
        app: secco
    spec:
      containers:
        - name: secco
          image: nginx:stable-alpine3.17-slim
          ports:
            - containerPort: 80
          env:
            - name: MESSAGE
              value: "Hello! I'm Secco"
---
apiVersion: v1
kind: Service
metadata:
  name: secco
  namespace: dns-playground
spec:
  type: ClusterIP
  selector:
    app: secco
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
```

Here is a graphical representation of what we have created inside the cluster.

[Insert a picture of Services and pods with Zerocalcare and Secco]

And here are our lovely pods inside the cluster!

```
NAME                           READY   STATUS    RESTARTS   AGE   IP           NODE       NOMINATED NODE   READINESS GATES
secco-cff76b474-kzqcp          1/1     Running   0          71s   10.244.0.8   minikube   <none>           <none>
zerocalcare-64d8bbfcf8-j2fjf   1/1     Running   0          75s   10.244.0.7   minikube   <none>           <none>
```

At this point, it's good to remember three fundamental rules of networking in Kubernetes:

1. A pod in the cluster should be able to freely communicate with any other pod without the use of Network Address Translation (NAT).
2. Any program running on a cluster node should communicate with any pod on the same node without using NAT.
3. Each pod has its own IP address (IP-per-Pod), and every other pod can reach it at that same address.

As mentioned before, the Zerocalcare pod can reach the Secco pod using the IP address of the Secco pod. 

But we don't trust it; let's verify if it really works. Let's try to reach the Secco pod with a simple ```ping``` command.


```bash
kubectl exec -it zerocalcare-64d8bbfcf8-j2fjf -n dns-playground -- ping 10.244.0.8
```

```
PING 10.244.0.8 (10.244.0.8): 56 data bytes
64 bytes from 10.244.0.8: seq=0 ttl=64 time=0.141 ms
64 bytes from 10.244.0.8: seq=1 ttl=64 time=0.121 ms
64 bytes from 10.244.0.8: seq=2 ttl=64 time=0.122 ms
```


It works!

However, we know that pods are ephemeral units within a Kubernetes cluster. Trying to reach a pod directly using its IP address is not a good idea. Pods are like the stairs of Hogwarts; they like to change.

The most deterministic way to reach a pod is through the Service resource that exposes it. So, let's try to reach the Secco pod through the previously created service.

Get the IP address of our service with the command

```kubectl get svc -n dns-playgorund```

```
NAME          TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)   AGE
secco         ClusterIP   10.101.195.184   <none>        80/TCP    95s
zerocalcare   ClusterIP   10.104.214.95    <none>        80/TCP    37s
```

And let's try to run the same command as before, but this time replace the pod's IP address with the service's IP:

```kubcetl exec -it zerocalcare-64d8bbfcf8-j2fjf -n dns-playground -- ping 10.101.195.184```

This time, we don't receive any pong. Why? Is the service broken? Did we do something wrong?

No, the service is working correctly, but...

The Service has a virtual IP address, and we can't ping it!

So how can we reach the pod that this service exposes?

We can do it with the wget command (you would achieve the same result using the curl command, but our container image is lightweight and doesn't have curl installed by default)


>k exec -it zerocalcare-64d8bbfcf8-j2fjf -n dns-playground -- wget -O - 10.101.195.184

```bash
Connecting to 10.101.195.184 (10.101.195.184:80)
writing to stdout
<!DOCTYPE html>
<html>
<head>
<title>Welcome to nginx!</title>
<style>
html { color-scheme: light dark; }
body { width: 35em; margin: 0 auto;
font-family: Tahoma, Verdana, Arial, sans-serif; }
</style>
</head>
<body>
<h1>Welcome to nginx!</h1>
<p>If you see this page, the nginx web server is successfully installed and
working. Further configuration is required.</p>

<p>For online documentation and support please refer to
<a href="http://nginx.org/">nginx.org</a>.<br/>
Commercial support is available at
<a href="http://nginx.com/">nginx.com</a>.</p>

<p><em>Thank you for using nginx.</em></p>
</body>
</html>
-                    100% |****************************************************************************************************************************************************************************|   615  0:00:00 ETA
written to stdout
```

It works!

But do we really want to use the IP address of a service to reach the pods it exposes?

Perhaps it would be better to use a hostname!

Well, in this case, our resources are in the same namespace (dns-playground). So, we can reach their respective services by using only the service name.

Let's try to perform a wget on the service name instead of the IP:

```kubectl exec -it zerocalcare-64d8bbfcf8-j2fjf -n dns-playground -- wget -O - secco```

It still works!

How is this possible?

Let's go for a walk inside the pods and see who resolved this name into an IP address!

The pod we will use as a guinea pig is the Zerocalcare pod. To get a shell in that pod, we'll use the command:

```kubectl exec -it zerocalcare-64d8bbfcf8-j2fjf -n dns-playground -- /bin/ash```

Now we can freely navigate with the terminal and explore!

Before we proceed, let's install a tool that is always useful when troubleshooting DNS, dig.

Inside the container, run the command:

```bash
apk update && apk add bind-tools
```

Let's see who resolved the name of the Secco service into an IP address.

```
dig secco
```

```
; <<>> DiG 9.18.16 <<>> secco
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NXDOMAIN, id: 58120
;; flags: qr rd ra; QUERY: 1, ANSWER: 0, AUTHORITY: 1, ADDITIONAL: 1

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 1232
; COOKIE: f0c0ad9d8f158e8a (echoed)
;; QUESTION SECTION:
;secco.				IN	A

;; AUTHORITY SECTION:
.			30	IN	SOA	a.root-servers.net. nstld.verisign-grs.com. 2023071600 1800 900 604800 86400

;; Query time: 46 msec
;; SERVER: 10.96.0.10#53(10.96.0.10) (UDP)
;; WHEN: Sun Jul 16 16:48:06 UTC 2023
;; MSG SIZE  rcvd: 12
```

We found it! The DNS server that resolved our name into an IP address has the IP 10.96.0.10.

So, this means that our /etc/resolv.conf file will have an entry like:


```nameserver 10.96.0.10```

Let's take a look at this file!

>cat /etc/resolv.conf

```
nameserver 10.96.0.10
search dns-playground.svc.cluster.local svc.cluster.local cluster.local
options ndots:5
```

Do you feel the circle closing?
