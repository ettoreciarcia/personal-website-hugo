---
title: "Managing dot files with Chezmoi"
date: 2024-05-19T15:36:25+02:00
draft: false
summary: "How to manage and back up your dot files with Chezmoi"
weight: 882
tags: ["How to"]
categories: ["How to"]
showToc: true
cover:
  image: "../img/21/cover.png"
---

## 0 Intro

If you're in the trenches fighting the DevOps war, you're definitely using a vast array of tools on different clients. You might have one client you use for work, one for your hobbies, and perhaps others scattered around your homelab where it would be convenient to have your beloved dotfiles configurations perfectly aligned.

It may seem trivial to an outsider, but each dotfile tells who we are and holds the memory of our preferred settings, our shortcuts, and everything that helps us be more productive when we work.

I vividly remember when, after years of using my MacBook Pro, I found myself with a new MacBook in my hands and was going crazy.
My productivity was significantly impacted without the tools I use daily and without their exact configurations.

After spending the first few days making sure I had every tool installed and configured them all manually, painstakingly populating each dotfile, I thought: there must be a tool in this world that can help me speed up the configuration of a new client when it comes my way.

And so I tried several (some of which COMPLETELY SCREWED UP my old dotfiles), until I found  [Chezmoi](https://www.chezmoi.io/)

I've been a happy user for over a year now, so it's time to tell you about it.

Chezmoi provides many features beyond symlinking or using a bare git repo including: templates (to handle small differences between machines), password manager support (to store your secrets securely), importing files from archives (great for shell and editor plugins), full file encryption (using gpg or age), and running scripts (to handle everything else).

## 1 My Chezmoi Configuration

The Chezmoi documentation is really well done (kudos to its creators), which is why I’ll avoid showing you step-by-step how to configure Chezmoi on your client. I’ll just show you my configuration. But first, here are some premises about my use case.

1. I’m using GitHub to store the files synchronized by Chezmoi; having a version control system to manage configurations is incredibly convenient.
2. Both for hobbies and work, I use two MacBooks, so my dotfiles are synchronized across two similar operating systems
3. I'm terrible at keeping track of configurations, so I absolutely need to automate the processes.


### 1.1 Chezmoiignore

Just like Git, Chezmoi also uses a file to specify objects that should not be involved in the versioning process. In my case, the only files excluded from this process are some Oh My Zsh files. Therefore, my .chezmoiignore file is composed as follows:

```bash
.oh-my-zsh/.git/
.oh-my-zsh/plugins/
.oh-my-zsh/custom/
.oh-my-zsh/themes
```

### 1.2 Automatically commit and push changes to your repo


Having a system like this is useless if you don't keep your dotfiles aligned with Chezmoi. One feature I found very interesting is the autocommit and autopush functionality when a dotfile is modified. To enable these features, you can configure Chezmoi as follows

```toml
[git]
    autoCommit = true
    autoPush = true
```

Paste this into your *~/.config/chezmoi/chezmoi.toml* file

### 1.3 Automatically add changes to your repo

To keep all the files automatically aligned, the last piece of the puzzle is automating the addition of new or modified files. I solved this issue with a script executed by a cron job on a daily basis. Below is the script I use:

```bash
#!/bin/bash

current_time=$(date +"%d-%m-%Y-%H")
log_filename="${current_time}.log"

# Redirect stdout and stderr to the log file
exec > >(tee -a "$log_filename") 2>&1

cd $HOME || { echo "Failed to change directory to $HOME"; exit 1; }

# Run the 'chezmoi managed' command and save the output to a variable
managed_files=$(chezmoi managed)


if [ $? -ne 0 ]; then
  echo "Error during the execution of 'chezmoi managed'"
  exit 1
fi


while IFS= read -r file; do
  # Run the 'chezmoi add' command for each file
  chezmoi add "$file"
done <<< "$managed_files"

```

Now you can create a cron job that executes this script whenever you want!


## 2 Bonus Point: Homebrew Dump for Restoring on Other Clients

If you've installed most of your packages with Homebrew, I recommend installing brew bundle with the following command:

```brew bundle install```

To generate a file containing all installed packages along with their respective versions, you can use the command:

```brew bundle dump```

And to install all the packages on a new client:

```brew bundle --file=~/.private/Brewfile```

With Chezmoi, you just need to keep track of this file in the synchronization process, and you're all set!


## 3 Conclusions

In this article, we've explored how to manage multiple dotfiles across multiple clients using a versioning system, ensuring they're always up-to-date and aligned. I hope you found it helpful! If you encounter any issues with the configurations discussed in this article, feel free to reach out to me. See you soon!

## 4 Useful Links

[Chezmoi](https://www.chezmoi.io/)

[Automatically commit and push changes to your repo](https://www.chezmoi.io/user-guide/daily-operations/#automatically-commit-and-push-changes-to-your-repo)

[Brew Bundle](https://gist.github.com/ChristopherA/a579274536aab36ea9966f301ff14f3f)

