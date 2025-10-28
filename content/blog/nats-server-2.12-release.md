+++
date = "2025-09-22"
draft = false
title = "NATS Server 2.12 Release"
author = "Neil Twigg & Maurice van Veen"
categories = ["Engineering"]
tags = ["NATS", "Release"]
+++

We are thrilled to announce that NATS Server 2.12 is here! 🎉

# A successful 6-month release cycle

When we released the 2.11 version of the server back in March, we mentioned in our [release blog](https://nats.io/blog/nats-server-2.11-release/#a-long-journey-to-211) that the 2.10.x series was our longest yet, having reached 26 patch releases.

With that, we have reflected on the need to be more predictable and transparent with our releases and have moved to a 6-month release cycle. This is not only important for us as maintainers, but more importantly our users for whose roadmaps may depend on new capabilities in NATS. Now, exactly 6 months later, we're releasing server version 2.12!

We're really excited to release 2.12 with so many new features that will enable new and powerful usage patterns, all of this exactly within 6 months! 💪

# What's New in 2.12

The latest release brings several important features requested by the end-user community and customers. While we won't cover every change here, we'll highlight the most impactful ones.

## Atomic batch publish

[Design document](https://github.com/nats-io/nats-architecture-and-design/blob/main/adr/ADR-50.md)

This highly anticipated feature allows users to atomically write a batch of messages into a stream.

Messages in the batch are staged, any per-message consistency checks are performed, and if all checks pass only then will the whole batch be committed.

This feature currently focuses heavily on correctness and atomicity, ensuring there can be no partially committed batches. Later iterations of this feature will put more focus on the performance aspect that batching can enable, so stay tuned!

This feature can also be used in combination with other features, like Delayed Message Scheduling and Distributed Counters discussed below.

## Delayed Message Scheduling

[Design document](https://github.com/nats-io/nats-architecture-and-design/blob/main/adr/ADR-51.md)

Another frequently requested feature is being able to schedule a message to be consumed later.

You can now schedule a message to be automatically published after a delay. Enabling various patterns where a consumer should not immediately act on a message, for example in the form of job scheduling.

The server only supports single delayed message scheduling today, but the design already includes how this could potentially be extended in the future to perform repeated message scheduling, for example with Cron-like schedules.

## Distributed Counters

[Design document](https://github.com/nats-io/nats-architecture-and-design/blob/main/adr/ADR-49.md)

Streams can now be configured to support distributed counters. Each unique subject in the stream will contain a counter value that can be incremented and decremented by any value. Counters are implemented in the server as a `big.Int`, this means there's no explicit limit to the value. A counter can be as large as is allowed to be stored in the payload of a single message.

Interestingly though, counter streams can still be mirrored and sourced! You can decide whether to create verbatim copies, or if you want to aggregate counters together when sourcing counter streams. How, and if, aggregation happens is fully configurable up to your needs. This composition is enabled by a CRDT under the covers.

## Prioritized pull consumer policy

[Design document](https://github.com/nats-io/nats-architecture-and-design/blob/main/adr/ADR-42.md#prioritized-policy)

The prior 2.11 release already added support for `Consumer Priority Groups`, allowing to pin consumers and overflowing messages to other regions. This was previously mentioned in the [release post of 2.11](https://nats.io/blog/nats-server-2.11-release/#consumer-pinning-and-overflow).

The `Overflow` policy allows to spill over messages to remote clients, however it may take too long for this overflow to happen if no local clients are pulling for messages and the overflow threshold is not reached quickly.

That's why this new `Prioritized` policy has been introduced. Still prioritizing local clients over remote clients, but immediately allowing remote clients to receive messages if no local clients are pulling for messages. This allows for fast failover, but at the potential cost of messages more easily being pulled by clients from different regions if there are insufficient clients pulling for messages that have a higher priority.

## Promoting mirrors

Stream mirrors can be used to store a copy of a stream, as well as allow data locality to receive responses to message requests faster.

Prior to 2.12 there was no way to use mirrors for failover or disaster recovery scenarios. This was due to a constraint that once a stream is a mirror, it cannot be changed. Now, the mirror configuration of a stream can be removed, allowing it to be "promoted" to the primary stream by adding the original stream subjects. However, currently, you must make sure that the previous "primary" stream is deleted before attempting to promote a mirror. There are additional improvements being evaluated to make this transition more seamless.

## Offline assets

[Design document](https://github.com/nats-io/nats-architecture-and-design/blob/main/adr/ADR-44.md#offline-assets)

> What happens if you use new 2.12 features and you downgrade to 2.11? Does the server break!?

This has been a tricky question for quite some time, and generally the advice would have been "make sure you're not using new features when downgrading" and "make sure you downgrade to a supported 2.11.x version".

However, as long as you downgrade from 2.12 to 2.11.9 or later, the server will properly recognize you're using new stream or consumer features and put the respective asset into an "offline mode". These assets still respond to info and list requests, but can't be interacted with otherwise.

More importantly, the asset's data will remain untouched, ensuring the data remains and can't be corrupted in any way if an outdated server would try and fail to understand these new features. The asset can still be deleted if required, but will otherwise remain offline until the server is upgraded to a server version that supports the feature.

This is an important step to protecting your data when performing downgrades if required.

# Summary

NATS Server 2.12 includes numerous additional features and enhancements beyond those outlined here. For a complete overview, please consult the full [release notes](https://github.com/nats-io/nats-server/releases/tag/v2.12.0). We have also published an [upgrade/migration guide](https://docs.nats.io/release-notes/whats_new/whats_new_212) which includes additional considerations for upgrading an environment to 2.12.
