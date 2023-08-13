---
title: "History of my career"
layout: "History of my career"
url: "/history-of-my-career/"
summary: History of my career
ShowWordCount: false
ShowReadingTime: false
tocTitle: "On this page"
disableShare: true
---

Hello, it's me. Ettore!

![me](/aboutImg/me.png)

## The Very Beginning

As it seems, like everyone in this field, I started tinkering with computers from a young age. Initially, it was just for playing games, but around the age of 15, I began to wonder what was behind the scenes and how things worked under the hood.

My first "creation" was a website on Altervista. It was terrible. A simple page made with HTML and CSS, which displayed a playlist whenever it was viewed. But I had a domain like stupidfifteenyearoldname.altervista.org, and I felt like a Sensei.

Then came the first computer science lessons at school. Truth be told, I had chosen a school where computer science wasn't the main focus, but luckily, I had a passionate computer science teacher. During the first two years of high school, we finished the math curriculum a few weeks early, so the teacher gave us basic programming lessons in Pascal. I still remember the IDE's logo we used, Lazarus. In those weeks, we created simple programs (calculator and power calculations). And this is my experience with computer science at school.

## Bachelor's Degree

When it was time to choose which university to attend, I chose Computer Engineering at Federico II in Naples. After a rocky start, I began to enjoy the journey: programming, networks, computer architecture, and a lot of math and physics. During my fourth year (I should have finished the degree the previous year, darn it), I received a job offer from a nearby company that seemed to be involved in IT.

## First Job Experience: SysAdmin

This is where my professional life chapter begins. I was still finishing my studies and wanted to do it part-time. That "system administrator" position seemed perfect to start and balance both. I was young and naive, knowing nothing about the working world. 
Long story short: that job quickly turned into a full-time one.
Without going into details, within a few months, that job had nothing left to teach me. But I was hungry.

![sysadmin](/aboutImg/sysadmin.png)

So, I ordered parts for my first homelab PC, spending what was basically my entire salary back then. 
When I wasn't at work, I played with my homelab: assembling, disassembling, and experimenting with open-source products. Once satisfied, I wiped everything and tried some other configuration. 
After a couple of months of this, continuing to work at my first job made no sense anymore. I submitted my resignation.
The boss then decided to drastically reduce my working hours while keeping the same pay, just to make me stay. I accepted.

_Mistake number one for a young professional: never accept a counteroffer. Lesson learned._

So, I kept working there, with nothing more to learn. But I had much more time to dedicate to my homelab, so my skills grew elsewhere.

I continued like this for a few months until July of that year when I created my first Amazon Web Services account and started playing with EC2 instances.
I immediately realized that all the computational capacity issues I had in my homelab could be solved with a couple of clicks on AWS (yes, I'm talking about clicks, the me of that time didn't know anything about Infrastructure as Code yet).

I tinkered with AWS until September, and in that month, I was ready to resign again. But surprise!
My company decided to open a branch entirely dedicated to the Cloud, and I had the opportunity to study it from within. I was given a certification goal to achieve (AWS Cloud Practitioner and Azure Fundamentals). I obtained both in less than a month and started working on small Cloud projects.
For months, I continued with my sysadmin job, my homelab, and doing small projects in this Cloud branch of the company.

In December, I left my sysadmin job to focus solely on the Cloud part.

Long story short: that Cloud branch of my company soon turned into a body rental on awful technologies, with very low salaries and no one willing to participate.

_Mistake number two: companies are made up of people. If the same people whose values you don't share in company A, you probably won't share them in company B either. Lesson learned_

My world collapsed. I was very disappointed with that job. So, I started doing interviews to find a new one.

Until that moment, I hadn't had any other job interviews, and starting to have them opened up a whole new world for me. If I had done it earlier, that tragic work experience would have only lasted a few months.

_Mistake number three: not knowing one's target market. Lesson learned_


I had 5 interviews in the month of February, receiving four offers. But did I really want to get back into work? Up until that point, I had been operating on autopilot.

I had a bad gut feeling about those interviews.

No, I didn't want to go back to working. It was time to sort out my thoughts and refocus on my university studies.

In the following months, I dedicated my time to university studies, trying to complete my bachelor's degree. I was five exams away from finishing; I passed 3 of them in 4 months.
Wow, I can still do it. I can still study!

## [Cyber Hackademy](https://cyberhackademy.unina.it/)

Meanwhile, the opportunity to attend a cybersecurity academy organized by my university arose. For the top five performers, there was a scholarship up for grabs. Even though I was only studying at that time, I decided to give it a shot.
The selection process was divided into three phases: evaluation of qualifications, written exam, and oral exam.

