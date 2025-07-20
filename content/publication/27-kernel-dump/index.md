---
title: "How I Made My Linux Kernel Panic"
authors:
- admin
date: "2025-07-20T00:00:00Z"
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
summary: How I happily made my Linux kernel crash and lived to tell the tale
tags:
- Homelab
- Linux

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

## My First Kernel Crash Dump

Over the past few years, I’ve spent a lot of time studying Kubernetes and various projects from the Cloud Native Computing Foundation.
Since joining SUSE, I’ve had the opportunity to dive deeper into low-level topics related to the operating system.

This week, I watched a colleague perform a Kernel Crash Dump.

So I decided to experiment with it a bit in my homelab.

Before crashing something, let’s understand what we’re about to crash.

## What is the Kernel?

We all know that the Kernel is the core software layer that enables users and applications to interact with the hardware via the operating system.
Every time we run a command from the terminal or interact with a graphical interface (GUI), these actions are translated into system calls to the Kernel. These calls grant controlled access to critical resources like memory, storage, and CPU.

For example, when we run the ls command to list files in a directory, the system internally triggers a sequence of system calls that retrieve and display the file metadata from the filesystem.

Here’s a practical example using strace, a tool that traces and logs the system calls made by a process. With it, we can observe what system calls are invoked when we execute a command in a Linux environment:

