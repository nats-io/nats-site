+++
title = "About NATS"
chart = true
+++

## What is NATS? {#what-is-nats}

NATS is a [high-performance](#high-performance), [lightweight](#lightweight), [open-source](#open-source) messaging system designed for building modern distributed systems, across any cloud or any arbitrary, user-defined edge.

NATS supports pub/sub, request/reply, and streaming with persistence (via JetStream), all through a single binary with minimal resource usage and sub-millisecond latency.

Official clients are available in Go, Rust, JavaScript (Node and Web), TypeScript (Deno), Python, Java, C#, C, Ruby, Elixir, and a CLI—plus 30+ community-contributed clients—making it easy to integrate across nearly any tech stack. [See all the clients.](/download#clients)

### High performance {#high-performance}
NATS uses a lightweight, single-threaded I/O loop written in Go, supports zero-copy message dispatch, and employs subject-based routing with minimal protocol overhead to deliver millions of messages per second with sub-millisecond latencies across globally distributed systems.

### Lightweight {#lightweight}
NATS is a single binary with no external dependencies, consuming minimal memory and CPU resources. The server typically uses less than 20MB of RAM, making it ideal for everything from resource-constrained edge devices to massive cloud deployments.

### Open source {#open-source}
NATS server and its clients are open source under the Apache 2.0 license, with a vibrant community and transparent development process.

## Why NATS? {#why-nats}

NATS was built on intentional design choices: location independence, many-to-many communication, and an async-first model.

These principles shape how NATS works across environments—from a single process to global systems. Core communication and data patterns emerge naturally. Pub/sub, request/reply, queueing, streaming, key-value, and object storage all operate within the same system, without extra infra or fragile abstractions.

The result: a single connective fabric that stays simple as systems scale. Apps remain decoupled, resilient, and easier to operate, while teams avoid the complexity and sprawl that come with stitching together specialized tools.

## Where NATS Thrives {#where-nats-thrives}

NATS thrives anywhere systems are distributed. Its core foundations are designed for environments with many endpoints and services—where components are dynamic, loosely coupled, and constantly changing.

NATS also excels at the edge: on low-resource devices, across fleets of vehicles, or anywhere computing moves closer to users. The same connective layer works consistently, no matter the environment.

With leaf nodes and superclusters, NATS lets teams evolve topology over time. New clouds, regions, or edge locations can be added without downtime or redesign, allowing architectures to grow organically instead of being locked into early decisions.

## Roadmap

NATS Server ships a minor release roughly every six months.

### 2.16 (target: March 2027)

| Feature | Status |
|---|---|
| **Key expiration refresh.** Extend a key's lifetime without rewriting its value. | Planned |
| **Automatic data repair.** Cluster servers restore missing or damaged data from each other. | Planned |
| **Stronger integrity checks.** Checksums on every file written to disk, so damage is caught on recovery. | Planned |
| **Steadier cluster leadership.** A server rejoining the cluster no longer forces a leader change. | Planned |
| **Lighter consumers.** Optionally skip pending-message counts to cut overhead on large streams. | Planned |
| **Incremental stream backups.** Back up a stream from a chosen message onward. | Planned |
| **Per-subject delivery limits.** Cap unacknowledged messages per subject, not just per consumer. | Under consideration |
| **Read-your-writes for key-value.** Optionally guarantee a read sees the latest write. | Under consideration |
| **Faster unreplicated writes.** Batch disk writes on single-copy streams for higher throughput. | Under consideration |

This reflects current intent. Scope may change, and items under consideration may move to a later release. The NATS maintainers set each release from community discussion, commercial users, recurring support issues, and their own direction. Share ideas on [Slack](https://slack.nats.io), in [GitHub discussions](https://github.com/nats-io/nats-server/discussions), or at [info@nats.io](mailto:info@nats.io). To try unreleased changes, see the [nightly build](/download/).

## Recent posts

{{< recent-posts >}}
