+++
date = "2026-09-17"
draft = false
title = "NATS Server 2.15 Release"
author = "Maurice van Veen, Neil Twigg, Daniele Sciascia"
categories = ["Engineering"]
tags = ["NATS", "Release"]
+++

Previous NATS Server releases, like 2.12 in September of last year and 2.14 in April of this year, focused primarily on the addition of new and exciting features: atomic & fast batch publishing, counters, schedules, etc. The reliability of the server has been gradually increasing throughout as well, with better error handling and the squashing of tons of bugs, but it otherwise was mostly work performed in the background.

This release largely forgoes new features and instead focuses entirely on reliability and improving operations, including fully reworking how scales, moves, and peer-removes work, as well as improving stream backups, stream source recreate detection, and higher performance when using `sync: always` for replicated streams. While we won't cover every change here, we'll highlight the most impactful ones.

## Desired state metalayer

[Design document](https://github.com/nats-io/nats-architecture-and-design/blob/main/adr/ADR-62.md)

NATS Server 2.15 completely reworks what happens when scaling or moving streams and consumers, as well as how peer additions and removals are handled, making them all significantly more reliable. The server now implements a complete desired state reconciliation loop, where peer membership changes are handled by the asset leaders and include extra logic to ensure that peers are added and removed from the peer set only when it is safe to do so. This logic also considers data replication and catchup state, ensuring high availability throughout the scale/move.

A NATS system consists of three “layers”: the meta layer, streams and consumers. Each layer functions independently under their own peer sets, which allows streams and consumers to continue to function even if there is no quorum on the meta layer (i.e. when no stream or consumer creates, updates or deletes can be performed).

The meta layer has previously been, and still is, the place where decisions are made about on which servers any given stream and consumer can be hosted. However, previously the responsibilities of managing the stream and consumer peers (which servers host the asset) were shared between the meta layer and the stream/consumer layer. When scaling up, scaling down or moving an asset, the interaction between these layers could result in temporary disagreements about the peer set in the best case, and potentially lost data in the worst case, typically when the system is already running in a degraded state. This wouldn’t happen for any scale or move, but the chances of it being able to happen in the first place was not acceptable to us, so we have prioritised fixing it within this development cycle.

In NATS Server 2.15 the meta layer takes on a new approach where it tracks the "desired state", suggesting which changes to make, but it is the stream and consumer layers that are responsible for driving those changes to land on the desired state. This comes with many benefits, not just fixing a number of these issues mentioned prior, but ensures all transitions are safe single steps, that availability is always preserved and, at worst, the converging just takes a bit more time (for example if scale up is blocked on nodes coming online first).

## Stream backup and restore v2

[Design document](https://github.com/nats-io/nats-architecture-and-design/blob/main/adr/ADR-63.md)

Being able to backup and restore information in a system is a core maintenance operation. In the past, a snapshot of a stream was effectively a compressed copy of the on-disk format, but this presented some challenges, including but not limited to difficulty in being able to inspect or edit the contents of the backup offline.

The new backup format modifies this approach by streaming messages out of the stream one by one and packing them into a simple per-message format. Not only can this be understood by the NATS CLI, but it also restores cleanly back into the server in a compacted and efficient way. The NATS CLI gains the ability to modify or filter backups, such as with subject filters, sequence ranges, modifying or excluding headers, matching time ranges or even full backup obfuscation (which anonymises subjects, headers and message payloads while retaining the shape of the data, useful for porting data across to development/staging environments).

A further benefit to the new backup mechanism is that it no longer requires an exclusive lock over the stream to take a backup. That is, new publishes can be accepted into the stream while a backup is taking place concurrently, reducing application impact and downtime.

## Stream sources recreation & indexing

Stream sourcing can be used to asynchronously replicate data from one stream into another, for example from the edge to the cloud through a leafnode connection. The stream performing the sourcing tracks the highest sourced sequence and ensures the messages are sourced in order with no duplicates. However, what would happen if you would delete and recreate the stream that’s being sourced?

Previously the stream performing the sourcing would not source any new messages until enough messages had been published into the recreated stream to exceed the highest sourced sequence. Starting in NATS Server 2.15, the server keeps an index that persists the highest sourced sequence for a particular source, as well as when the stream being sourced was created. This allows the server to detect that a sourced stream was recreated, automatically restarting sourcing of the new messages from the correct sequence number.

Additionally, this index is used to prevent expensive backward scans (for example during leader changes) to find out this highest sourced sequence, reducing CPU usage, and the highest persisted sequence for a given source is now also exposed through stream info.

## Sync performance changes for replicated streams

By default the server uses a configurable 2 minute sync interval, allowing for both lower latency and higher throughput, which assumes a system is deployed across failure domains (like when using different availability zones). For single-node edge sites using a battery or otherwise unreliable power source, you’d usually configure `sync: always`, which ensures that every single message is first synced to disk before receiving the publish acknowledgement. In this case a power loss event would not lose such a message, but the trade-off for this safety is lower publish throughput. Previously, this option had poor performance when used for replicated systems and streams, since the Raft log would sync for every batch of messages, and then when storing the message in the stream it would also sync for every individual message.

Starting from NATS Server 2.15 we combine two improvements to increase performance: more aggressive batching at the Raft layer and avoid per-message syncing of the stream since the Raft layer guarantees durability. Given these changes we’ve performed benchmarks on 3 AWS `c5.xlarge` instances, spread across availability zones. We’ve observed 10% higher throughput in general with slightly tighter tail latency, as well as more than two orders of magnitude more throughput when using `sync: always` with replicated streams. Turning the previous hundreds of messages per second into the many tens of thousands of messages per second while also cutting tail latency by more than 40%.

## Streams now have a default limit of 1000 consumers

A default limit is added to prevent unbounded consumer creation on a stream. This protects users, and the system, from accidentally adding consumers without limits which can have impact on not just the nodes that host the stream and consumers, but the system as a whole as each stream and consumer that’s assigned is known by all servers.

NATS Server 2.15 adds an explicitly low-enough default limit to allow users to design their applications up front in a way to use consumers more efficiently in general, as well as increasing awareness of there being limits as well as how to explicitly set them. For example, the default only applies if there are no explicit limits set, which can be done by setting `max_consumers` on the stream config or in account limits. This allows you to have a safe lowerbound, i.e. the default, and configure it to be lower or higher on a per stream/account basis.

The default limit can be adjusted by specifying the `default_max_consumers` setting in the server config. Alternatively, it can be set to `-1` meaning ‘unlimited’, to return back to pre-2.15 behavior. Real-world experience has led us to introduce this default limit, so please be conscious when selecting or disabling explicit limits.

```
jetstream {
  limits {
    default_max_consumers: 1000
  }
}
```

## Summary

NATS Server 2.15 includes numerous additional reliability enhancements beyond those outlined here. For a complete overview, please consult the full [release notes](https://github.com/nats-io/nats-server/releases/tag/v2.15.0). We have also published an [upgrade/migration guide](https://docs.nats.io/release-notes/upgrade-to-2.15) which includes additional considerations for upgrading an environment to 2.15.
