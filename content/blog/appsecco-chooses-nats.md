+++
date = "2020-02-24"
draft = false
title = "Appsecco Chooses NATS"
author = "NATS & Appsecco"
categories = ["Engineering","Guest-Post","Use Case","Community"]
tags = ["NATS","Appsecco","Community","Security","Kubernetes","CNCF"]
+++

<img alt="Appsecco Logo" src="/img/blog/appsecco_chooses_nats/appsecco_logo.png" height="32" width="225">

Appsecco is a security-focused company out of London specializing in Application and Data Security for cloud-based companies. At almost 4-years-old, Appsecco has clients ranging from major global financial institutions and professional services firms to leading international retailers and retail brands and from large scale, heavy engineering companies to cutting edge technology companies across the globe.

## Why Appsecco Chose NATS

Appsecco is working on security workflow automation to deliver improved and effective application security services to their clients. Due to the nature of the problem, we modeled workflows in terms of independent units (security tools) packaged as docker containers running on Kubernetes. To orchestrate the various units required for a workflow, we required a messaging service that is lightweight yet flexible enough to support primitives like consumer groups, wild card subscriptions, failure resiliency, low latency, and high throughput.

Previous to finding NATS through the [CNCF Landscape](https://landscape.cncf.io/), Appsecco worked with RabbitMQ and Kafka but was looking for a lightweight and fast message queue system with standard requirements such as Topics, Consumer Groups, etc. to work with Kubernetes Pod. The team eventually replaced their Kafka implementation with NATS and Minio.

The team landed on NATS citing its easy adoption and low memory usage as key reasons to replace Kafka. In addition, the technology stack required available client libraries in Ruby, NodeJS and Go, and with available streaming support for possible future requirements, NATS fit the bill.

## System Design
Appsecco designed an API first loosely coupled, distributed system to solve its requirement for generic security workflow automation. The system consists of core components like **API Server**, **Feedback Function** and security tools (**Automation Services**). All the components are glued together using the NATS server for message passing. **API Server** initiates a scan workflow by providing input to scanners through NATS. The **Feedback Function** is responsible for generating new input to the system based on output produced by one of the security tools. The diagram below presents brief architecture of the system and how they are connected through the NATS server.

<img alt="Appsecco SPLAT Arch" src="/img/blog/appsecco_chooses_nats/SPLAT-Arch-NATS-Blog.png">

More information about the original POC using NATS can be found on Appsecco’s Medium article [Designing Distributed Systems for Security Workflow — Learning from our Nullcon Workshop](https://blog.appsecco.com/designing-distributed-systems-for-security-workflow-learning-from-our-nullcon-workshop-93c2445667f4).

## Moving Forward

As the world moves towards cloud-native technology stacks for deploying applications and microservices for their core business offerings, Appsecco has plans to offer continuous compliance services, cloud security posture management services in the near future. We plan to continue using NATS for its great set of features and support for multiple client libraries. The advantages that NATS provides are great for our platform setups and any on-prem enterprise requirements that we may need to fulfill.

## About Appsecco

You can find out more about Appsecco through their website and social media.

* Website: https://appsecco.com
* Technical Blog : https://blog.appsecco.com
* LinkedIn: https://linkedin.com/company/appsecco
* Twitter: [@appseccouk](https://twitter.com/appseccouk?lang=en)
* GitHub: [appsecco](https://github.com/appsecco)
