+++
title = "NATS Documentation"
category = "documentation"
showChildren=true
[menu.main]
  name = "Intro"
  weight = -100
  identifier = "intro"
  parent = "Getting Started"
+++


# NATS Introduction

[NATS](http://nats.io/) is an open-source, cloud-native messaging system. Companies like Apcera, Baidu, Siemens, VMware, HTC, and Ericsson rely on NATS for its highly performant and resilient messaging capabilities.

## NATS server

NATS provides a lightweight [server](/documentation/server/gnatsd-intro/) that is written in the Go programming language. NATS is maintained by Synadia and an amazing OpenSource Ecosystem, find more at [GitHub](http://www.github.com/nats-io).

## NATS clients

There are several [client libraries](/download/) for NATS. Synadia actively maintains and supports the Go, Node, Ruby, Java, C, C# and NGINX C clients, and there are several community-provided clients.

You can write your own client in any language you choose. NATS provides a simple, [text-based protocol](/documentation/internals/nats-protocol/) that makes [writing clients](/documentation/internals/nats-guide) a breeze.

## <a name="design-goals"></a>NATS design goals

The core principles underlying NATS are performance, scalability, and ease-of-use. Based on these principles, NATS is designed around the following core features:

- Highly performant (fast)
- Always on and available (dial tone)
- Extremely lightweight (small footprint)
- Support for multiple qualities of service (including guaranteed "at-least-once" delivery with [NATS Streaming](/documentation/streaming/nats-streaming-intro/))
- Support for various messaging models and use cases (flexible)

## NATS use cases

NATS is a simple yet powerful messaging system designed to natively support modern cloud architectures. Because complexity does not scale, NATS is designed to be easy to use and implement, while offering multiple qualities of service.

Some of the use cases and requirements that are ideal for NATS include:

- **High throughput message fanout** - a small number of data producers (publishers) need to frequently send data to a much larger group of consumers (subscribers), many of whom share common interest in specific data sets or categories (subjects)
- **Addressing, discovery** - sending data to specific application instances, devices, or users, or discovering all application instances/devices/users that are connected to your infrastructure. 
- **Command and control (control plane)** - sending commands to running applications/devices and receiving status back from applications/devices, e.g. SCADA, satellite telemetry, IOT.
- **Load balancing** - your application(s) produces a large volume of work items or requests and you would like to use a dynamically scalable pool of worker application instances to ensure you're meeting SLAs or other performance targets.
- **N-way scalability** - you'd like your communication infrastructure to take maximum advantage of Go's highly efficient concurrency/scheduling mechanisms to enhance horizontal and vertical scalability regardless of environment.
- **Location transparency** - your applications need to scale to a very high number of instances spread out geographically, and you can't afford the fragility of tightly coupling your applications with detailed, specific endpoint-configuration information about where other applications are, and what type of data they are producing or consuming. 
- **Fault tolerance** - your application needs to be highly resilient to network or other outages that may be beyond your control, and you need the underlying application data communication to seamlessly recover from connectivity outages 

With [NATS Streaming](/documentation/streaming/nats-streaming-intro/), a data streaming service for NATS, additional use cases include:

- Event streaming with replay from specific time or sequence (or relevant offset)
- Durable subscriptions for transient clients  
- Persistent/guaranteed message delivery

## NATS messaging models

NATS supports various messaging models, including:

- [Publish Subscribe](/documentation/concepts/nats-pub-sub/)
- [Request Reply](/documentation/concepts/nats-req-rep/)
- [Queueing](/documentation/concepts/nats-queueing/)

## NATS features

NATS provides the following unique features:

- [Pure pub-sub](/documentation/server/gnatsd-intro/)
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
- Multiple qualities of service (QoS)
    - At-most-once delivery (TCP level reliability) - NATS delivers messages to immediately eligible subscribers but does not persist the messages.
    - At-least-once delivery (via [NATS Streaming](/documentation/streaming/nats-streaming-intro/)) - Messages persisted until delivery to subscribers has been confirmed, or timeout expires, or storage exhausted.
- Durable subscriptions (via [NATS Streaming](/documentation/streaming/nats-streaming-intro/))
    - Subscription delivery state is maintained so that durable subscriptions may pick up where they left off during a previous session.
- Event streaming service (via [NATS Streaming](/documentation/streaming/nats-streaming-intro/))
    - Messages may be persisted to memory, file, or other secondary storage for later replay by time, sequence number, or relative offset.
- Last/Initial value caching (via [NATS Streaming](/documentation/streaming/nats-streaming-intro/))
    - Subscription delivery can begin with the most recently published message for a subscription.

## NATS FAQs

See our [FAQ page](/documentation/faq).
