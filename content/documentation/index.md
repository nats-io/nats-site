+++
title = "NATS Documentation"
category = "documentation"
showChildren=true
[menu.documentation]
  name = "Intro"
  weight = -100
  identifier = "intro"
  parent = "getting started"
+++


# NATS Introduction

[NATS](http://nats.io/) is an open-source, cloud-native messaging system. In addition to functioning as the "nervous system" for the Apcera platform, companies like Baidu, Siemens, VMware, HTC, and Ericsson rely on NATS for its highly performant and resilient messaging capabilities.

## NATS server

NATS provides a lightweight [server](/documentation/server/gnatsd-intro/) that is written in the Go programming language. [Apcera](http://www.apcera.com/) actively maintains and supports the NATS server source code, binary distributions, and [Docker image](https://hub.docker.com/_/nats/).

## NATS clients

There are several [client libraries](/documentation/clients/nats-clients/) for NATS. Apcera actively maintains and supports the Go, Node, Ruby, Java, C, C# and NGINX C clients, and there are several community-provided clients.

You can write your own client in any language you choose. NATS provides a simple, [text-based protocol](/documentation/internals/nats-protocol/) that makes [writing clients](/documentation/internals/nats-guide) a breeze.

## NATS design goals

The core principles underlying NATS are performance, scalability, and ease-of-use. Based on these principles, NATS is designed to be:

- Highly performant (fast)
- Always on and available (dial tone)
- Extremely lightweight (small footprint)
- At most once delivery (fire and forget)
- Support for various messaging models and use cases (flexible)

## NATS use cases

NATS is a fire-and-forget messaging system designed to natively support modern cloud architectures. Because complexity does not scale, NATS is designed to be easy to use and implement.

Some of the types of use cases that are ideal for NATS include:

- Addressing, discovery
- Command and control (control plane)
- Load balancing
- N-way scalability
- Location transparency
- Fault tolerance

NATS philosophy holds that high levels of quality-of-service should be built into the client. Only request-reply is built in. NATS does not provide:

- Persistence
- Transactions
- Enhanced delivery modes
- Enterprise queueing

## NATS messaging models

NATS supports various messaging models, including:

- [Publish Subscribe](/documentation/concepts/nats-pub-sub/)
- [Request Reply](/documentation/concepts/nats-req-rep/)
- [Queueing](/documentation/concepts/nats-queueing/)

## NATS features

NATS provides the following unique features:

- [Pure pub sub](/documentation/server/gnatsd-intro/)
	- Never assumes the audience.
	- Always "on" dial tone.
- [Clustered mode server](/documentation/server/gnatsd-cluster/)
	- NATS servers can be clustered together.
	- Distributed queueing across clusters.
	- Cluster-aware clients.
- [Auto-pruning of subscribers](/documentation/server/gnatsd-prune/)
	- To support scaling, NATS provides for auto-pruning of client connections.
	- If a client app is slow consuming messages, NATS will cut off the client.
	- If a client is not responsive within the ping-pong interval, the server cuts it off.
	- Clients implement retry logic.
- [Text-based protocol](/documentation/internals/nats-protocol/)
	- Makes it easy to get started with new clients.
	- Does not affect server performance.
	- Can [Telnet](https://en.wikipedia.org/wiki/Telnet) directly to the server and send messages across the wire.

## NATS FAQs

See our [FAQ page](/documentation/faq).
