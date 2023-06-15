+++
date = "2023-06-14"
draft = false
title = "NATS Server 2.9.18 Release"
author = "Byron Ruth"
categories = ["Engineering"]
tags = ["NATS", "Release"]
+++

The NATS maintainers are happy to announce the [2.9.18 release](https://github.com/nats-io/nats-server/releases/tag/v2.9.18)! We want to thank all of the people who contributed to this release through reporting issues and code contributions! If **you** are interested in contributing, please check out [all the ways you can](https://nats.io/contributing/)!

This release was a smaller one than the prior few, but there are still some key areas to cover, including:

- [Process purge replay properly on startup](#-process-purge-replay-properly-on-startup)
- [Daisy-chained leafnodes losing interest](#-daisy-chained-leafnodes-losing-interest)
- [Optimize KV get for large key spaces and small messages](#-optimize-kv-get-for-large-key-spaces-and-small-messages)
- [Remediate potential panic scenarios](#-remediate-potential-panic-scenarios)

For the entirety of the improvements and fixes, check out the [release notes](https://github.com/nats-io/nats-server/releases/tag/v2.9.18).

# 🗑️ Process purge replay properly on startup

Purge is an on-demand operation that can be applied to a stream to delete a subset of messages in the stream. A purge operation takes a few [opt-in options](https://pkg.go.dev/github.com/nats-io/nats.go#StreamPurgeRequest) including:

- _sequence_ to purge all messages up to, but not including the message with the sequence
- _subject_ to purge all message matching the subject (wildcards supported)
- _keep_ option indicating the number of newest messages to keep, having all previous messages deleted

If none of these options are set, all messages in the stream will be deleted.

An issue was observed where a purge using one of these options, followed by immediately restarting servers in a cluster could resort to an unintentional _full_ purge of a stream.

The probability of this occurring in practice is fairly low, but given the risk of data loss, it was clearly flagged as high priority and this release introduces the fix to apply the _correct_ purge. That said, if you do not perform on-demand filtered purges, there is no risk of this bug.

**Relevant PRs**

- [#4212](https://github.com/nats-io/nats-server/pull/4212)
- [#4213](https://github.com/nats-io/nats-server/pull/4213)

## 🔗 Daisy-chained leafnodes losing interest

[Leafnodes](https://docs.nats.io/running-a-nats-service/configuration/leafnodes) are leveraged to extend an existing NATS system (cluster/supercluster), providing isolation of NATS traffic bound to explicit accounts and bridging separate operational and security boundaries.

In practice, leafnodes are typically deployed at edge locations or devices where messaging, streaming, etc. can be leveraged by co-located applications. If/when these leafnodes are connected to a _hub_ cluster, data can synchronize in either direction.

For some use cases, there may be a need to _daisy-chain_ leafnodes from other leafnodes rather than directly to the _hub_. Since each leafnode can be configured with different operational and security boundaries, each daisy-chain _layer_ could apply different policies in terms of account binding or security bridging.

For some daisy-chained setups, there was a regression introduced in 2.9.17 which caused _interest propagation_ of subjects to not fully traverse these layers, resulting in messages not being delivered to all interested subscribers.

**Relevant PRs**

- [#4207](https://github.com/nats-io/nats-server/pull/4207)

## 💨 Optimize KV get for large key spaces and small messages

For those new to the [Key-Value](https://docs.nats.io/nats-concepts/jetstream/key-value-store) capability in NATS, it is a client abstraction on top of a standard stream. There are various stream configurations that are used to ultimately make the stream behave like a key-value store, such as setting the `MaxMsgsPerSubject` limit to enforce a limit on the number of messages that can be retained per subject. From a key-value standpoint, each subject corresponds to a key and the message data correspond to the key's _value_.

It is a common use case to use key-value stores for caches that may have a large number of keys for high cardinality identifiers, such as `user_id`. Prior to this release, there was a fairly strong degradation of key-value _get_ performance as the number of keys increased. This was particularly noticeable when the value size was small.

An optimization was introduced that essentially skips an unnecessary scan operation for this workload that literally 10x'ed the operations per second. See the [before](https://github.com/nats-io/nats-server/issues/4221#issuecomment-1583441661) and [after](https://github.com/nats-io/nats-server/issues/4221#issuecomment-1589939932) comparison if you are curious!

**Relevant PRs**

- [#4235](https://github.com/nats-io/nats-server/pull/4232)

## 😰 Remediate potential panic scenarios

The NATS community is fantastic and every so often we get contributions from folks who are merely perusing the source code and observing improvements that can be made. This contribution was just that.

A couple of folks from InfoWatch observed a few areas in the code where panic scenarios could arise and remediated them, putting in place guards where appropriate.

**Relevant PRs**

- [#4214](https://github.com/nats-io/nats-server/pull/4214)

## Conclusion

Among the handful of other fixes and improvements, if any of these affect you, please update your NATS system and provide us feedback! Thanks again to all the contributors of this release.

As always, refer to the [download page](https://nats.io/download/) for direct links to the GitHub release page and the official Docker image.

If you prefer to track nightly builds on the `main` branch, which follows the stable series (currently `2.9.x`), images are available on Docker hub: [`synadia/nats-server:nightly-main`](https://hub.docker.com/r/synadia/nats-server/tags?page=1&name=nightly-main).

## About the Author

[Byron Ruth](https://www.linkedin.com/in/byron-ruth/) is the Director of Developer Relations at [Synadia](https://synadia.com) and a long-time NATS user.