I passed the tests and got in.

The months at Cyber Hackademy were fantastic. Even though some lessons were designed for entry-level participants, I enjoyed it a lot.
That experience lasted for 9 months, from May 2021 to January 2022. The last 3 months were dedicated to a project carried out by different teams.
I was in one of those teams, TEAM DRAGONS.
Our project was an [AWS-based honeynet](https://www.youtube.com/watch?v=DDVL2ZiZcyg), set up with Terraform and equipped with logging and monitoring tools to gather information about attackers.

And here we are on stage that day, presenting our project. 

![Cyber Hack](/aboutImg/cyberhack.png)


## [Epsilon](https://www.epsilonline.com/): game changer

During the months of Cyber Hackademy, just before it ended, I started interviewing again. Again, I had bad feelings during the interviews. I passed all of them, but after the first company, I think I developed a radar for toxic workplaces. And that radar went off every time during the interviews BEEP BEEP BEEP.

Until Epsilon came along.

There, I had a great conversation about computer science with the CTO.

The radar didn't sound, and I started working with them.

My time at Epsilon was fantastic.

Great colleagues, technical depth, engineering depth. What a wonderful place. At Epsilon, I didn't feel like I had a boss, just people who were technically more knowledgeable than me.

For over a year, I commuted to Epsilon twice a week (their office was just over an hour from where I lived). When I went there, I stayed in a hotel paid for by Epsilon and had delicious poke bowls whenever I stayed in Naples. You can't imagine how good it was.

![Poke](/aboutImg/poke.png)

This is where I started using Cloud professionally and had my first real encounter with Kubernetes, a technology I would specialize in later.

I can say that the few foundations I have today were built at Epsilon.

"Many say that computer science moves fast, but it's false. Computer science has been the same for thirty years; it's the technologies that move fast."

But even more importantly, Epsilon restored my confidence in the working world. It made me realize that good places exist :heart:

## [SIGHUP](https://sighup.io/): Kubernetes time

During my journey at Epsilon, I was asked to delve into studying a Kubernetes Cluster in an on-premise environment. Until then, I had only seen Kubernetes in its managed AWS version.
One thing was clear: going into production with a "bare" Kubernetes cluster was unthinkable.
A cluster would need logging, monitoring, access management.
Moreover, I had to translate AWS services (ECS, S3, EC2, DynamoDB, etc.) into something usable outside a cloud provider.
At that moment, I understood that Kubernetes' true strength lay in its extensibility.
I liked Kubernetes before, but from that moment on, I fell in love with it.

And as I consumed online resources to understand what people were running in their production clusters, I came across the k8s Fury distribution by SIGHUP.
At that moment, I thought about how fun it would be to work at a company that had made Kubernetes its core business, but I left it at that.

Months later, I attended a Meetup, where the speakers were from SIGHUP.

Then a position opened up in that company.

And then...

![SIGHUP](/aboutImg/joinSIGHUP.png)

And now, I find myself here, working in the fantastic Team 2 of the Cloud Native Solution Engineer (CNSE). I only see my colleagues at company events; the work is fully remote.
I'm growing a lot, learning many new things, and others I thought I knew.

And it's through SIGHUP that I had the opportunity to participate in the [Kubernetes Community Day Italy](https://community.cncf.io/events/details/cncf-kcd-italy-presents-kubernetes-community-days-italy-2023/) for the first time!

![KCD](/aboutImg/KCD.png)

## Current state

Currently, I'm in SIGHUP, sitting at my comfortable workstation

![workstation](/aboutImg/workstation.png)

trying to learn something new every day.

The technologies I work with the most are Kubernetes, AWS services related to Kubernetes (VPC, EC2, S3, EKS), Ansible, Terraform, and Kong Gateway.

When I'm not engaged in IT-related activities, I'm probably watching some anime with my super nerdy girlfriend.
And if we're not doing that, we're probably at a comic book convention.
This is her pretending to explain to me what a triptych is at an art exhibition.

![mostra](/aboutImg/mostra.png)

The photo is blurry because my girlfriend is elusive.

If you're wondering, a triptych is a single pictorial or sculptural work divided into three parts, which can be joined by side hinges or a pedestal known as a predella. The triptych can be completed by an upper part called a cimasa.

What else can I say? Oh, I also enjoy walking.

And when I say walking, I mean for hours. This is the view from one of my evening strolls.
I absolutely love this.

![view](/aboutImg/view2.png)