```shell
root@kernel-crash-dump:~# strace ls
execve("/usr/bin/ls", ["ls"], 0x7fff13232c90 /* 19 vars */) = 0
brk(NULL)                               = 0x5643d1bce000
mmap(NULL, 8192, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_ANONYMOUS, -1, 0) = 0x7fac41614000
access("/etc/ld.so.preload", R_OK)      = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, "/etc/ld.so.cache", O_RDONLY|O_CLOEXEC) = 3
newfstatat(3, "", {st_mode=S_IFREG|0644, st_size=11479, ...}, AT_EMPTY_PATH) = 0
mmap(NULL, 11479, PROT_READ, MAP_PRIVATE, 3, 0) = 0x7fac41611000
close(3)                                = 0
openat(AT_FDCWD, "/lib/x86_64-linux-gnu/libselinux.so.1", O_RDONLY|O_CLOEXEC) = 3
read(3, "\177ELF\2\1\1\0\0\0\0\0\0\0\0\0\3\0>\0\1\0\0\0\0\0\0\0\0\0\0\0"..., 832) = 832
newfstatat(3, "", {st_mode=S_IFREG|0644, st_size=174312, ...}, AT_EMPTY_PATH) = 0
mmap(NULL, 186064, PROT_READ, MAP_PRIVATE|MAP_DENYWRITE, 3, 0) = 0x7fac415e3000
mmap(0x7fac415ea000, 110592, PROT_READ|PROT_EXEC, MAP_PRIVATE|MAP_FIXED|MAP_DENYWRITE, 3, 0x7000) = 0x7fac415ea000
mmap(0x7fac41605000, 32768, PROT_READ, MAP_PRIVATE|MAP_FIXED|MAP_DENYWRITE, 3, 0x22000) = 0x7fac41605000
mmap(0x7fac4160d000, 8192, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_FIXED|MAP_DENYWRITE, 3, 0x29000) = 0x7fac4160d000
mmap(0x7fac4160f000, 5840, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_FIXED|MAP_ANONYMOUS, -1, 0) = 0x7fac4160f000
close(3)                                = 0
openat(AT_FDCWD, "/lib/x86_64-linux-gnu/libc.so.6", O_RDONLY|O_CLOEXEC) = 3
read(3, "\177ELF\2\1\1\3\0\0\0\0\0\0\0\0\3\0>\0\1\0\0\0\20t\2\0\0\0\0\0"..., 832) = 832
pread64(3, "\6\0\0\0\4\0\0\0@\0\0\0\0\0\0\0@\0\0\0\0\0\0\0@\0\0\0\0\0\0\0"..., 784, 64) = 784
newfstatat(3, "", {st_mode=S_IFREG|0755, st_size=1922136, ...}, AT_EMPTY_PATH) = 0
pread64(3, "\6\0\0\0\4\0\0\0@\0\0\0\0\0\0\0@\0\0\0\0\0\0\0@\0\0\0\0\0\0\0"..., 784, 64) = 784
mmap(NULL, 1970000, PROT_READ, MAP_PRIVATE|MAP_DENYWRITE, 3, 0) = 0x7fac41402000
mmap(0x7fac41428000, 1396736, PROT_READ|PROT_EXEC, MAP_PRIVATE|MAP_FIXED|MAP_DENYWRITE, 3, 0x26000) = 0x7fac41428000
mmap(0x7fac4157d000, 339968, PROT_READ, MAP_PRIVATE|MAP_FIXED|MAP_DENYWRITE, 3, 0x17b000) = 0x7fac4157d000
mmap(0x7fac415d0000, 24576, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_FIXED|MAP_DENYWRITE, 3, 0x1ce000) = 0x7fac415d0000
mmap(0x7fac415d6000, 53072, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_FIXED|MAP_ANONYMOUS, -1, 0) = 0x7fac415d6000
close(3)                                = 0
openat(AT_FDCWD, "/lib/x86_64-linux-gnu/libpcre2-8.so.0", O_RDONLY|O_CLOEXEC) = 3
read(3, "\177ELF\2\1\1\0\0\0\0\0\0\0\0\0\3\0>\0\1\0\0\0\0\0\0\0\0\0\0\0"..., 832) = 832
newfstatat(3, "", {st_mode=S_IFREG|0644, st_size=629384, ...}, AT_EMPTY_PATH) = 0
mmap(NULL, 627592, PROT_READ, MAP_PRIVATE|MAP_DENYWRITE, 3, 0) = 0x7fac41368000
mmap(0x7fac4136a000, 438272, PROT_READ|PROT_EXEC, MAP_PRIVATE|MAP_FIXED|MAP_DENYWRITE, 3, 0x2000) = 0x7fac4136a000
mmap(0x7fac413d5000, 176128, PROT_READ, MAP_PRIVATE|MAP_FIXED|MAP_DENYWRITE, 3, 0x6d000) = 0x7fac413d5000
mmap(0x7fac41400000, 8192, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_FIXED|MAP_DENYWRITE, 3, 0x98000) = 0x7fac41400000
close(3)                                = 0
mmap(NULL, 12288, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_ANONYMOUS, -1, 0) = 0x7fac41365000
arch_prctl(ARCH_SET_FS, 0x7fac41365800) = 0
set_tid_address(0x7fac41365ad0)         = 39038
set_robust_list(0x7fac41365ae0, 24)     = 0
rseq(0x7fac41366120, 0x20, 0, 0x53053053) = 0
mprotect(0x7fac415d0000, 16384, PROT_READ) = 0
mprotect(0x7fac41400000, 4096, PROT_READ) = 0
mprotect(0x7fac4160d000, 4096, PROT_READ) = 0
mprotect(0x5643d144a000, 4096, PROT_READ) = 0
mprotect(0x7fac41647000, 8192, PROT_READ) = 0
prlimit64(0, RLIMIT_STACK, NULL, {rlim_cur=8192*1024, rlim_max=RLIM64_INFINITY}) = 0
munmap(0x7fac41611000, 11479)           = 0
statfs("/sys/fs/selinux", 0x7ffccae5ba90) = -1 ENOENT (No such file or directory)
statfs("/selinux", 0x7ffccae5ba90)      = -1 ENOENT (No such file or directory)
getrandom("\xf5\x54\xf7\xd6\xfa\x8e\x90\xf6", 8, GRND_NONBLOCK) = 8
brk(NULL)                               = 0x5643d1bce000
brk(0x5643d1bef000)                     = 0x5643d1bef000
openat(AT_FDCWD, "/proc/filesystems", O_RDONLY|O_CLOEXEC) = 3
newfstatat(3, "", {st_mode=S_IFREG|0444, st_size=0, ...}, AT_EMPTY_PATH) = 0
read(3, "nodev\tsysfs\nnodev\ttmpfs\nnodev\tbd"..., 1024) = 362
read(3, "", 1024)                       = 0
close(3)                                = 0
access("/etc/selinux/config", F_OK)     = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, "/usr/lib/locale/locale-archive", O_RDONLY|O_CLOEXEC) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, "/usr/share/locale/locale.alias", O_RDONLY|O_CLOEXEC) = 3
newfstatat(3, "", {st_mode=S_IFREG|0644, st_size=2996, ...}, AT_EMPTY_PATH) = 0
read(3, "# Locale name alias data base.\n#"..., 4096) = 2996
read(3, "", 4096)                       = 0
close(3)                                = 0
openat(AT_FDCWD, "/usr/lib/locale/C.UTF-8/LC_IDENTIFICATION", O_RDONLY|O_CLOEXEC) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, "/usr/lib/locale/C.utf8/LC_IDENTIFICATION", O_RDONLY|O_CLOEXEC) = 3
newfstatat(3, "", {st_mode=S_IFREG|0644, st_size=258, ...}, AT_EMPTY_PATH) = 0
mmap(NULL, 258, PROT_READ, MAP_PRIVATE, 3, 0) = 0x7fac41613000
close(3)                                = 0
openat(AT_FDCWD, "/usr/lib/x86_64-linux-gnu/gconv/gconv-modules.cache", O_RDONLY) = 3
newfstatat(3, "", {st_mode=S_IFREG|0644, st_size=27028, ...}, AT_EMPTY_PATH) = 0
mmap(NULL, 27028, PROT_READ, MAP_SHARED, 3, 0) = 0x7fac4135e000
close(3)                                = 0
futex(0x7fac415d5a4c, FUTEX_WAKE_PRIVATE, 2147483647) = 0
openat(AT_FDCWD, "/usr/lib/locale/C.UTF-8/LC_MEASUREMENT", O_RDONLY|O_CLOEXEC) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, "/usr/lib/locale/C.utf8/LC_MEASUREMENT", O_RDONLY|O_CLOEXEC) = 3
newfstatat(3, "", {st_mode=S_IFREG|0644, st_size=23, ...}, AT_EMPTY_PATH) = 0
mmap(NULL, 23, PROT_READ, MAP_PRIVATE, 3, 0) = 0x7fac41612000
close(3)                                = 0
openat(AT_FDCWD, "/usr/lib/locale/C.UTF-8/LC_TELEPHONE", O_RDONLY|O_CLOEXEC) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, "/usr/lib/locale/C.utf8/LC_TELEPHONE", O_RDONLY|O_CLOEXEC) = 3
newfstatat(3, "", {st_mode=S_IFREG|0644, st_size=47, ...}, AT_EMPTY_PATH) = 0
mmap(NULL, 47, PROT_READ, MAP_PRIVATE, 3, 0) = 0x7fac41611000
close(3)                                = 0
openat(AT_FDCWD, "/usr/lib/locale/C.UTF-8/LC_ADDRESS", O_RDONLY|O_CLOEXEC) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, "/usr/lib/locale/C.utf8/LC_ADDRESS", O_RDONLY|O_CLOEXEC) = 3
newfstatat(3, "", {st_mode=S_IFREG|0644, st_size=127, ...}, AT_EMPTY_PATH) = 0
mmap(NULL, 127, PROT_READ, MAP_PRIVATE, 3, 0) = 0x7fac4135d000
close(3)                                = 0
openat(AT_FDCWD, "/usr/lib/locale/C.UTF-8/LC_NAME", O_RDONLY|O_CLOEXEC) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, "/usr/lib/locale/C.utf8/LC_NAME", O_RDONLY|O_CLOEXEC) = 3
newfstatat(3, "", {st_mode=S_IFREG|0644, st_size=62, ...}, AT_EMPTY_PATH) = 0
mmap(NULL, 62, PROT_READ, MAP_PRIVATE, 3, 0) = 0x7fac4135c000
close(3)                                = 0
openat(AT_FDCWD, "/usr/lib/locale/C.UTF-8/LC_PAPER", O_RDONLY|O_CLOEXEC) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, "/usr/lib/locale/C.utf8/LC_PAPER", O_RDONLY|O_CLOEXEC) = 3
newfstatat(3, "", {st_mode=S_IFREG|0644, st_size=34, ...}, AT_EMPTY_PATH) = 0
mmap(NULL, 34, PROT_READ, MAP_PRIVATE, 3, 0) = 0x7fac4135b000
close(3)                                = 0
openat(AT_FDCWD, "/usr/lib/locale/C.UTF-8/LC_MESSAGES", O_RDONLY|O_CLOEXEC) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, "/usr/lib/locale/C.utf8/LC_MESSAGES", O_RDONLY|O_CLOEXEC) = 3
newfstatat(3, "", {st_mode=S_IFDIR|0755, st_size=4096, ...}, AT_EMPTY_PATH) = 0
close(3)                                = 0
openat(AT_FDCWD, "/usr/lib/locale/C.utf8/LC_MESSAGES/SYS_LC_MESSAGES", O_RDONLY|O_CLOEXEC) = 3
newfstatat(3, "", {st_mode=S_IFREG|0644, st_size=48, ...}, AT_EMPTY_PATH) = 0
mmap(NULL, 48, PROT_READ, MAP_PRIVATE, 3, 0) = 0x7fac4135a000
close(3)                                = 0
openat(AT_FDCWD, "/usr/lib/locale/C.UTF-8/LC_MONETARY", O_RDONLY|O_CLOEXEC) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, "/usr/lib/locale/C.utf8/LC_MONETARY", O_RDONLY|O_CLOEXEC) = 3
newfstatat(3, "", {st_mode=S_IFREG|0644, st_size=270, ...}, AT_EMPTY_PATH) = 0
mmap(NULL, 270, PROT_READ, MAP_PRIVATE, 3, 0) = 0x7fac41359000
close(3)                                = 0
openat(AT_FDCWD, "/usr/lib/locale/C.UTF-8/LC_COLLATE", O_RDONLY|O_CLOEXEC) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, "/usr/lib/locale/C.utf8/LC_COLLATE", O_RDONLY|O_CLOEXEC) = 3
newfstatat(3, "", {st_mode=S_IFREG|0644, st_size=1406, ...}, AT_EMPTY_PATH) = 0
mmap(NULL, 1406, PROT_READ, MAP_PRIVATE, 3, 0) = 0x7fac41358000
close(3)                                = 0
openat(AT_FDCWD, "/usr/lib/locale/C.UTF-8/LC_TIME", O_RDONLY|O_CLOEXEC) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, "/usr/lib/locale/C.utf8/LC_TIME", O_RDONLY|O_CLOEXEC) = 3
newfstatat(3, "", {st_mode=S_IFREG|0644, st_size=3360, ...}, AT_EMPTY_PATH) = 0
mmap(NULL, 3360, PROT_READ, MAP_PRIVATE, 3, 0) = 0x7fac41357000
close(3)                                = 0
openat(AT_FDCWD, "/usr/lib/locale/C.UTF-8/LC_NUMERIC", O_RDONLY|O_CLOEXEC) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, "/usr/lib/locale/C.utf8/LC_NUMERIC", O_RDONLY|O_CLOEXEC) = 3
newfstatat(3, "", {st_mode=S_IFREG|0644, st_size=50, ...}, AT_EMPTY_PATH) = 0
mmap(NULL, 50, PROT_READ, MAP_PRIVATE, 3, 0) = 0x7fac41356000
close(3)                                = 0
openat(AT_FDCWD, "/usr/lib/locale/C.UTF-8/LC_CTYPE", O_RDONLY|O_CLOEXEC) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, "/usr/lib/locale/C.utf8/LC_CTYPE", O_RDONLY|O_CLOEXEC) = 3
newfstatat(3, "", {st_mode=S_IFREG|0644, st_size=353616, ...}, AT_EMPTY_PATH) = 0
mmap(NULL, 353616, PROT_READ, MAP_PRIVATE, 3, 0) = 0x7fac412ff000
close(3)                                = 0
ioctl(1, TCGETS, {c_iflag=ICRNL|IXON|IXANY|IMAXBEL|IUTF8, c_oflag=NL0|CR0|TAB0|BS0|VT0|FF0|OPOST|ONLCR, c_cflag=B38400|CS8|CREAD, c_lflag=ISIG|ICANON|ECHO|ECHOE|ECHOK|IEXTEN|ECHOCTL|ECHOKE|PENDIN, ...}) = 0
ioctl(1, TIOCGWINSZ, {ws_row=87, ws_col=244, ws_xpixel=1708, ws_ypixel=1392}) = 0
openat(AT_FDCWD, ".", O_RDONLY|O_NONBLOCK|O_CLOEXEC|O_DIRECTORY) = 3
newfstatat(3, "", {st_mode=S_IFDIR|0700, st_size=4096, ...}, AT_EMPTY_PATH) = 0
getdents64(3, 0x5643d1bd7260 /* 8 entries */, 32768) = 248
getdents64(3, 0x5643d1bd7260 /* 0 entries */, 32768) = 0
close(3)                                = 0
newfstatat(1, "", {st_mode=S_IFCHR|0620, st_rdev=makedev(0x88, 0x1), ...}, AT_EMPTY_PATH) = 0
write(1, "kernel-crash-example\n", 21kernel-crash-example
)  = 21
close(1)                                = 0
close(2)                                = 0
exit_group(0)                           = ?
+++ exited with 0 +++
```

