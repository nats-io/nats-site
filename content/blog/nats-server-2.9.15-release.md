+++
date = "2023-03-03"
draft = false
title = "NATS Server 2.9.15 Release"
author = "Byron Ruth"
categories = ["Engineering"]
tags = ["NATS", "Testing", "Quality"]
+++

Normally, the NATS maintainers do not publish a dedicated announcement for a patch release, but the [2.9.15 release](https://github.com/nats-io/nats-server/releases/tag/v2.9.15) of the NATS server has several significant stability and performance improvements worth highlighting, all driven by our new quality engineering process! 🥳

What does a patch release mean to NATS? And what are these new quality engineering processes?

## Release management

At the beginning of 2023, the NATS maintainers drafted an end-to-end “release management” document which includes the policies and procedures used for each NATS server release, everything from initial scoping to communication of the release itself.

This effort was driven largely by acknowledging the ever-increasing number of critical, high-scale production NATS deployments our end-users rely on.

For how basic it may sound, one such policy is adherence to the SemVer semantics and explicitly defining what a patch, minor, and major release means for NATS.

Concretely, a NATS server patch release is allowed to have the following types of changes assuming they maintain functional compatibility with all existing clients.

- Bug fixes
- Security patches
- Performance improvements
- Code documentation

## Quality engineering

Quality engineering encompasses the spectrum of burn-in testing and quality assurance practices. Most notably, the testing process has evolved significantly over the past couple months to introduce complex topologies, fault injection, and stress testing.

To reiterate, this release is significant as it is the first patch release where many of these new techniques have been applied.

## Get on with it!

So what are all of these great changes??

Historically we would point you to the [release notes on GitHub](https://github.com/nats-io/nats-server/releases/tag/v2.9.15), but going forward, as part of improving our "release communication," we will focus on observed behaviors first and link them to the relevant code changes.

## 👻 Ghost consumers

There were a handful of inbound issues where consumers were being "cleaned up" without expectation or active intention. Cases included:

- Durable consumers being deleted prior to an activity threshold being reached
- Ephemeral consumers deleted while there was still an active subscription
- Durable consumers being deleted on hard restart even when they are recoverable

The two root causes were over-active timers for tracking activity thresholds and improperly propagating errors to the JetStream "meta-layer" which handles the lifecycle of streams and consumers.

The *ghost factor* comes from the fact that not all replicas would report the existence or deletion of a given consumer. NATS CLI consumer reports may list a consumer, but the consumer info would fail to report.

A lot of fixes and improvements have been made to managing consumer lifecycle (this section) and accessing their state (see the section below 👇)!

**Relevant PRs**

- [#3881](https://github.com/nats-io/nats-server/pull/3881)
- [#3884](https://github.com/nats-io/nats-server/pull/3884)
- [#3904](https://github.com/nats-io/nats-server/pull/3904)

## 🐢 "Slow consumers"

The term "slow consumer" actually [means something](https://docs.nats.io/running-a-nats-service/nats_admin/slow_consumers) concrete in the NATS parlance. However, it pre-dates JetStream and does not actually indicate there is an issue with a [Consumer](https://docs.nats.io/nats-concepts/jetstream/consumers). It refers to a client connection with a subscription that can't keep up with messages being _pushed_ to it. Essentially the subscription buffer is full and the client is yelling at the server "I can't handle any more!". At this point, the subscription is marked as a slow consumer.

Although this context is useful, that is not what we are talking about here 😅. In this case, we literally mean the JetStream consumer is responding slowly to requests about it's state.

The primary culprit was `NumPending` which indicates the number of messages in the stream available to be processed. This was being accessed constantly in various monitoring environments as well as being a pattern in application code for checking how far behind a given consumer is.

The previous design of this `NumPending` calculation was fairly expensive. With application code and monitoring infrastructure attempting to get the latest count every few seconds (for 100s or 1000s of consumers) resulted a lot of overhead and consumer requests timing out.

This release brings changes that optimize this calculation both in terms of *when* and *how* the count is calculated. In addition, other general optimizations around aggregating the consumer state have been made.

**Relevant PRs**

- [#3877](https://github.com/nats-io/nats-server/pull/3877)
- [#3880](https://github.com/nats-io/nats-server/pull/3880)
- [#3892](https://github.com/nats-io/nats-server/pull/3892)
- [#3901](https://github.com/nats-io/nats-server/pull/3901)

## 💾 Idle streams with ever-growing disk usage

A bug in how pull consumer state was being managed resulted in not properly tracking when old state could be cleaned up. With many active consumers, the disk usage could accrue quickly, filling up storage.

The root cause was that the snapshot and compact processes of pull consumer state was triggered as part of the corresponding stream processes. Of course, this would be problematic if the stream is idle!

The fix now decouples these processes so pull consumers will properly snapshot and compact even if there are no new messages in the stream.

**Relevant PRs**

- [#3898](https://github.com/nats-io/nats-server/pull/3898)

## 👷 Hard failures and corruption

Distributed systems are hard, even in the "happy path". However, the real challenge is dealing with abrupt server failures and data corruption. This release brings a plethora of fixes and optimizations for recovering Raft state when these non-ideal failures occur.

This set of fixes is a bit more in the weeds, however, the overarching focus was in more explicit management of state when failures do occur as well as improvements in the Raft implementation to recover a quorum more quickly.

**Relevant PRs**

- [#3911](https://github.com/nats-io/nats-server/pull/3911)
- [#3922](https://github.com/nats-io/nats-server/pull/3922)
- [#3934](https://github.com/nats-io/nats-server/pull/3934)

## ❤️‍🩹 Sympathy for the network

When a replica of a stream becomes unavailable for a period of time due to a network partition, server maintenance, etc. once it becomes available, it will need to “catch-up” with the leader. A related scenario is when a stream is scaled up from one replica to multiple (say three), these new replicas need the data.

Each replica signals to the leader it has stream data up to a particular sequence (zero if new) and the leader will asynchronously send all of the messages beyond that point to the replica so it can commit it locally.

For busy streams, even a small amount of time being unavailable could result in a large amount of data being sent in order to catch-up. Now consider that when a replica becomes unavailable, it is often due to an entire server in the cluster being offline. Since a server can host many replicas in the cluster, this automated catch-up process can exacerbate the effect.

All of this catch-up takes up bandwidth and, in the worst case, could completely saturate the network causing throughput of the client applications to drop. Fortunately, there is a little known configuration option on the server called `jetstream.max_outstanding_catchup` which denotes the amount of data that is allowed to be outstanding (in-flight) at any given time during this catch-up process.

The previous default value was 128MB and was chosen with the assumption that 10Gbit links (or better) would be used between servers in a cluster. As a result of user-reported issues of “slow consumers” between servers during this catch-up process and a series of I/O-heavy stress tests, the default value has been reduced to 64MB.

This reduction will be more _sympathetic_ to the network and will cause less impact on applications workloads even if many streams need to catch-up. The trade-off is that the catch-up time will take longer. This could be observed when a server comes back online and it will take more time to be considered “healthy” ensuring all local replicas have fully caught up.

That said, if your environment has 10Gbit+ links and/or have not observed “slow consumer” warnings during this catch-up phase, you are welcome to set the value back to 128MB in the server configuration.

**Relevant PRs**

- [#3922](https://github.com/nats-io/nats-server/pull/3922)

## Conclusion

The NATS team has put a tremendous amount of effort and care into this release, following our new quality engineering practices. Even if you are not observing any of the stability issues noted above, there have been many other improvements and optimizations that you will benefit from.

As always, refer to the [download page](https://nats.io/download/) for direct links to the GitHub release page and the official Docker image.

## About the Author

[Byron Ruth](https://www.linkedin.com/in/byron-ruth/) is the Director of Developer Relations at [Synadia](https://www.synadia.com?utm_source=nats_io&utm_medium=nats) and a long-time NATS user.
