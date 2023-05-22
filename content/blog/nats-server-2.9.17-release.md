+++
date = "2023-05-19"
draft = false
title = "NATS Server 2.9.17 Release"
author = "Byron Ruth"
categories = ["Engineering"]
tags = ["NATS", "Release"]
+++

The NATS maintainers are proud to announce the [2.9.17 release](https://github.com/nats-io/nats-server/releases/tag/v2.9.17)! We want to thank all of the people who contributed to this release! If **you** are interested in contributing, please check out [all the ways you can](https://nats.io/contributing/)!

The key areas this post will cover include:

- [WebSocket transport truncation](#-websocket-transport-truncation)
- [Health monitor improvements](#-health-monitor-improvements)
- [Leafnode fleet optimizations](#-leafnode-fleet-optimizations)
- [Monotonic time calculations](#-monotonic-time-calculations)

For the entirety of the improvements and fixes, check out the [release notes](https://github.com/nats-io/nats-server/releases/tag/v2.9.17).

## 🐘 WebSocket transport truncation

As part of the [P99 peformance work in the 2.9.16 release](https://nats.io/blog/nats-server-2.9.16-release/#-p99-performance), a regression was introduced, resulting in [faulty subscription behavior in clients](https://github.com/nats-io/nats.ws/issues/194) receiving fairly large messages over the WebSocket transport. Internally this had to do with prematurely deallocating a buffer to a shared pool before data was entirely flushed on a connection.

However, the upside of addressing this issue is more optimizations for the WebSocket transport, including reducing the overall memory footprint and switching to a [faster compression algorithm](https://github.com/nats-io/nats-server/pull/4087).

**Relevant PRs**

- [#4084](https://github.com/nats-io/nats-server/pull/4084)
- [#4087](https://github.com/nats-io/nats-server/pull/4087)
- [#4093](https://github.com/nats-io/nats-server/pull/4093)

## ⚕️ Health monitor improvements

NATS provides a set of [monitoring endpoints](https://docs.nats.io/running-a-nats-service/nats_admin/monitoring) containing a variety of information about the current state of the server.

The job of the `/healthz` endpoint is to return `200 OK` when the server is ready for client connections. If JetStream is enabled, the endpoint also checks if the assets (streams and consumers) on the server have been accounted for, confirming any necessary recovery has been performed, and the integrity of the data has been verified.

In rare situations, for clusters with a large number of assets, or if the asset sizes are large, it was possible for a server to get stuck and never finish the internal checks, therefore never becoming ready for client connections. A forced server restart would typically fix this issue, however, clearly this was not ideal.

This release brings an internal routine that periodically checks whether all assets have been checked and restarts the ones that have become stuck. This obviates the need to force restart the server, resulting in a full re-check and further improves NATS ability to self-heal.

**Relevant PRs**

- [#4116](https://github.com/nats-io/nats-server/pull/4116)
- [#4172](https://github.com/nats-io/nats-server/pull/4172)

## 🍃 Leafnode fleet optimizations

For edge-related use cases, it is becoming increasingly common for each edge target to have a _leafnode cluster_ deployed rather than a single [leafnode](https://docs.nats.io/running-a-nats-service/configuration/leafnodes). This provides high availability and fault tolerance of stream data (including Key-Value and object store) for locally connected services.

This is possible by configuring the leafnodes as a local [cluster](https://docs.nats.io/running-a-nats-service/configuration/clustering) while each node also has the [`remotes`](https://docs.nats.io/running-a-nats-service/configuration/leafnodes/leafnode_conf#leafnode-remotes-entry-block) block configured establishing one or more connections to the remote cluster.

As the scale of edge deployments increases, so does the need to optimize how real-time propagation of _subject-interest_ happens. Where it was common to have many single leafnode deployments, having clusters of three or greater for edge deployment 3x-5x's the number of nodes in the fleet. For use cases such as electric vehicles and charging stations, the number of edge locations and leafnodes can be quite high!

This release brings the first of a series of optimizations for increasingly large-scale fleets. This initial improvement accounts for the fact that interest-propagation updates, directly, _one_ of the nodes in the leafnode cluster, rather than all of them. Once one node in the cluster receives these updates, it will then locally propagate these updates. This removes the propagation multiplier of running a leafnode cluster.

**Relevant PRs**

- [#4117](https://github.com/nats-io/nats-server/pull/4117)
- [#4135](https://github.com/nats-io/nats-server/pull/4135)

## ⏱️ Monotonic time calculations

Although this improvement fixes a number of timing edge cases internal to the server, this section will serve as a Pro-Tip for anyone relying on Go's [time](https://pkg.go.dev/time) package for calculating durations using two time values.

It is not uncommon to prefer UTC time values, especially in system spanning multiple time zones. However, did you know that calling the `time.Now().UTC()` will result in throwing away an internal monotonic value which differentiates two time values that are invoked within a nano-second level time frame, either in succession or concurrently? The [`time` package documentation calls this out](https://pkg.go.dev/time#hdr-Monotonic_Clocks).

As a quick demonstration, the following code gets two time values in succession and then prints their values and the difference between them.

```go
package main

import (
	"fmt"
	"time"
)

func main() {
	t1 := time.Now()
	t2 := time.Now()

	fmt.Println("# Local (monotonic)")
	fmt.Println(t1)
	fmt.Println(t2)
	fmt.Println(t2.Sub(t1))

	fmt.Println("# UTC")
	fmt.Println(t1.UTC())
	fmt.Println(t2.UTC())
	fmt.Println(t2.UTC().Sub(t1.UTC()))
}
```

Below is an example output. Note the local times are differentiated by that `m=+` value shown in the output, with a calculated 83ns difference between the times. The second set of times are converted to UTC before printing and performing the time substraction. Note how the times are no longer differentiated and the difference is zero.

```
byron@nats ~ % go run time.go
# Local (monotonic)
2023-05-19 15:47:48.263162 -0400 EDT m=+0.000078876
2023-05-19 15:47:48.263162 -0400 EDT m=+0.000078959
83ns
# UTC
2023-05-19 19:47:48.263162 +0000 UTC
2023-05-19 19:47:48.263162 +0000 UTC
0s
```

UTC time values are certainly valuable for user/system reported times, however, the lesson learned here is that monotonic time values need to be preserved for accurate duration calculations.

**Relevant PRs**

- [#4132](https://github.com/nats-io/nats-server/pull/4132)
- [#4154](https://github.com/nats-io/nats-server/pull/4154)

## Conclusion

The NATS team wants to reiterate our appreciation to all contributors in this release, including those testing and providing feedback during the release cycle. Nightly builds on the `main` branch, tracking the minor series (currently `2.9.x`), are available on Docker hub: [`synadia/nats-server:nightly-main`](https://hub.docker.com/r/synadia/nats-server/tags?page=1&name=nightly-main).

As always, refer to the [download page](https://nats.io/download/) for direct links to the GitHub release page and the official Docker image.

## About the Author

[Byron Ruth](https://www.linkedin.com/in/byron-ruth/) is the Director of Developer Relations at [Synadia](https://synadia.com) and a long-time NATS user.