Behind a simple file listing, there is an impressive amount of instructions and interactions with the system.

For example, one of the most fundamental system calls in a Linux system is **execve**. 

```shell
execve("/usr/bin/ls", ["ls"], 0x7fff13232c90 /* 19 vars */) = 0
```

This syscall is used to load and execute a new program within the context of an existing process. It replaces the current process's code, data, and execution context with those of the new program.

In other words, when you run a command like ls, the shell itself uses execve to replace its own execution context with that of the ls binary, effectively starting the program.

## Kernel Crash

Like any piece of software, the Linux Kernel can also crash. In my case, I’m deliberately triggering a crash by writing to /proc/sysrq-trigger.

The most common causes of kernel crashes include:

- Bugs in device drivers
- Accessing invalid memory locations
- Race conditions
- Hardware errors

To safely experiment with a kernel crash, we can use the following command, a neat trick I learned from my colleague B, whom I thank for all the great lessons on low-level operating system topics:

```shell
echo c > /proc/sysrq-trigger
```

Command explanation:

1. /proc/sysrq-trigger is a special file exposed by the Linux Kernel that accepts commands related to the SysRq (System Request) mechanism.
2. When we write a character to this file, the Kernel interprets it as a SysRq command.
3. The letter c has a specific meaning: crash the system. It forces the Kernel to trigger an intentional Kernel Panic.

