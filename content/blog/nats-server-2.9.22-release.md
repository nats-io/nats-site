+++
date = "2023-09-08"
draft = false
title = "NATS Server 2.9.22 Release"
author = "Byron Ruth"
categories = ["Engineering"]
tags = ["NATS", "Release"]
+++

The NATS maintainers are thrilled to announce the [2.9.22 release](https://github.com/nats-io/nats-server/releases/tag/v2.9.22)! This brings a handful of fixes and improvements leading up to the 2.10.0 release coming later this month.

We want to thank all of the people who contributed to this release through reporting issues, documentation improvements, and code contributions. As always, if you are interested in contributing, please check out [all the ways you can](https://nats.io/contributing/).

Before diving into 2.9.22, it is worth acknowledging that there have been three additional releases over the past three months since [2.9.18](https://nats.io/blog/nats-server-2.9.18-release/). Announcement posts were not written for these releases (apologies!), so notable improvements and fixes will be rolled up into this one.

The topics include:

- [Delivering stream-republished messages over MQTT](#delivering-stream-republished-messages-over-mqtt)
- [Serializing competing key-value updates](#serializing-competing-key-value-updates)
- [Interest propagation over leafnode connections](#interest-propagation-over-leafnode-connections)
- [Clustering and stream state improvements](#clustering-and-stream-state-improvements)
- [Updating to Go 1.20 out-of-cycle](#updating-to-go-120-out-of-cycle)
- [Preparing for 2.10.0](#preparing-for-2100)

For the full list of changes, check out the [GitHub releases](https://github.com/nats-io/nats-server/releases) page.

## Delivering stream-republished messages over MQTT

For the uninitiated, NATS [natively supports MQTT](https://docs.nats.io/running-a-nats-service/configuration/mqtt), enabled through [minimal configuration](https://docs.nats.io/running-a-nats-service/configuration/mqtt/mqtt_config). This makes it straightforward to drop-in NATS to replace an existing MQTT broker for clients/devices that need to use the protocol, while then taking advantage of the NATS protocol and additional capabilities.

A common question that comes up is how to get messages being published to a NATS stream to MQTT clients since MQTT doesn't have any notion of consumers. This can be achieved by configuring a stream with [RePublish](https://docs.nats.io/nats-concepts/jetstream/streams#republish).

For example, using the CLI, republish can be configured when a stream is created or edited later.

```
$ nats stream add EVENTS \
    --subjects='events.*' \
    --republish-source='>' \
    --republish-destination='mqtt.>'
```

Given a message published to `events.1`, once the stream receives and stores it, the server will immediately publish the message on `mqtt.events.1`.

Any clients that are connected at the time of publish will receive the message. For MQTT clients, setting a topic subscription such as `mqtt/events/+` would result in receiving these republished messages.

That was always the intended behavior, until it was discovered it was [not working as expected](https://github.com/nats-io/nats-server/issues/4291). In 2.9.20, the fix was added to correct this behavior since this is quite a useful pattern.

**Relevant PRs**

- [#4303](https://github.com/nats-io/nats-server/pull/4303)

## Serializing competing key-value updates

NATS key-value buckets support optimistic concurrency control for updates on a per key basis using the `update` operation which takes the key, value, and the latest known revision for that key.

As a quick example, we will create a bucket used for storing the current reading of sensors.

```
$ nats kv add sensors
```

We can perform an update on a key (`thermo.1`) with the initial value. The revision is `0` indicating the key is expected to be new (no previous revisions).

```
$ nats kv update sensors thermo.1 'temp=5' 0
temp=5
```

If we attempt to do another update with a zero revision, it will be rejected since the key exists.

```
$ nats kv update sensors thermo.1 'temp=7' 0
nats: error: nats: wrong last sequence: 1
```

Using the revision/sequence of `1` will work.

```
$ nats kv update sensors thermo.1 'temp=7' 1
temp=7
```

Internally this works by clients setting the [`Nats-Expected-Last-Subject-Sequence` header](https://docs.nats.io/nats-concepts/jetstream/headers#publish), with the provided revision, on the message being published to the stream underlying the key-value bucket.

The server will then check if the sequence matches and if it does, will accept the update, otherwise it will reject it. Since the server serializes all writes for a particular stream, there is no possibility for two concurrent updates with the same revision to _both_ be accepted.

Right? 🤔 Well almost.

A bug was discovered in an application having multiple workers attempting to perform some task and write the output to a key. The workers were operating concurrently and independently, thus multiple workers could have picked up the same task. The intention was for whichever worker finished the task first to update the corresponding value of the key in the bucket, and the slower workers’ updates would be discarded.

It turned out that this header check on the server was not pushed down into the Raft layer for replicated key-value buckets and thus, if two (or more) concurrent updates were performed on the same key, both updates could be accepted.

How bad is this? It is important to note that this behavior would only be observed if the concurrent updates occurred within the window of time it takes to perform a quorum-based write. For a cluster with data-center quality networking, this could be on the order of single-digit milliseconds. However, as the latency increases, the probability for unwanted concurrent updates increases as well.

Assuming this behavior _is_ occurring, the second consideration for "how bad" depends on whether these concurrent updates to the same key have the same value. In the case of deterministic outputs, two concurrent updates would result in duplicate writes, but observably the same value associated with the key. This duplicate write could be observed while watching the bucket, for example.

If the concurrent updates _don't_ have the same value, then the behavior essentially is last-writer-wins. If the bucket is configured to keep N historical values per key, then the first write is not lost, but would be considered an older revision. However, if the default history of 1 is used, the first update would be purged in favor of the second update.

😮‍💨 If you have a replicated bucket and a use case of concurrent updates, **definitely** update to prevent the possibility of this happening. The fix was introduced in 2.9.21.

**Relevant PRs**

- [#4319](https://github.com/nats-io/nats-server/pull/4319)

## Interest propagation over leafnode connections

When a client connection is created that subscribes to a subject, NATS automatically performs _subject interest propagation_ across all servers in the topology. This includes route (cluster), gateway (supercluster), and leafnode connections. This is what makes the “subscribe and publish from anywhere” possible and completely transparent for developers.

While triaging flaky tests for NATS, in some cases interest was not being fully propagated across leafnode connections. The underlying issue was a race condition which resulted in missed translation of `SUB` protocol messages translated and propagated as `LS+` protocol messages across the leafnode connection .

A second issue that was fixed involved cleaning up stale queue subscriptions across leaf connections which led to messages being sent to client connections without an active handler. As a result messages would effectively be delivered to a void.

**Relevant PRs**

- [#4464](https://github.com/nats-io/nats-server/pull/4464)
- [#4299](https://github.com/nats-io/nats-server/pull/4299)

## Clustering and stream state improvements

JetStream clustering has received some particularly important bug fixes within this release, notably around the handling of streams as they change leaders and how a Raft catch-up takes place when a node has fallen behind. These kinds of scenarios can potentially be triggered during a rolling upgrade of a cluster or after unexpected interruptions.

Improvements around how the catch-up timers and the log catch-up process are handled now mean that nodes should recover after downtime more smoothly. One edge-case where nodes could spin trying to catch up from a leader that can’t correctly satisfy a catch-up request has been fixed and another where the catch-up requests could be incorrectly canceled leading to the incorrect belief that an asset has been caught up when it had not, is also resolved.

Various other improvements, such as those involving message block accounting, stream state and per-subject limits, have also been made, which should help reduce accounting drifts after node restarts.

**Relevant PRs**

- [#4249](https://github.com/nats-io/nats-server/pull/4249)
- [#4269](https://github.com/nats-io/nats-server/pull/4269)
- [#4277](https://github.com/nats-io/nats-server/pull/4277)
- [#4344](https://github.com/nats-io/nats-server/pull/4344)
- [#4357](https://github.com/nats-io/nats-server/pull/4357)
- [#4365](https://github.com/nats-io/nats-server/pull/4365)
- [#4366](https://github.com/nats-io/nats-server/pull/4366)
- [#4412](https://github.com/nats-io/nats-server/pull/4412)
- [#4413](https://github.com/nats-io/nats-server/pull/4413)
- [#4428](https://github.com/nats-io/nats-server/pull/4428)
- [#4455](https://github.com/nats-io/nats-server/pull/4455)
- [#4473](https://github.com/nats-io/nats-server/pull/4473)

## Updating to Go 1.20 out-of-cycle

Historically, each NATS minor release series would be pinned to a Go minor series when building the binaries. For example, for the 2.8.x NATS series, the Go version used was 1.17.x. When 2.9.0 was released, the initial Go version jumped to the 1.19.x series.

A new minor version of Go is released every six months and the [support policy](https://go.dev/doc/devel/release#policy) includes the last two minor versions.

As of August 8, 2023, Go 1.21 was released which means the 1.19.x series is no longer receiving patches, even in the case of security issues.

Given this information, the server team decided to release 2.9.22 with the latest patch version of the Go 1.20. NATS 2.10.0 will then be released using Go 1.21 to get back on cycle with the latest version.

## Preparing for 2.10.0

For critical infrastructure like NATS, zero downtime upgrades are table stakes. Although the best practice for _all_ infra like this is for users to thoroughly test a new release against your specific workloads, inevitably there are cases where an upgrade occurs in production followed by a decision to downgrade. This is never recommended and can cause more harm than good for most infrastructure and data systems.

2.10.0 will bring on-disk storage changes as well as new configuration options for streams and consumers that are not compatible with the 2.9.x series. However, being mindful of the possibility of a blind downgrade, the 2.9.22 release bakes in _awareness_ of key changes that could be problematic if a downgrade occurs.

The motivation for this is to make the downgrade as painless as possible in the event of a regression for your workload, as a last resort option. However, the recommendation by the NATS team is to always reach out and report these issues before resorting to a downgrade.

The takeaway is that when you upgrade to 2.10.0, if a downgrade to 2.9 then occurs, it must be with the 2.9.22+ release to ensure storage format and config changes are handled appropriately.

## Conclusion

Refer to the [download page](https://nats.io/download/) for direct links to the GitHub release page, with comprehensive release notes, and the official Docker image.

If you prefer to track nightly builds on the `main` branch, which follows the stable series (currently `2.9.x`), images are available on Docker hub: [`synadia/nats-server:nightly-main`](https://hub.docker.com/r/synadia/nats-server/tags?page=1&name=nightly-main).

As always, if you have any questions or concerns, feel free to reach out on GitHub discussions or Slack. Thanks again to all the contributors over these past four releases!

## About the Author

[Byron Ruth](https://www.linkedin.com/in/byron-ruth/) is the Director of Developer Relations at [Synadia](https://www.synadia.com?utm_source=nats_io&utm_medium=nats) and a long-time NATS user.
