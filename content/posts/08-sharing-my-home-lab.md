---
title: "Sharing My Home Lab"
date: 2023-05-09T23:21:07+02:00
draft: true
summary: "Wake up, Aragorn!"
tags: [Kubernetes, Homelab]
categories: [Just Chatting]
weight: "995"
showToc: true
cover:
  image: "../img/07/cover.png"
---

## **0 Updates on homelab journey**


As you may have read in my previous article, I was looking for someone to keep me company on this very long journey.
And guess what? I found someone!
After talking to about twenty people on Reddit and scheduling a few calls, I finally set up the team.

The project officially started on May 9th at 18:10, with this email

>Hello and welcome everyone! Our journey has finally begun.
>You should have access to two Google Docs
>- HERE the guidelines and the code of conduct
>- HERE will put to a vote the messaging platforms that we will use to communicate. Our conversations will continue on the >platform we choose in this document
>You are all editors, you can modify and propose new ideas, I will be happy to discuss them with you.
>This is just a draft, I am not the owner of this project. We would have an equal relationship throughout the duration of >the trip.
>See you on the other side :)


We are spread over 4 different timezones ranging from the east of the USA to Australia, the collaboration mode will therefore be asynchronous.


## **1 Sharing my homelab with teammates**

The first problem to solve was to make my homelab accessible from the outside.

After some tinkering with OpenVPN and Wireguard, I came up with a Wireguard container on my RaspberryPi that exposes the VPN server to the outside via port forwarding on the router.

This is the docker compose I used to setup my VPN

```
version: "3"
services:
  wireguard:
    image: lscr.io/linuxserver/wireguard
    container_name: wireguard
    cap_add:
      - NET_ADMIN
      - SYS_MODULE
    environment:
      - PUID=1001
      - PGID=100
      - TZ=Europe/Rome
      - SERVERURL=<YOUR SERVER URL> #optional
      - SERVERPORT=51820
      - PEERS=client,iphone #change to match how many devies you want to use Wireguard on
      - PEERDNS=192.168.0.2,8.8.8.8
      - INTERNAL_SUBNET=10.13.13.0 #optional
      - ALLOWEDIPS=0.0.0.0/0 #optional
    volumes:
      - ~/docker/utility/wireguard/config:/config
      - /lib/modules:/lib/modules #do not change
    ports:
      - 51820:51820/udp
    restart: unless-stopped
```

Let's analyze this docker-compsoe in a little more detail:

**NET_ADMIN** and **SYS_MODULE** are both Linux kernel capabilities that are necessary to run the WireGuard application properly within the Docker container.

The NET_ADMIN capability allows for the configuration of network interfaces, routing tables, and firewall rules. Since WireGuard creates virtual network interfaces for VPN connections, the NET_ADMIN capability is required to allow the "wireguard" service to create and configure these interfaces.

The SYS_MODULE capability allows for the insertion and removal of kernel modules. WireGuard requires the loading of a specific kernel module to function properly. The SYS_MODULE capability allows the "wireguard" service to load the necessary kernel module inside the Docker container.