This is a controlled way to simulate and study crash dumps and kernel debugging techniques in a lab environment.

## Kernel Crash Dump

A Kernel Crash Dump is essentially a snapshot of the system’s memory and the kernel’s state at the exact moment the system experiences a panic or crash.

This snapshot captures all the information needed for post-mortem analysis, including the state of the CPU, memory, running processes, and critical kernel data structures.

Analyzing a crash dump helps engineers identify the root cause of the failure and debug issues that are difficult to reproduce in normal conditions.

### What is it for?

When a system hits a kernel panic, we often don’t have enough logs or details to understand what really happened.
A crash dump allows you to perform deep debugging using advanced tools such as:

- crash: a specialized tool for analyzing kernel crash dumps
- gdb: the GNU debugger, which can be used to inspect the memory captured in the dump
- kdump: a Linux kernel feature designed to capture and save crash dumps automatically when a panic occurs

These tools are essential for diagnosing low-level issues that would otherwise be invisible from standard logs or monitoring systems.

### How to Save a Kernel Crash Dump

There are several ways to capture a Kernel Crash Dump, but the most common approach is using kdump.
Kdump relies on kexec, a kernel feature that allows loading a secondary kernel into memory, keeping it ready to boot if the primary kernel panics.

When the primary kernel crashes:

