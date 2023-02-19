---
title: "Kubernetes: genesis of pod IP addresses"
date: 2023-01-15T00:03:07+01:00
summary: "Containers and Network Namespaces"
tags: [Container, Kubernetes, Networking]
categories: [AWS, Git, Pipeline]
weight: "998"
showToc: true
draft: true
cover:
  image: "../img/02/cover.jpeg"
---

## 0. Introduction and goals

The first time I started a container I wondered how the assignment of container IP addresses worked. This led me to delve into containerization technologies, especially **cgroups** and **network namespaces**.
In today's article we will see how network namespaces achieve that degree of "isolation" at the network level and how addresses are assigned

## 1. Setup our virtual environment

Let's start with the setup of our virtual environment, so we don't compromise the network namespace root of our host machine.
We will use Vagrant, a tool for working with virtual environments. In simple words: Virtual Machina as a code!

##### OSX

```shell
brew cask install virtualbox
brew cask install vagrant
vagrant plugin install vagrant-vbguest
```

##### Linux

```shell
sudo apt-get install virtualbox
sudo apt-get install vagrant
vagrant plugin install vagrant-vbguest
```

##### Windows
```shell
Corri a comprare un supporto USB
Prepara il supporto USB appena comprato come avviabile della tua distro Linux preferita
Rimuovi Windows e installa Linux :)
```

Now we can provision the virtual machine we're going to work on.
I have already written a Vagrantfile for you

```Vagrantfile
Vagrant.configure("2") do |config|
    config.vm.define "netns-lab" do |worker|
      worker.vm.hostname = "netns-lab"
      worker.vm.box = "ubuntu/lunar64"
      worker.vm.network "public_network"
      worker.vm.provider "virtualbox" do |vb|
        vb.memory = 1024
      end
      worker.vm.provision "shell", inline: <<-SHELL
        apt-get update && apt-get install -y net-tools
      SHELL
  end
end
```

Copy this file to a directory and from that directory run the command ```vagrant up```.
On first run it takes some time to download the image used for the virtual machine, you can use this time to react to my Kubernetes memes on Linkedin

We can finally ssh into our lab!

```vagrant status``` To see which virtual machines are active
```vagrant ssh [VM_NAME]``` for our scenario ```vagrant ssh netns-lab```

Once inside, we can take a look at the network interfaces present on our VM

![ifconfig](../img/02/ifconfig.png)

This VM also has an IP address that belongs to our host machine (192.168.0.194), these two instances can communicate.

We can launch a simple web server with this command ```python3 -m http.server 8080```and try to reach it!

![curl.png](../img/02/curl.png)


## 2. What is a network namespace

## 3. What is a veth and why we need it

## 4. Communications between network namespaces

## 5. The hard life of a Container Network Interfaces