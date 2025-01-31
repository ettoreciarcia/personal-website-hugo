---
title: "Boost Your Kubernetes Workflow: Aesthetic & Productivity Hacks"
authors:
- admin
date: "2025-01-30T00:00:00Z"
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
summary: Dealing with Kubernetes every day can be a struggle, so let's at least use a terminal that doesn’t make us want to grab a rope and a chair.
tags:
- Kubernetes



featured: true

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

A few days ago, a colleague sent me this meme:

![kubernetes-meme](../24-kubernetes-tool/kubernetes-meme.jpg)

I laughed. A lot.

As someone who works with Kubernetes every day, I understand that it can be a real pain. But if we have to deal with it daily, why not at least use a terminal setup that helps us work faster and suffer less?

Here’s a list of tools I recommend to enhance your Kubernetes workflow and make your daily battle with clusters a bit easier.

## Starship configuration for Kubernetes

[Starship](https://starship.rs/) is an awesome and highly customizable prompt written in Rust. I started using it after uninstalling Powerlevel10k, which was making my terminal too slow. Among the many customizations Starship offers, there’s a Kubernetes module that I find particularly usefu

Here’s my configuration (also available in the official documentation):

```toml
# ~/.config/starship.toml

[kubernetes]
format = 'on [⛵ ($user on )($cluster in )$context \($namespace\)](dimmed green) '
disabled = false
```

I’ve slightly modified mine by removing the user and context to keep the terminal output cleaner and more concise.

Final result

![starship](../24-kubernetes-tool/starship.png)

## Kubecolor

[Kubecolor](https://github.com/kubecolor/kubecolor) is a handy tool that adds color to Kubernetes command outputs. While I’m not a big fan of overly colorful interfaces, Kubecolor’s subtle coloring improves readability without being overwhelming.

I use the default settings without any special configurations.

To make it your default, add this alias to your ```.bashrc or``` ```.zshrc```

![kubecolor](../24-kubernetes-tool/kubecolor.png)

Ricorda di aggiungere questo alias al tuo profilo bash/zsh

```
alias kubectl="kubecolor"
```

## Fubectl

[Fubectl](https://github.com/kubermatic/fubectl) is one of those tools I discovered late and regret not knowing sooner. It provides useful aliases and introduces two incredibly handy commands

```kdes```: Lets you interactively choose a pod for kubectl describe, similar to k9s.

![kdes](../24-kubernetes-tool/kdes.png)

```klog```: Allows you to quickly view logs for a specific pod

![klog](../24-kubernetes-tool/klog.png)

```kex``` sh: Provides a quick way to access a shell inside a container

![kex](../24-kubernetes-tool/kex.png)

### Important Note: Fixing Fubectl on Zsh

To get Fubectl working correctly with Zsh, I had to modify my shell configuration. If you’re using Zsh, you might need to do the same. Here are the necessary changes

```shell
#complete -o default -F __start_kubectl k # line removed

autoload -Uz compinit && compinit # line added
autoload -Uz bashcompinit && bashcompinit #line added
complete -o default -F __start_kubectl k #line added
```

## k9s

[K9s](https://github.com/derailed/k9s) provides a powerful terminal UI for managing Kubernetes clusters. If you want a more interactive experience inside your terminal, this is the tool for you.

![k9s](../24-kubernetes-tool/k9s.png)

## Kubectl autocomplete

While not exactly a tool, enabling autocompletion for kubectl can significantly improve your efficiency. If you’re using Fubectl, no additional configuration is needed.

To set up autocompletion manually, follow the [official documentation](https://kubernetes.io/docs/reference/kubectl/quick-reference/#kubectl-autocomplete)

## Stern

[Stern](https://github.com/stern/stern) is an excellent troubleshooting tool that allows you to view logs from multiple pods simultaneously. This is incredibly useful when debugging issues across multiple replicas.

To install it on macOS, run:

```shell
brew install stern
```

![coredns](../24-kubernetes-tool/coredns.png)

## Aliases for Faster Kubernetes Commands

Aliases can save you a lot of typing and improve your workflow. If you’re using Fubectl, you already have many aliases available. Otherwise, you can add the following to your ```.zshrc``` or ```.bashrc```:

```shell
alias k="kubectl"  
alias kg="kubectl get"  
alias kd="kubectl describe"  
alias kdel="kubectl delete"  
alias ke="kubectl edit" 
alias kl="kubectl logs"  
alias kex="kubectl exec -it"  
alias kr="kubectl rollout restart"  
alias kgp="kubectl get pods"  
alias kgd="kubectl get deploy"  
alias kgn="kubectl get nodes"  
alias kgno="kubectl get nodes -o wide"  
alias ksys="kubectl get pods -n kube-system"  
alias kall="kubectl get all"  
```

## Conclusions


That's all, folks! Now go take care of your clusters and stop wasting time on my stupid site.

May uptime be with you! 