1. kexec boots the secondary (or crash) kernel.
2. This minimal kernel mounts a filesystem and writes the contents of memory — the crash dump — to disk or sends it over the network.
3. This mechanism ensures that valuable diagnostic data is preserved even after a severe kernel failure.

We configure the environment variable:

```shell
GRUB_CMDLINE_LINUX="crashkernel=256M"
```

Then we install and enable kdump

```shell
sudo update
sudo apt-get install kdump-tools crash makedumpfile -y
sudo systemctl enable kdump-tools
sudo systemctl start kdump-tools
```

Next, we update GRUB

```shell
update-grub
```

Let's Crash the Kernel!

```shell
echo c > /proc/sysrq-trigger
```

At this point, I expected my machine to automatically reboot, but I was wrong.

When the kernel hits a kernel panic, the operating system halts completely. However, the hypervisor running the VM (in my case, Proxmox) keeps the VM powered on.

By default, Ubuntu and many Linux distributions neither reboot nor shut down after a kernel panic. They remain stuck in a “frozen” state, often displaying panic messages on screen.

You can verify this with:

```shell
cat /proc/sys/kernel/panic
```

If the value is 0, it means the machine will never automatically reboot after a panic

If everything went well, our kernel crash dump will be saved at the path ```/var/crash```. This file contains a snapshot of the kernel’s memory and state at the exact moment of the crash, which is essential for post-mortem analysis. However, having the dump file alone is not enough to perform a meaningful investigation.

