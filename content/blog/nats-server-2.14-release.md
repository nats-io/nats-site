+++
date = "2026-04-30"
draft = false
title = "NATS Server 2.14 Release"
author = "Maurice van Veen, Neil Twigg, Daniele Sciascia"
categories = ["Engineering"]
tags = ["NATS", "Release"]
+++

When we released NATS Server 2.12 back in September, we reflected on the need for shorter and more routine release cycles. While we slipped slightly beyond the intended six months due to increased activity on AI security reviews and disclosures, we're happy to announce the release of NATS Server 2.14 today.

This release brings some new and welcome improvements, including first-class support for high-throughput publishing, extended server-side message scheduling and correctness fixes for sourcing and mirroring with Interest and WorkQueue streams. While we won't cover every change here, we'll highlight the most impactful ones.

## Fast batch publish

[Design document](https://github.com/nats-io/nats-architecture-and-design/blob/main/adr/ADR-50.md#fast-ingest-batch-publishing)

NATS Server 2.12 introduced atomic batch publish, where N messages are staged, all consistency checks are evaluated, and the entire batch either persists or is rejected as a single atomic unit. This is ideal when correctness demands all-or-nothing semantics, but the staging requirement imposes practical limits on batch size.

Fast batch publish is a new mode designed for throughput and flow control. Messages are persisted continuously as they arrive, per-message consistency checks run inline (just as they would for individual async publishes), and the server guarantees ordering by tracking the batch sequence and reporting a gap if one is detected. The batch size is effectively unbounded. A single acknowledgement reports how many of the N messages were actually persisted, and multiple acknowledgements can be in flight simultaneously so publishers can pipeline batches for better latency.

Where atomic batch rejects the entire batch if any message fails a check (including deduplication), fast batch behaves like traditional async publish: passing messages persist, duplicates are silently skipped, and the batch stops at the first hard failure. However, this is configurable. You can either require a hard failure when a gap is detected or a consistency check fails (with `gap:fail`), which guarantees ordered publishing and provides flow control. Or if you primarily need flow-controlled publishing and can tolerate gaps, you can use `gap:ok`  which will report if gaps are detected. Errors due to consistency checks failing (which would result in a gap) are similarly reported but allowed without failing the batch. Both allow you to go fast while being flow-controlled, but you can decide whether you need strict ordering or lossy publishing.

Fast batch publishing, depending on settings used, can almost double the throughput when compared to async publish. Additionally, if two clients using object store today (which uses async publish underneath) try to both upload a 1GB file as fast as possible, this quickly breaks due to the lack of proper flow control. With fast batch publishing, you can easily reach 100s of concurrent publishers into the same stream, still at a high combined speed but where the individual publishers are flow controlled.

## Recurring schedules

[Design document](https://github.com/nats-io/nats-architecture-and-design/blob/main/adr/ADR-51.md#cron-like-schedules)

NATS Server 2.12 introduced delayed message scheduling: publish a message now and have it delivered at a future timestamp. The new release extends this with recurring schedules: a message can be delivered on a fixed interval (for example, every five seconds with `@every 5s`) or on a cron-style schedule (hourly, daily, or any standard cron expression).

Recurring schedules move periodic work into the server. Instead of running a client-side timer that publishes on a loop, you publish once with a schedule attached and the server handles repetition. This simplifies architectures where periodic triggers drive downstream processing, and it eliminates the need to keep a dedicated publisher running and connected. This can also be combined with a TTL to repeatedly schedule messages until the TTL of the schedule is reached, at which point it’ll stop scheduling new messages.

## Scheduled subject sampling

[Design document](https://github.com/nats-io/nats-architecture-and-design/blob/main/adr/ADR-51.md#subject-sampling)

A related extension to schedules, scheduled subject sampling allows a schedule to read the latest value from a source subject each time it fires and publish it to a target subject. The message body is not a static payload, it’s a live sample of what the source subject holds at that moment, but if there is no message for the source subject it falls back to the content of the schedule itself.

The primary use case is server-side downsampling. Consider a sensor publishing readings every second on an edge node. A cloud consumer only needs one sample every five minutes. Rather than shipping every message to the cloud and filtering there, you can configure a scheduled downsampling to read the latest sensor value every five minutes which you can publish out to another stream back in the cloud.

## Reliable WorkQueue and Interest mirroring/sourcing

[Design document](https://github.com/nats-io/nats-architecture-and-design/blob/main/adr/ADR-60.md)

Prior to 2.14, stream mirrors and sources always used internal ephemeral consumers to perform asynchronous replication. However, the ephemeral nature of these consumers meant that there were some undesirable side-effects when sourcing from a WorkQueue or Interest retention stream if the sourcing temporarily stopped, for example due to a server restarting or being down for an extended period. The primary example would be using a leaf node to source from an Interest stream: if that leaf node is down for a week then the interest over those sourced subjects would be lost and that data would be deleted automatically, meaning that it does not get replicated when the leaf comes back online.

Version 2.14 resolves this by automatically switching the ephemeral consumer to a durable one, when sourcing from a WorkQueue or Interest stream. The durable consumer is visible in consumer listings, carries metadata showing the source domain, account, and stream, and holds state across disconnects. Importantly, in the same scenario of a leaf node going down for a week, because of this durable consumer, once the leaf node comes up again this data will still be reliably sourced to the other side.

Normally the sourcing consumer is created on the side where the stream that mirrors or sources is defined. However, for security-sensitive deployments this could be problematic, especially if you’re not in control of that side. You can now also "bring your own consumer" to perform the stream sourcing or mirroring. This allows you to pre-create the consumer with the settings you allow, without the other side being able to modify them.

## Leafnode remote config reload

Leaf node remotes can now be added and removed via a configuration reload, without requiring a server restart. This simplifies operational workflows in hub-and-spoke topologies where leaf node connectivity changes over time.

## Deduplication changes when using stream sourcing

Streams with sources required a deduplication window of 100ms at minimum, even if deduplication wasn’t required or preferred. Deduplication can now be disabled entirely as long as the stream is either a mirror or contains stream sources.

Additionally, when sourcing multiple streams into one, each using overlapping deduplication IDs, this would result in the sourcing to stall until the deduplication ID ages out on the stream that it was sourced into. Starting from version 2.14, a stream containing sources will now also perform deduplication: when sourcing multiple streams into one, the stream that’s sourced into can deduplicate them. If you still only need an exact combined copy of all sources, you’ll need to disable deduplication entirely on the stream that contains these sources.

## Atomic batch publish: EOB commit support

Usually an atomic batch is committed by sending one final message that commits the whole batch including this final message. With EOB (End of Batch) support, you can commit a batch without persisting the final (EOB) message. This allows you to atomically publish a stream of messages even if you don’t know beforehand when this stream ends. This is also supported when using the new fast batch publish.

## Summary

NATS Server 2.14 includes numerous additional features and enhancements beyond those outlined here. For a complete overview, please consult the full [release notes](https://github.com/nats-io/nats-server/releases/tag/v2.14.0). We have also published an [upgrade/migration guide](https://docs.nats.io/release-notes/whats_new/whats_new_214) which includes additional considerations for upgrading an environment to 2.14.
