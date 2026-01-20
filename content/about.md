+++
title = "About NATS"
chart = true
+++

## What is NATS? {#what-is-nats}

NATS is a <a href="#high-performance" style="color: #27aae1; font-style: italic; text-decoration: none;">high-performance</a>, <a href="#lightweight" style="color: #27aae1; font-style: italic; text-decoration: none;">lightweight</a>, <a href="#open-source" style="color: #27aae1; font-style: italic; text-decoration: none;">open-source</a> messaging system designed for building modern distributed systems, across any cloud or any arbitrary, user-defined edge.

NATS supports pub/sub, request/reply, and streaming with persistence (via JetStream), all through a single binary with minimal resource usage and sub-millisecond latency.

Official clients are available in Go, Rust, JavaScript (Node and Web), TypeScript (Deno), Python, Java, C#, C, Ruby, Elixir, and a CLI—plus 30+ community-contributed clients—making it easy to integrate across nearly any tech stack. [See all the clients.](/download#clients)

#### <span style="color: #27aae1; font-style: italic;">High-Performance</span> {#high-performance}
NATS uses a lightweight, single-threaded I/O loop written in Go, supports zero-copy message dispatch, and employs subject-based routing with minimal protocol overhead to deliver millions of messages per second with sub-millisecond latencies across globally distributed systems.

#### <span style="color: #27aae1; font-style: italic;">Lightweight</span> {#lightweight}
NATS is a single binary with no external dependencies, consuming minimal memory and CPU resources. The server typically uses less than 20MB of RAM, making it ideal for everything from resource-constrained edge devices to massive cloud deployments.

#### <span style="color: #27aae1; font-style: italic;">Open Source</span> {#open-source}
NATS server and its clients are open source under the Apache 2.0 license, with a vibrant community and transparent development process.

---

## Why NATS? {#why-nats}

NATS was built on intentional design choices: location independence, many-to-many communication, and an async-first model.

These principles shape how NATS works across environments—from a single process to global systems. Core communication and data patterns emerge naturally. Pub/sub, request/reply, queueing, streaming, key-value, and object storage all operate within the same system, without extra infra or fragile abstractions.

The result: a single connective fabric that stays simple as systems scale. Apps remain decoupled, resilient, and easier to operate, while teams avoid the complexity and sprawl that come with stitching together specialized tools.

---

## Where NATS Thrives {#where-nats-thrives}

NATS thrives anywhere systems are distributed. Its core foundations are designed for environments with many endpoints and services—where components are dynamic, loosely coupled, and constantly changing.

NATS also excels at the edge: on low-resource devices, across fleets of vehicles, or anywhere computing moves closer to users. The same connective layer works consistently, no matter the environment.

With leaf nodes and superclusters, NATS lets teams evolve topology over time. New clouds, regions, or edge locations can be added without downtime or redesign, allowing architectures to grow organically instead of being locked into early decisions.

---

## Roadmap

Features being included in the next release are tracked on [GitHub milestones](https://github.com/nats-io/nats-server/milestones).  


The purpose of the roadmap is to communicate the known set of features and changes coming in a release. Each release contains a set of strategic and high-value changes decided by the NATS maintainers. There are several sources of input for this decision making:

- Community, driven by GitHub and Slack interest and discussions
- Customers, solicited from [Synadia's](https://www.synadia.com?utm_source=nats_io&utm_medium=nats) customer use cases
- Support, sourced from recurring challenges with existing capabilities
- Opportunity, ideated by the maintainers insight and vision

We are excited to bring these advances to the NATS community and look forward to your valuable input! Feel free to reach out on our [Slack channel](https://slack.nats.io), start a [GitHub discussion](https://github.com/nats-io/nats-server/discussions), or [email us](mailto:info@nats.io) with any questions, comments, or requests.

Nightly container image builds are available during development on Docker Hub under the [`synadia/nats-server:nightly`](https://hub.docker.com/r/synadia/nats-server) repo.


---

## Recent posts

{{< recent-posts >}}