To properly read and analyze this dump, we need a special version of the kernel that includes debug symbols. Debug symbols provide additional metadata that links the raw memory addresses and binary instructions back to the original source code, including function names, variable names, and line numbers. Without these symbols, tools like crash or gdb would only show raw memory addresses, making it very difficult to understand what part of the kernel caused the crash.

On many Linux distributions, debug symbol packages are distributed separately from the main kernel package. For example, if you are running kernel version 6.1.0-37-amd64, you can install the corresponding debug symbols package (often named something like linux-image-6.1.0-37-amd64-dbg) via your package manager. This will allow your debugging tools to map the dump data back to the actual source code and give you meaningful insights.

Once the debug symbols are installed and loaded, you can use tools like crash or gdb to open the dump file and begin investigating the kernel’s state at the time of the crash — examining stack traces, variables, and function calls to pinpoint the cause.

In my case (I’m using kernel version 6.1.0-37-amd64), I can install the debug symbol package with:

```shell
sudo apt update
sudo apt install linux-image-6.1.0-37-amd64-dbg
```

### Crash utility

At this point, we can start exploring the state of our Linux system at the moment of the kernel crash.

```shell
root@kernel-crash-dump:/var/crash/202507191627# crash /usr/lib/debug/boot/vmlinux-$(uname -r) dump.202507191627
[...]
please wait... (determining panic task)
WARNING: active task ffff97fd82773300 on cpu 2 not found in PID hash

      KERNEL: /usr/lib/debug/boot/vmlinux-6.1.0-37-amd64
    DUMPFILE: dump.202507191627  [PARTIAL DUMP]
        CPUS: 4
        DATE: Sat Jul 19 16:27:02 UTC 2025
      UPTIME: 00:10:33
LOAD AVERAGE: 0.00, 0.00, 0.00
       TASKS: 5
    NODENAME: kernel-crash-dump
     RELEASE: 6.1.0-37-amd64
     VERSION: #1 SMP PREEMPT_DYNAMIC Debian 6.1.140-1 (2025-05-22)
     MACHINE: x86_64  (3193 Mhz)
      MEMORY: 8 GB
       PANIC: "Kernel panic - not syncing: sysrq triggered crash"
         PID: 3104
     COMMAND: "bash"
        TASK: ffff97fd82773300  [THREAD_INFO: ffff97fd82773300]
         CPU: 2
       STATE: TASK_RUNNING (PANIC)
```

Our investigation could end here. The first lines already give us a very useful piece of information about the incident:

```shell
PANIC: "Kernel panic - not syncing: sysrq triggered crash"
```

Which is exactly the command we used to crash the kernel.

But since we’re here, let’s take a deeper look around.

We triggered the kernel crash on purpose by writing a character into a special file. This means there must be a piece of C code in the kernel that handles writing to that file and eventually causes the crash. So let's try to find the responsible function.

By using the  **bt (backtrace)** command within the crash utility, we can see the crash stack trace — that is, the chain of function calls that led to the kernel panic.

```shell
crash> bt
PID: 3104     TASK: ffff97fd82773300  CPU: 2    COMMAND: "bash"
 #0 [ffffbed1009ebbd8] machine_kexec at ffffffff8e876def
 #1 [ffffbed1009ebc30] __crash_kexec at ffffffff8e9729c7
 #2 [ffffbed1009ebcf0] panic at ffffffff8f1f0fc7
 #3 [ffffbed1009ebd70] sysrq_handle_crash at ffffffff8ee86b96
 #4 [ffffbed1009ebd78] __handle_sysrq.cold at ffffffff8f21f2b7
 #5 [ffffbed1009ebda8] write_sysrq_trigger at ffffffff8ee874e4
 #6 [ffffbed1009ebdb8] proc_reg_write at ffffffff8ebff9c6
 #7 [ffffbed1009ebdd0] vfs_write at ffffffff8eb622b7
 #8 [ffffbed1009ebe68] ksys_write at ffffffff8eb6277b
 #9 [ffffbed1009ebea0] do_syscall_64 at ffffffff8f232da5
#10 [ffffbed1009ebee0] do_user_addr_fault at ffffffff8e887540
#11 [ffffbed1009ebf28] exit_to_user_mode_prepare at ffffffff8e945510
#12 [ffffbed1009ebf50] entry_SYSCALL_64_after_hwframe at ffffffff8f400126
    RIP: 00007f85ce558300  RSP: 00007fffb1f2f1d8  RFLAGS: 00000202
    RAX: ffffffffffffffda  RBX: 0000000000000002  RCX: 00007f85ce558300
    RDX: 0000000000000002  RSI: 0000555bb8291250  RDI: 0000000000000001
    RBP: 0000555bb8291250   R8: 0000000000000007   R9: 0000000000000073
    R10: 0000000000000000  R11: 0000000000000202  R12: 0000000000000002
    R13: 00007f85ce633760  R14: 0000000000000002  R15: 00007f85ce62e9e0
    ORIG_RAX: 0000000000000001  CS: 0033  SS: 002b
```

