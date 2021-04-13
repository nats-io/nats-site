+++
date = "2021-04-12"
draft = false
title = "What's New in NATS 2.2"
author = "Colin Sullivan"
categories = ["General", "Engineering"]
tags = ["NATS", "MQTT", "WebSockets"]
+++

# Overview

NATS 2.2 is the largest feature release since version 2.0. The 2.2 release provides highly scalable, highly performant, secure and easy-to-use next generation streaming in the form of JetStream, allows remote access via websockets, has simplified NATS account management, and provides native MQTT support built into the server. These features further enables NATS toward our goal of securely democratizing streams and services for the hyperconnected world we live in.

# JetStream - Next Generation Streaming

Streaming is the processing of an unbounded, continuously updating data set that is ordered, immutable, replayable, and fault-tolerant, and is used in a variety of use cases ranging from fraud detection to replaying market data to holding sensor readings.
<div class="flex-container">
   <div>
     <img src="/img/blog/nats-whats-new-22/jetstream-logo.png" alt="JetStream Logo" height="200" width="200"> 
   </div>
   <div>
    <a href="https://docs.nats.io/jetstream/" target="_blank">JetStream</a> was created to solve the problems identified with today’s streaming technology - complexity, fragility, and a lack of scalability resulting in expensive systems that hinder innovation.

Some technologies address these better than others, but no current streaming technology is truly multi-tenant, horizontally scalable, and supports multiple deployment models and consumption patterns until JetStream.
   </div>
</div>

## Features

In terms of deployment, a JetStream server is simply a NATS server with the JetStream subsystem enabled. JetStream allows for a flexible deployment allowing for optimization of resources - particular servers will store streams while others are low overhead stateless servers, reducing OpEx and ultimately creating a scalable and manageable system.

Features include:

- At-least-once delivery and exactly once within a window
- Store data and replay by time or sequence
- Wildcard support
- NATS 2.0 Security aware
- Data at rest encryption (Version 2.2.3)
- Cleanse specific messages (GDPR)
- Horizontal scalability
- Persist Streams and replay via Consumers

JetStream is designed to bifurcate ingestion and consumption of messages to provide multiple ways to consume data from the same stream. To that end, JetStream functionality is composed of server streams that hold data and server consumers that provide a way for applications to access data. Streams and consumers may be provisioned ahead of time, at runtime, and are independently configured to provide the flexibility to balance performance and reliability and create the perfect environment for your business needs.

<img src="/img/blog/nats-whats-new-22/streams-and-consumers-75p.png" alt="JetStream Streams and Consumers">


