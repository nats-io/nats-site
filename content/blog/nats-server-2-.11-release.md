+++
date = "2025-03-20"
draft = false
title = "NATS Server 2.11 Release"
author = "Tomasz Pietrek"
categories = ["Engineering"]
tags = ["NATS", "Release"]
+++


We are thrilled to announce that NATS Server 2.11 is finally here!

We want to extend a heartfelt thank you to everyone who contributed through
discussions, issue reporting, code contributions, and testing early versions. ❤️

# A Long Journey to 2.11

The 2.10.x series was our longest yet, having currently reached 26 patch
releases. Throughout this extended period, our ongoing commitment to testing
and quality assurance delivered excellent results, making 2.10.26 the most
stable and reliable release to date.

Thanks to our on-going partnership with [Antithesis](https://antithesis.com),
and significant time and resources invested in our internal testing
infrastructure with numerous chaos tests running nightly, we were able to
effectively identify and resolve bugs and rare issues—those one-in-a-million
occurrences—that are typically very difficult to reproduce under normal
conditions. You can read more about it in [Antithesis blog
post](https://antithesis.com/blog/2025/synadia/)

Additionally, we've increased our focus on documenting the [Architecture and
Design](https://github.com/nats-io/nats-architecture-and-design) of new
features.

These enhancements significantly extended our release cycle, but we firmly
believe the extra effort was worthwhile.

# What's New in 2.11

The latest release brings several important features requested by our customers
and the community. While we won't cover every change here, we'll highlight the
most impactful ones:

## Single Message TTL

[Design document](https://github.com/nats-io/nats-architecture-and-design/blob/main/adr/ADR-43.md)

This highly anticipated feature allows users to set a TTL for individual
messages.

It also enables receiving Delete Markers on Stream for messages that reached
`MaxAge`. This is a big step in improving our Key Value Stores by being able to
get notifications about expired keys and will be adopted by our clients in the
near future.

## Consumer Pinning and Overflow

[Design document](https://github.com/nats-io/nats-architecture-and-design/blob/main/adr/ADR-42.md)

Another frequently requested feature, built on top of the new `Consumer
Priority Groups`, which we plan to expand further in future releases. For now,
users can leverage two powerful options:

### Pinning a Consumer to a Specific Client

When you want only one client or application to receive messages from a
consumer without sacrificing High Availability, consumer pinning solves this
elegantly. It ensures only one client actively receives messages while others
remain in standby mode. If the active client disconnects or encounters an
issue, a standby client seamlessly takes over.

### Overflow

It's often beneficial to prioritize message consumption by clients local to a
consumer's cluster node—whether due to latency (RTT) concerns or cost
efficiency related to cross-AZ or cross-region traffic. However, when local
clients become overloaded, the Overflow feature allows messages to spill over
to remote clients. Users can configure a threshold based on pending
acknowledgments or messages, activating overflow handling automatically when
necessary.

## Consumer Pause

Operators and developers occasionally need to temporarily halt message
consumption—for maintenance, debugging, or other reasons. Consumer Pause allows
pausing the delivery of messages to any client until a specified deadline.

## Distributed Message Tracing

[Design document](https://github.com/nats-io/nats-architecture-and-design/blob/main/adr/ADR-41.md)

Tracing in distributed systems is essential yet notoriously complex. NATS
Distributed Message Tracing simplifies this process significantly. By
specifying a simple header in messages, you can now trace messages throughout
your entire NATS topology—including gateways, leafnodes, imports and exports —
providing invaluable insights, especially within complex cluster and
supercluster arrangements.

## Multi Message Get

[Design document](https://github.com/nats-io/nats-architecture-and-design/blob/main/adr/ADR-31.md)

Since NATS Server 2.8, retrieving specific messages from streams using various
filters has been a foundational feature, notably underpinning our KV stores.
The new 2.11 release expands this capability, enabling batch retrieval of
messages. This offers a vastly more efficient approach to processing streams
without the overhead of creating dedicated consumers or fetching messages
individually.

# Summary

NATS Server 2.11 includes numerous additional features and enhancements beyond
those outlined here. For a complete overview, please consult the full [Changelog](https://github.com/nats-io/nats-server/releases/tag/v2.11.0).

