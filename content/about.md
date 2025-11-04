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

COPY STILL WIP

NATS stands out as the ideal choice for modern distributed systems for several key reasons:

### Simple
NATS is incredibly easy to deploy, manage, and use. With a single binary and simple configuration, you can have a production-ready messaging system running in minutes. The client APIs are intuitive and consistent across all supported languages.

### Secure
NATS provides zero-trust security with decentralized authentication and authorization. With built-in support for TLS, user/password, token, and NKeys authentication, along with fine-grained subject-level permissions, you can secure your entire system without complex external dependencies.

### Performant
Process millions of messages per second per server with minimal latency and overhead. NATS is written in Go and optimized for performance, making it one of the fastest messaging systems available. Save money by minimizing cloud costs with reduced compute and network usage.

### Resilient
NATS self-heals and can scale up, down, or handle topology changes anytime with zero downtime to your system. Built-in clustering provides automatic failover, and clients require zero awareness of NATS topology, allowing you to future-proof your system to meet your needs of today and tomorrow.

---

## Where NATS Thrives {#where-nats-thrives}

COPY STILL WIP

NATS excels in a wide variety of use cases and deployment scenarios:

### Microservices
Build scalable, distributed service architectures with NATS at the core. NATS provides the foundation for service discovery, request-reply patterns, and load balancing, making it easy to build and evolve microservices-based applications.

### Edge Computing
Connect devices, edge, cloud, and hybrid deployments seamlessly. With flexible deployment models using clusters, superclusters, and leaf nodes, NATS optimizes communications for your unique deployment. The NATS Adaptive Edge Architecture allows for a perfect fit for unique needs across diverse environments.

### Event Streaming
Build real-time data pipelines and event-driven applications with JetStream. NATS provides durable streaming, message replay, and exactly-once semantics, making it ideal for event sourcing, CQRS, and stream processing use cases.

### IoT & Mobile
The lightweight NATS protocol is perfect for constrained environments. With minimal overhead and efficient wire protocol, NATS works seamlessly on IoT devices, mobile applications, and edge deployments where resources are limited.

### Additional Use Cases
- **Financial Services**: High-frequency trading, market data distribution
- **Telecommunications**: Network operations, real-time monitoring
- **Gaming**: Player matchmaking, real-time game state synchronization
- **Manufacturing**: Industrial IoT, factory automation
- **Healthcare**: Medical device integration, real-time patient monitoring

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

---

## Resources

In addition to our official [Documentation](https://docs.nats.io), the following resources are just a few available to learn, share, and grow your knowledge of NATS.
If you would like to share your experience with NATS and would like help publishing you can [contact us](mailto:info@nats.io) or if you have an article published, tag us on [Twitter](https://twitter.com/nats_io) or ping us on [Slack](https://slack.nats.io).

- [NATS News](https://www.synadia.com/newsletter?utm_source=nats_io&utm_medium=nats) | [Byron Ruth](https://www.linkedin.com/in/byron-ruth/) has created a monthly NATS newsletter combining announcements, Slack Q&A, and updates. Additional featured NATS articles are also available.
- [NATS by Example](https://natsbyexample.com) | Learn NATS by Example with this evolving collection of runnable, cross-client reference examples for NATS.
- [NATS.fm Podcast](http://nats.fm/) | Join us as we talk all things NATS.io on everything from the concepts & patterns, to use cases and real world outcomes.
- [SlideShare](https://www.slideshare.net/nats_io/presentations) | Presentation slides from MeetUps, conferences and webinars.
- [YouTube](https://www.youtube.com/c/nats_messaging/videos) | NATS informational and educational video collection.


{{< resources >}}
