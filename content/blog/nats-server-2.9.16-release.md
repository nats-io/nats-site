+++
date = "2023-04-19"
draft = false
title = "NATS Server 2.9.16 Release"
author = "Byron Ruth"
categories = ["Engineering"]
tags = ["NATS", "Release", "Testing", "Quality"]
+++

The NATS maintainers are very proud to announce the [2.9.16 release](https://github.com/nats-io/nats-server/releases/tag/v2.9.16)! 🥳

This release brings another round of stability and performance improvements, leveraging our new quality engineering practices described in the [2.9.15 announcement post](/blog/nats-server-2.9.15-release/), and iterating directly with users having high-scale and latency-sensitive workloads.

Given the positive feedback on the previous announcement post focusing on the higher-level impact of the changes, going forward all releases will have an announcement post!

In this post we will cover a few key areas:

- [False positive vulnerabilities](#-false-positive-vulnerabilities)
- [Nightly builds](#-nightly-builds)
- [Raft self-healing and cleanup](#-raft-self-healing-and-cleanup)
- [Minimizing restart impact](#-minimizing-restart-impact)
- [P99 performance](#-p99-performance)

For the entirety of the improvements and fixes, check out the [release
notes](https://github.com/nats-io/nats-server/releases/tag/v2.9.16).

## 🪆 False positive vulnerabilities

A [report from last month](https://github.com/nats-io/nats-server/issues/3992) indicated that security vulnerability scanners, such as [Grype](https://github.com/anchore/grype) and [Trivy](https://github.com/aquasecurity/trivy), would report the server had an active CVE or would not pass due to a “malformed version”.

We eventually discovered that using `go build .` rather than `go build main.go` resulted in Go not listing the package itself as a dependency with the `(devel)` version which was tripping up the vulnerability scanners.

Although a subtle change, after updating this, there are no more false positives. Given the increasing sensitivity of vulnerable dependencies and supply chain attacks, we take reports like these very seriously and want to ensure even false positives are remediated.

**Relevant PRs**

- [#3993](https://github.com/nats-io/nats-server/pull/3993)

## 🏗️ Nightly builds

As part of this development cycle, a new nightly build based off of the `main` branch was introduced, which follows the current minor release series, such as `2.9.x`. This was driven by user demand to be able to try and test out recently-landed server PRs as they are merged throughout the development cycle in preparation for the next patch release.

Making this available has been invaluable for the NATS team since it shortens the feedback loop for users actively engaged and testing changes in their own environments.

The build is available as a [Docker image](https://hub.docker.com/r/synadia/nats-server/tags?page=1&name=nightly-main) under the `synadia` Docker Hub organization with the `nightly-main` tag:

```sh
$ docker run -p 4222:4222 synadia/nats-server:nightly-main -js
```

For those that were not aware, there is an [existing Docker image](https://hub.docker.com/r/synadia/nats-server/tags?page=1&name=nightly) having the `nightly` tag based on the `dev` branch which tracks the next _minor_ version, in this case `2.10.0`.

```sh
$ docker run -p 4222:4222 synadia/nats-server:nightly -js
```

**Relevant PRs**

- [#3961](https://github.com/nats-io/nats-server/pull/3961)
- [#3972](https://github.com/nats-io/nats-server/pull/3972)
- [#4019](https://github.com/nats-io/nats-server/pull/4019)

## 🪵 Raft self-healing and cleanup

One of the NATS core pillars is for the server to be _self-healing_. Specifically, the ability to preserve itself against slow or rogue clients, and recover in the face of partial failure.

The JetStream subsystem, managing streams and consumers, relies on a [custom Raft implementation](https://github.com/nats-io/nats-server/blob/main/server/raft.go) built on top of Core NATS itself enhanced by two distinctive features:

- Optimized hand-offs using cooperative step-down on leader transfers to minimize interruption
- Detection of storage faults and corruption using checksums on read and writes

This release brings additional fixes and improvements making this self-healing attribute more robust.

One fix addressed a memory leak that could occur if the JetStream subsystem shut down on a server, making it inactive from the cluster’s standpoint, but the server itself was still holding on to resources.

A second improvement detects servers in [lame duck mode](https://docs.nats.io/running-a-nats-service/nats_admin/lame_duck_mode) and omits them as possible leaders for Raft groups. Although the previous behavior would eventually correct itself once the server finally shut down, this optimizes the leader election so that a server that is about to shut down will not be selected, reducing impact to active JetStream assets.

Finally, an uncommon split-brain failure mode, resulting in two separate leaders trying to run for the same asset leadership term, has been addressed. Previously, manual intervention was required to force `step-down` one of the leaders, but this is now performed automatically when detected.

**Relevant PRs**

- [#3999](https://github.com/nats-io/nats-server/pull/3999)
- [#4049](https://github.com/nats-io/nats-server/pull/4049)
- [#4002](https://github.com/nats-io/nats-server/pull/4002)
- [#4056](https://github.com/nats-io/nats-server/pull/4056)

## ⏳ Minimizing restart impact

For NATS deployments that have hundreds or thousands (or more) streams and consumers with high loads, a server restart (or failure) can be potentially disruptive in production.

When a clustered server goes offline whilst running as replica leaders, although leader election is handled transparently, all of the load will ultimately shift to other servers, increasing their load further. When the offline server comes back online (or is replaced), it will need to be deemed _healthy_ before it is possible to shift leaders and load back to this server.

The single entrypoint for determining server health is the `/healthz` monitoring endpoint. For Kubernetes-based deployments, this is the endpoint used for the readiness and liveness probes (using different parameters). For servers having many assigned assets, becoming healthy for _all_ assets could take a significant amount of time, delaying the server from being an active participant for the assets that were asserted to be healthy.

A key improvement in this release is to provide more granular, per asset checking to prevent blocking healthy assets from participating in their Raft group.

As noted above, for high throughput workloads, the amount of data the server needs to churn through may not be small, so optimizing this path can be critical for reducing startup times and aiding cluster recovery.

A second improvement is to better handle the case that recovering the local state for a JetStream asset had stalled (usually resulting in `Catching up for server X stalled` warnings), instead resetting the log and recovering with the assistance of other healthy servers in the cluster.

Previous manual intervention required scaling down a stream to R1, effectively wiping local replica state, followed by scaling back up, causing a fresh copy to sync from the leader.

This _stall_ detection will reduce the time for a server to become healthy (via `/healthz`), thus minimizing the impact on planned or unplanned restarts.

**Relevant PRs**

- [#4031](https://github.com/nats-io/nats-server/pull/4031)
- [#4058](https://github.com/nats-io/nats-server/pull/4058)

## ⚡ P99 performance

[Synadia](https://www.synadia.com?utm_source=nats_io&utm_medium=nats) was fortunate to work with a customer in the financial services industry measuring JetStream publish latency. They cared deeply about 99th percentile (P99) publish latencies, keeping the variance (even at peak load) as low as possible.

Their setup consisted of ~200 R3 streams spread out across a private network tying together all three major public clouds. Their workload had peak publish throughput of ~180-200k messages/second.

After their own evaluation, they discovered their P99 metric had some publish latencies reaching **several seconds**. To level-set, in this context, P99 refers to the 1% _worst_ publish latencies that were measured. The other 99% of measured publish latencies were in range of their needs.

The quality engineering team modeled the workload with a similar topology, number streams, etc. and added it as part of the load testing suite. Throughout the development cycle, this workload was run repeatedly to ensure proposed changes were in fact improving performance.

After a day’s worth of changes were incorporated, the customer was able to pull a nightly build and re-test within their own environment, resulting in a productive daily feedback loop. 🙌

The range of improvements and optimizations varied, but by the end of this journey, the team was able to reduce the P99 publish latency to under **30ms** at peak load.

📝 As an obligatory disclaimer, performance numbers are very workload and environment-specific. The takeaway from this section should be the **magnitude of improvement** that was achieved as a result of this effort.

**Relevant PRs**

- [#3965](https://github.com/nats-io/nats-server/pull/3965)
- [#3981](https://github.com/nats-io/nats-server/pull/3981)
- [#4022](https://github.com/nats-io/nats-server/pull/4022)

## Conclusion

The NATS team is incredibly proud of this release and reinforces the impact the new quality engineering process provides (and now our nightly builds) in optimizing the feedback loop for discovering, assessing, and addressing fixes and improvements.

As always, refer to the [download page](https://nats.io/download/) for direct links to the GitHub release page and the official Docker image.

## About the Author

[Byron Ruth](https://www.linkedin.com/in/byron-ruth/) is the Director of Developer Relations at [Synadia](https://www.synadia.com?utm_source=nats_io&utm_medium=nats) and a long-time NATS user.