The ```sysrq_handle_crash function``` is the one responsible for triggering the kernel crash.
It was invoked by ```write_sysrq_trigger```, which handles writing to the ```/proc/sysrq-trigger``` file

## Diving Deeper Using GDB

GDB (GNU Debugger) is a powerful tool used to debug programs by allowing developers to inspect what is happening inside a program while it runs or after it crashes. It supports stepping through code, examining variables, and analyzing backtraces. GDB is essential for diagnosing issues in both user-space applications and the Linux kernel.

```shell
sudo apt install gdb
```


```shell
root@kernel-crash-dump:/var/crash/202507191627# gdb /usr/lib/debug/boot/vmlinux-6.1.0-37-amd64
GNU gdb (Debian 13.1-3) 13.1
Copyright (C) 2023 Free Software Foundation, Inc.
License GPLv3+: GNU GPL version 3 or later <http://gnu.org/licenses/gpl.html>
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.
Type "show copying" and "show warranty" for details.
This GDB was configured as "x86_64-linux-gnu".
Type "show configuration" for configuration details.
For bug reporting instructions, please see:
<https://www.gnu.org/software/gdb/bugs/>.
Find the GDB manual and other documentation resources online at:
    <http://www.gnu.org/software/gdb/documentation/>.

For help, type "help".
Type "apropos word" to search for commands related to "word"...
Reading symbols from /usr/lib/debug/boot/vmlinux-6.1.0-37-amd64...
(gdb) list sysrq_handle_crash
146	drivers/tty/sysrq.c: No such file or directory.
(gdb) list sysrq_handle_crash
146	in drivers/tty/sysrq.c
```

This lets us locate the file where the function resides but doesn’t allow us to see the function’s body. Why is that?

The compiled code is certainly present in memory and the function was definitely called, but the source code is not installed by default on our Linux system.

Here I admit I overestimated what a kernel with debug symbols can do, but it totally makes sense: the system includes debugging information (like function names, source file paths, and line numbers) but does not include the actual source files.

So GDB tells us:

```shell
(gdb) list sysrq_handle_crash
146	in drivers/tty/sysrq.c
```

but it cannot show the code because that .c file does not exist on our filesystem.

Let's download the source code!

```shell
sudo apt-get install linux-source-6.1
cd /usr/src
sudo tar -xf linux-source-6.1.tar.xz
```

Linking the source in gdb

```shell
gdb /usr/lib/debug/boot/vmlinux-6.1.0-37-amd64
```

set the source path

```shell
(gdb) directory /usr/src/linux-source-6.1
```

so that GDB can resolve references to the .c files.

And now we can finally view our function

```shell
(gdb) list sysrq_handle_crash
146	#else
147	#define sysrq_unraw_op (*(const struct sysrq_key_op *)NULL)
148	#endif /* CONFIG_VT */
149
150	static void sysrq_handle_crash(int key)
151	{
152		/* release the RCU read lock before crashing */
153		rcu_read_unlock();
154
155		panic("sysrq triggered crash\n");
(gdb)
```

## Conclusion

In this article, we triggered a kernel crash intentionally using the /proc/sysrq-trigger interface. Then, we set up kdump to capture the crash dump and explored how to analyze it with tools like crash and gdb. Finally, we learned how to locate the source code related to the crash to better understand what happened inside the kernel.