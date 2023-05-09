+++
date = "2023-05-09"
draft = true
title = "Exploring NATS as a backend for k3s"
author = "Byron Ruth"
categories = ["General"]
tags = ["NATS", "KV", "k3s", "KINE"]
+++

[k3s][k3s] is a lightweight Kubernetes distribution suitable for IoT and edge computing environments. One component k3s leverages is [KINE][kine], which is a shim enabling the replacement of [etcd][etcd] with alternate storage backends originally targeting relational databases.

In April 2022, the [v0.9.0 release][v0.9.0] of KINE introduced native support for NATS as a backend. In June 2022, the k3s [v1.23.7+k3s1][v1.23.7] release included this KINE version making it possible for k3s deployments to connect to an existing NATS system.

The KINE backend leverages the [Key-Value API][kv] built on top of the NATS persistence subsystem, [JetStream][jetstream].

A minimal example of bootstrapping a k3s server backed by NATS can be done by starting a JetStream-enable `nats-server` followed by starting `k3s server` with the `--datastore-endpoint` configured.

```sh
# Run in the background or in the foreground in a different shell.
nats-server -js &

# Point k3s to the default NATS address.
k3s server --datastore-endpoint=jetstream://localhost:4222
```

When the `k3s server` starts, it will create a KV bucket (if it does not exist) within NATS. If using with a NATS cluster, the bucket can be configured with multiple replicas for high-availability and fault tolerance of the data.

## Global, multi-tenant infrastructure

What does using NATS give you out of the box?

During RethinkConn 2022, [Caleb Lloyd][caleb] presented [Using NATS JetStream as a KINE backend for k3s][rethinkconn] where he demonstrated the ability to deploy multiple k3s clusters in different regions all connected to a global, multi-cloud deployment of NATS (in this case [Synadia's NGS][ngs]).

The main takeaways include:

- The ability to deploy multiple k3s clusters, each having their own isolated [account][accounts] and KV bucket to store cluster state on a shared NATS system.
- The ability for _applications running in k3s_ to leverage the same NATS system for their workloads (within their own accounts).
- The ability to create cross-region mirrors of the KV buckets for straightforward backup/restore disaster recovery scenarios.

Given this is one NATS system, an operator gets end-to-end visibility and management of all of these assets out-of-the-box.

[k3s]: https://k3s.io
[kine]: https://github.com/k3s-io/kine
[etcd]: https://etcd.io
[v0.9.0]: https://github.com/k3s-io/kine/releases/tag/v0.9.0
[v1.23.7]: https://github.com/k3s-io/k3s/releases/tag/v1.23.7%2Bk3s1
[kv]: https://docs.nats.io/nats-concepts/jetstream/key-value-store
[jetstream]: https://docs.nats.io/nats-concepts/jetstream
[caleb]: https://www.linkedin.com/in/calebjlloyd
[rethinkconn]: https://www.youtube.com/watch?v=CetW4eGkyS0
[ngs]: https://synadia.com/ngs
[accounts]: https://docs.nats.io/running-a-nats-service/configuration/securing_nats/accounts

## Embedded NATS

Last week (May 2023), the [v0.10.0][v0.10.x] KINE release landed support for _embedding_ the NATS server. This is possible because KINE and NATS are both written in [Go](https://golang.org) and the server can be [imported as a package](https://pkg.go.dev/github.com/nats-io/nats-server/v2/server).

> At the time of this writing, k3s with this new version of KINE embedded with NATS has not yet been released. What is discussed below works, but currently requires a manually building k3s.

Starting k3s with this version of KINE embedded is now reduced to the following command (without needing to start an external NATS server).

```sh
k3s server --datastore-endpoint=nats://
```

The minimal `nats://` endpoint relies on the defaults in the NATS server, listening on all hosts (`0.0.0.0`) and binding to port `4222`. Of course, if don't want to embed the server, you can add the query parameter `noEmbed` and it will connect to a remote system.

What do we gain with an embedded server?

The original motivation was to further reduce the distribution and dependency footprint, resulting in the option of a single k3s binary with KINE and NATS embedded.

However, there are two other benefits over the other embedded options currently available (etcd and SQLite).

The `nats://` endpoint supports a `serverConfig` query param pointing to a local NATS config file. This gives the flexibility of configuring the instance as a [Leaf Node][ln] extending an existing NATS system.

Building on the above example showcased in the RethinkConn talk, embedded NATS makes it possible to extend to the edge and maintain local state without remote connectivity to a NATS cluster. However, visibility and management of these edge (and non-edge) deployments can still be acheived.

This segways into the second point, which is, acknowledging the combination of NATS embedded within k3s. A single binary gives you all the advantages of NATS combined with a workload scheduler!

**Having a single binary with k3s and NATS is superpower.**

If you are interested in reading what options are available to configure the KINE datastore endpoint, checkout the [NATS examples][kine-ex] document in the KINE repo.

[v0.10.x]: https://github.com/k3s-io/kine/releases/tag/v0.10.1
[ln]: https://docs.nats.io/running-a-nats-service/configuration/leafnodes
[kine-ex]: https://github.com/k3s-io/kine/blob/master/examples/nats.md

## Future efforts

Having NATS available as KINE/k3s backend was a great start and having the option for embedding NATS is a superpower for edge deployments. However, there are a few other areas the NATS team is exploring including:

- Native support for NATS in k3s' embedded HA/cluster mode ( join the discussion on the [GitHub issue](https://github.com/k3s-io/k3s/issues/7451))
- How NATS may be able to be leveraged within [Fleet](https://github.com/rancher/fleet)

If you find any of this interesting, have use cases to share, or want to show your support, please join us on [Slack](https://slack.nats.io)!

Finally, The NATS team wants to give a BIG thank you and shoutout to the k3s/KINE team for the support and guidance on making NATS available as a backend. ❤️

## Additional Links

- [NATS by Example: Key-Value Intro](https://natsbyexample.com/examples/kv/intro/go)
- [NATS by Example: Embedded Server with mTLS](https://natsbyexample.com/examples/embedded/mtls/go)

## About the Author

[Byron Ruth](https://www.linkedin.com/in/byron-ruth-97216a1b7/) is the Director of Developer Relations at [Synadia](https://synadia.com) and a long-time NATS user.