## Configuration and Management
JetStream is a breeze to configure and manage through the easy-to-use and self-guided [NATS CLI](https://docs.nats.io/jetstream/administration), available on all major platforms and architectures. The CLI has been designed with patterns familiar to SREs and DevOps today. It can be interactively scripted to automate deployments and definitions of streams, and consumers may be safely maintained in version control. GitHub actions and a terraform provider allow for deployment in modern cloud and enterprise deployments.

## Security

JetStream allows for easily defined policies ranging from general accessibility to [fine-grained permissions](https://docs.nats.io/jetstream/nats_api_reference#admin-api) for individual operations and stream and consumer access from specific users using standard subject based authorization.

## Scalability
Business continuity was the mindset behind scalability in JetStream so one can add processing power and storage anytime. Servers can be horizontally scaled at runtime by simply adding more servers with zero downtime and minimal impact on the system.

To scale up the processing of streaming data, simply add additional instances of your applications, anytime, with zero configuration updates to distribute the workload and scale in real-time.

## Deployment
Flexible deployment models supporting your choice of tuning between performance and availability. Mix and match JetStream enabled servers with standard NATS servers to create the perfect deployment for your environment.

## High Availability
Finely tune risk tolerance and performance to build the system that perfectly suits your needs. JetStream supports deployment models from [highly replicated large clusters](https://docs.nats.io/jetstream/clustering) mirrored across geographies, to small clusters with high-speed memory streams.

## Edge
Run a single JetStream enabled server on the edge to store and forward data. Automatically replicate data to the cloud when there is connectivity and operate autonomously when there is not.

## Disaster Recovery
JetStream supports [backup and restore](https://docs.nats.io/jetstream/disaster_recovery) by storing compressed snapshots of streams outside of the system. Backups are made on a per-stream basis, giving you greater flexibility in maintenance schedules or separating operations between different groups.

Tailor the frequency of snapshots to your needs. Since the backup tool is driven by the NATS CLI tooling, the backup and restore processes can be scripted and secured.

Streams do not have to be restored to their original cluster allowing for a complete cluster migration. Take production data and move it to a development or QA environment.

# Simplified Account Management
Security is difficult and managing accounts and users at scale can be onerous. Managing accounts in NATS just became much easier. NATS 2.2 supports a built-in [account management system](https://docs.nats.io/nats-server/configuration/securing_nats/jwt/resolver#nats-based-resolver), eliminating the need to set up a separate account manager. With automated default system account generation, and the ability to preload accounts, simply enable a set of servers in your deployment to be account resolvers or account resolver caches, and they will handle public account information provided to the NATS system through the NATS nsc tooling. Have an enterprise-scale account management up and running in minutes.

# Security For Any Deployment

<div class="flex-container">
   <div>
<img src="/img/blog/nats-security-update/nats-security.png" alt="NATS Security Logo" height="400" width="400">
   </div>
   <div>
   We’ve enhanced NATS existing multi-tenant security model with a few new features to lock down from where and when applications can connect to NATS, and to allow operators to simplify securing NATS with default permissions to reduce the potential for human error.
   </div>
</div>

## CIDR Block Account Restrictions
By specifying a CIDR block restriction for a user, policy can be applied to limit connections from clients within a certain range or set of IP addresses. Use this as another layer of security atop user credentials to better secure your distributed system. Ensure your applications can only connect from within a specific cloud, enterprise, geographic location, virtual or physical network.

## Time-Based Account Restrictions
Scoped to the user, you can now specify a specific [block of time](https://docs.nats.io/nats-tools/nsc/basics#user-authorization) during a day when applications can connect. For example, permit certain users or applications to access the system during specified business hours, or protect business operations during the busiest parts of the day from batch driven back-office applications that could adversely impact the system when run at the wrong time.

## Default User Permissions
Now you can specify [default user permissions](https://docs.nats.io/nats-server/configuration/securing_nats/authorization#examples) within an account. This significantly reduces efforts around policy, reduces chances for error in permissioning, and simplifies the provisioning of user credentials.

# Mobile Connectivity with WebSockets

<div class="flex-container">
 <div>
<img src="/img/blog/nats-whats-new-22/mobile_phone_cloud.png" alt="Mobile Phone Cloud" height="400" width="400">
 </div>

 <div>
 Connect mobile and web applications to any NATS server using <a hef="https://docs.nats.io/nats-server/configuration/websocket" target="_blank">WebSockets</a>. Built to more easily traverse firewalls and load balancers, NATS WebSocket support provides even more flexibility to NATS deployments and makes it easier to communicate to the edge and endpoints. This is currently supported in NATS server leaf nodes, nats.ts, nats.deno, and the nats.js clients.
 </div>
</div>

# Leverage Existing IoT Deployments with MQTT

<div class="flex-container">
  <div>
  <img src="/img/blog/nats-whats-new-22/iot-ecosystem.png" alt="IoT Ecosystems" height="1000" width="1000">
  </div>
  <div>
  With the <a href="https://nats.io/blog/synadia-adaptive-edge">Adaptive Edge architecture</a> and the ease with which NATS can extend a cloud deployment to the edge, it makes perfect sense to leverage existing investments in IoT deployments. It’s expensive to update devices and large edge deployments. Our goal is to enable the hyperconnected world, so we added first-class support for MQTT 3.1.1 directly into the NATS Server. There are no sidecars, external processes or bridges to manage.
  </div>
</div>

Seamlessly integrate existing IoT deployments using [MQTT 3.1.1](https://docs.nats.io/nats-server/configuration/mqtt) with a cloud-native NATS deployment. Enable MQTT in the NATS server and instantly send and receive messages to your MQTT applications and devices from a NATS deployment whether it be edge, single-cloud, multi-cloud, on-premise, or any combination thereof.

# Features to Build Better Systems
We’ve added a variety of features to allow you to build a more resilient, secure, and simply better system at scale.

## Do More with Message Headers

We’ve added the ability to optionally use headers, following the HTTP semantics familiar to developers. Headers allow you to provide application-specific metadata, such as compression or encryption-related information, without touching the payload, allowing for richer applications and easier integration with other systems.

## Zero-Downtime Maintenance

When taking down a server for maintenance, servers can be signaled to enter [Lame Duck Mode](https://docs.nats.io/nats-server/nats_admin/lame_duck_mode) where they do not accept new connections and evict existing connections over a period of time. Maintainer supported clients will notify applications that a server has entered this state and will be shutting down, allowing a client to smoothly transition to another server or cluster and better maintain business continuity during scheduled maintenance periods.

## React Quickly to Errors

Systems fail - it’s a fact of life. How quickly this is identified and how systems respond can make a tremendous difference to the end user. Why wait for timeouts when services aren’t available? When a request is made to a service and NATS identifies that there are no services available a “no-responders” message will be sent back to the requesting client which will break from blocking API calls. This allows applications to immediately react which further enables building a highly responsive system at scale, even in the face of application failures and network partitions.

## Canary Deployments and A/B Testing

Reduce risk when onboarding new services. Canary deployments, A/B testing, and transparent teeing of data streams are now fully supported in NATS. The NATS Server allows accounts to form subject mappings from one subject to another for both client inbound and service import invocations and allows weighted sets for the destinations. Map any percentage - 1 to 100 percent of your traffic - to other subjects, and change this at runtime with a server configuration reload. You can even artificially drop a percentage of traffic to introduce chaos testing into your system.

## More Meaningful Metrics

NATS now allows for [fine-grained monitoring](https://docs.nats.io/nats-server/configuration/monitoring#account-information) to identify usage metrics tied to a particular account. Inspect messages and bytes sent or received and various connection statistics for a particular account. Accounts can represent anything - a group of applications, a team or organization, a geographic location, or even roles. If NATS is enabling your SaaS solution your NATS account scoped metrics provide a perfect way to bill your users.

# Wrapping it up

The NATS project is continuing to lead the way toward a radically simple way to democratize streams and services. JetStream, the next generation of streaming, combined with WebSockets, MQTT, and the security features of NATS allows for a flexible, resilient, and easy to manage system at scale with the capability of securely spanning cloud, hybrid, edge and IoT.

Businesses backed by NATS will experience low operational costs, can provide better SLAs to their customers, and future-proof their deployment to seamlessly scale with growth.

# About the Author

I'm [Colin Sullivan](https://www.linkedin.com/in/colinsullivan/), Product Manager at [Synadia](www.synadia.com) for NATS.io and a long-time NATS maintainer.

If you're interested in learning more about NATS as an open source project, contact the NATS Maintainers at <info@nats.io>.
