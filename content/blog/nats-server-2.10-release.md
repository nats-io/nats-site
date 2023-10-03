+++
date = "2023-10-03"
draft = false
title = "NATS Server 2.10 Release"
author = "Byron Ruth"
categories = ["Engineering"]
tags = ["NATS", "Release"]
+++

It’s finally here! 🤩 The NATS team is thrilled to announce the 2.10 release of the NATS Server!

We want to thank everyone who [contributed](https://nats.io/contributing/) through discussions, raising issues, code contribution and testing early versions. ❤️

## The journey to 2.10

Before diving into 2.10 itself, let’s reflect on the journey leading up to this release and why it is significant.

It has been just over **a year** since the [2.9.x series started](https://nats.io/blog/nats-server-29-release/) and a record **22 patch releases** have landed since then. This is the result of a significant amount of investment by the [Synadia](https://synadia.com) team into NATS testing and quality assurance over the past year which has accelerated NATS’ maturity and stability due to dedicated effort in engineering, testing and QA.

These efforts were briefly mentioned in the [2.9.15 announcement post](https://nats.io/blog/nats-server-2.9.15-release/) where we highlighted _quality engineering_ methods such as:

- burn-in testing to identify memory leaks
- fault injection to identify recovery issues
- stress testing to identify performance regressions

These methods are being applied against a spectrum of real-world topologies and workloads, primarily derived from Synadia customer experiences.

Reviewing the entire 2.9.x series to date, of the net 32.7k lines of Go source code added, 76% of them were for tests and benchmarks. For the 2.10.0 release, of the net 20.8k lines of Go source code added, 62% are tests and benchmarks.

Given the set of tests, the current code coverage is at 85%, up from 68% a year ago.

These metrics are notable, but they only apply to the unit tests within the [NATS repo](https://github.com/nats-io/nats-server) and do not represent the additional distributed workloads Synadia is testing across cloud VMs, Kubernetes, and edge devices.

These new methods and tools used to improve the 2.9.x series were applied during the entire 2.10 development cycle and have improved the rate at which we can spot and fix issues, and leveraged to improve performance.

## Laying the next foundation

When planning for 2.10 there were two forcing functions at play:

- Surface-level features leveraged by developers or system operators
- Foundational changes that enable the next generation of use cases

Given the use cases that we have observed, constantly pushing the boundaries of initial designs or anticipated scale, our goal is for every release of NATS to adapt gracefully and stay ahead of the demand.

With that in mind, we had three main areas of focus for 2.10: predictability, scalability and extensibility.

### Predictability

It’s important that NATS can provide a consistent level of service, in terms of throughput, latency and availability, even as environmental factors change around it. One area of focus in the 2.10 release has been on stream publish latencies with the goal of decreasing variance due to variables of the stream like size or configuration.

With the new filestore changes, including reduced lock contention in other parts of the codebase, we have been able to reduce and stabilize the P99 stream publish times considerably. Not only does this reduce periodic backpressure in publishing applications, but it also means that much of the observable jitter has been smoothed out.

The new filestore changes are also critical in reducing the amount of time it takes for a stream to be recovered from disk at startup, no longer requiring a linear scan of all message blocks and no longer needing to perform as many expensive cryptographic operations on encrypted streams.

The net result is that large or encrypted streams that would previously take many seconds or minutes to recover at startup will now typically take less than a second to recover. Assets recover quicker, thus making the collective restart times of a cluster significantly faster.

### Scalability

A unique characteristic of NATS is its ability to cluster and scale in arbitrary ways. Unlike traditional clustered systems that are limited to single region deployments, and in rare cases, cross-, but near-region deployments, a single NATS system can span the entire globe and extend out to edge locations, whether they are fixed or mobile.

That said, the current clustering mechanism relies on a single TCP connection between each pair of servers.

Given this degree of flexibility for clustering and the need to optimize latency and bandwidth, four key observations motivated the new design.

The first observation was that the system account handles all Raft traffic, system events, etc. that does not need to be interleaved with application-defined traffic.

The second observation was that many NATS deployments leverage the native multi-tenancy feature, therefore having many accounts corresponding to their own customers or business units within their organization. Shuttling all of the messages across accounts over a single TCP connection could become a bottleneck.

Third, some accounts are more active than others, so it would be ideal if these accounts could be segregated from the others.

Finally, the fourth observation was that clusters continue to grow in size and are _stretched_ across multiple regions and/or providers where the latencies may vary.

The new cluster [routes][routes] implementation attempts to address these new requirements. By default, 2.10 establishes a dedicated route for the _system account_ and a pool of routes to share across all application-specific accounts.

There is an opt-in ability to _pin_ one or more accounts which will result in a dedicated route being created for all traffic produced by that account.

The final enhancement addresses excessive bandwidth usage over more latent connections by supporting various modes of compression, including a form of _auto-compression_ which dynamically changes the compression ratio based on the latency between a pair of servers in the cluster.

The best part about this feature is that nothing needs to be configured upfront. The 2.10 defaults should immediately show gains for NATS deployments having any of the above characteristics.

[routes]: https://docs.nats.io/running-a-nats-service/configuration/clustering/v2_routes

### Extensibility

The original concept of extensibility with NATS was the [leafnode](https://docs.nats.io/running-a-nats-service/configuration/leafnodes). The ability to spin up a new server anywhere, extending an existing NATS system, such as [NGS](https://synadia.com/ngs), out to arbitrary edge locations and edge.

However, 2.10 brings a new extension point that integrates directly into a core layer of NATS: authentication and authorization.

The new [Auth Callout][auth-callout] feature provides a way to integrate with existing identity and access management (IAM) providers. The extension point is implemented as a NATS service which handles the authentication and access control bits when clients connect to NATS.

This feature is targeted to users preferring to centralize IAM, and may not be relevant to you. However, this extension point laid a foundational pattern for new extension points being planned in future releases.

[auth-callout]: https://docs.nats.io/running-a-nats-service/configuration/securing_nats/auth_callout

## Conclusion

With this next layer of foundation, NATS 2.10 not only enables new use cases, but it will continue to scale and adapt with organizational needs while having predictable performance.

To get started with 2.10, check out the [upgrade guide][upgrade-guide] which summarizes all of the changes with reference to documentation pages that are new or have been updated.

Also, be sure to watch or listen to episode 6 of NATS.fm: [The journey and features of the NATS.io 2.10 release](https://youtu.be/9J4pRzHSc2k) for a deeper dive into the above topics with two NATS maintainers, [Neil Twigg](https://www.linkedin.com/in/neilalexanderr/) and [Tomasz Pietrek](https://www.linkedin.com/in/tomasz-pietrek/).

[upgrade-guide]: https://docs.nats.io/release-notes/whats_new/whats_new_210

## About the Author

[Byron Ruth](https://www.linkedin.com/in/byron-ruth/) is the Director of Developer Relations at [Synadia](https://synadia.com), a NATS release manager, and the co-host of the [NATS.fm](http://nats.fm) podcast.
