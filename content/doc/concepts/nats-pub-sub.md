+++
date = "2015-09-27"
title = "Publish Subscribe"
category = "concepts"
[menu.main]
  name = "Publish Subscribe"
  weight = 2
  identifier = "concepts-nats-pub-sub-1"
  parent = "Concepts and Architecture"
+++

# NATS Publish Subscribe

NATS implements a publish subscribe message distribution model. NATS publish subscribe is a one-to-many communication. A publisher sends a message on a subject. Any active subscriber listening on that subject receives the message. Subscribers can register interest in wildcard subjects.

In an asynchronous exchange, messages are delivered to the subscriber's message handler. If there is no handler, the subscription is synchronous and the client may be blocked until it can process the message.

## Qualities of Service

- **At Most Once Delivery (TCP reliability)** - In the basic NATS platform, if a subscriber is not listening on the subject (no subject match), or is not active when the message is sent, the message is not received. NATS is a fire-and-forget messaging system. If you need higher levels of service, you can either use [NATS Streaming](/documentation/streaming/nats-streaming-intro/), or build the additional reliability into your client(s) yourself.

- **At Least Once Delivery ([NATS Streaming](/documentation/streaming/nats-streaming-intro/))** - Some applications require higher levels of service and more stringent delivery guarantees, at the potential cost of lower message throughput and higher end-to-end delivery latency. These applications rely on the underlying messaging transport to ensure that messages are delivered to subscribers irrespective of network outages or whether or not a subscriber is offline at a particular instant in time.



![drawing](/img/documentation/nats-pub-sub.png)
