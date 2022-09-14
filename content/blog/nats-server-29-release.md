+++
date = "2022-09-13"
draft = true
title = "NATS Server 2.9 Release"
author = "The NATS Team"
categories = ["General"]
tags = ["NATS", "Release", "JetStream"]
+++

The NATS core team and contributors are proud to announce the [first release][release] of the 2.9.x series! 🚀

Thank you to the **48(!)** people who contributed to this release through GitHub issues, discussions, and pull requests and to the **hundreds** of people in the Slack community who asked questions, presented use cases, and tested early versions of the 2.9 release. ❤️

This release is a milestone for users leveraging JetStream with many improvements and a handful of new features.

The key themes to this release include:

- ⚖️  Increased stability and resilience
- 🌏 Greater scale and mobility
- 🔧 Improved operability and security

Please refer to the granular release notes for the long tail of additions, changes, and fixes as well as PR links on the [v2.9.0 release page](https://github.com/nats-io/nats-server/releases/tag/v2.9.0).

## Background

[JetStream][jetstream] was introduced in March 2021, as the successor to [NATS Streaming][stan] (STAN) which extends NATS to provide *at-least-once* delivery guarantees and the facilities for *exactly-once* processing. STAN was designed as a client process that embedded the NATS server. Observing the limitations of this approach both in terms of performance and scalability, JetStream was reimagined as a first-class, embedded subsystem of the NATS server. Since JetStream's release, adoption has grown significantly with ever-increasing scale and performance requirements.

JetStream contributes the overarching vision of NATS which is to be a **connective technology**, bridging communication between applications in the cloud, devices at the edge, and everything in between. JetStream fills a gap that *at-most-once* message delivery has, which is "what i of a client interested in a message is offline?" For edge devices in particular, loosing connectivity is common. JetStream enables these clients to *catch-up* on messages or re-join a group once they reconnect.

Along with other NATS' capabilities such as [decentralized auth][dauth], providing multi-tenant identity and authorization management, [supercluster][supercluster] and [leaf node][leafnodes] configurations, supporting cross-geo and hub-and-spoke topologies, and native a [WebSocket][websocket] interface to bridge Web clients to NATS, JetStream lays a new foundation of capabilities including a [MQTT][mqtt] interface to bridge existing IoT deployments, as well as [key-value][kv] and, experimental, [object store][objectstore] layers.

All of these capabilities are fully [open source][ghrepo], baked into a small, [static binary][install], and with zero dependencies. 🎉

[release]: https://github.com/nats-io/nats-server/releases/v2.9.0
[jetstream]: https://docs.nats.io/nats-concepts/jetstream
[stan]: https://docs.nats.io/legacy/stan
[dauth]: https://docs.nats.io/running-a-nats-service/configuration/securing_nats/auth_intro/jwt
[supercluster]: https://docs.nats.io/running-a-nats-service/configuration/gateways
[leafnodes]: https://docs.nats.io/running-a-nats-service/configuration/leafnodes
[websocket]: https://docs.nats.io/running-a-nats-service/configuration/websocket
[mqtt]: https://docs.nats.io/running-a-nats-service/configuration/mqtt
[kv]: https://docs.nats.io/using-nats/developer/develop_jetstream/kv
[objectstore]: https://docs.nats.io/using-nats/developer/develop_jetstream/object
[ghrepo]: https://github.com/nats-io/nats-server
[install]: https://docs.nats.io/nats-server/installation

## Stability and Resilience

Given NATS vision of being a *connective technology*, stability and resiliency of the server is **critical**.

We can define *stability* as having predictable behavior, performance, and resource utilization under *normal* usage, e.g. "it just works". However, for systems that need to span multiple geographies or need to support edge devices, the system needs to be *resilient*.

We can define *resiliency* as being tolerant of *atypical* situations whether this is spiky traffic, nodes failing, network issues, or slow clients. NATS must still perform under these circumstances using built-in self-healing mechanisms or allowing an operator to intervene.

A primary focus of 2.9 was to harden and optimize JetStream's implementation based on real-world usage over the past 18 months since it was released. As a vanity metric, of the net ~15k lines of code added for this release, **67%** 📈 of them contributed to improving the test and benchmark suite.

In addition to fixes and optimizations, there are a few notable highlights that improves stability and contributes to NATS' resilience.

#### Reduced time and bandwidth for replication *catch-up*

When a server containing stream replicas becomes unavailable or a new server joins the cluster and is assigned one or more stream replicas, for streams that have a large amount of data in them, it could take a significant amount of time and bandwidth to replicate a full or partial copy of the data. With 2.9, compression is automatically applied to this traffic to optimize this *catch-up* phase.

⚠️ TODO: compression algorithm used? Rough numbers of size reduction or time decrease?

A related feature is a new configuration option in the server called [`max_outstanding_catchup`][max_outstanding_catchup] which limits the total bytes that are *in-flight* during stream catch-up. This was introduced to control how much bandwidth should be dedicated during catch-up to guard against saturating and degrading performance of the network.

```config
jetstream {
  max_outstanding_catchup: 32MB
}
```

[max_outstanding_catchup]: https://docs.nats.io/running-a-nats-service/configuration#jetstream

#### Improved message distribution for multi-subscription pull consumers

Given two (or more) subscriptions bound to a pull consumers, each subscription sends a _fetch_ request requesting a batch of messages from the server. Prior to 2.9, the requests were serialized and each one would get the full batch of requested messages if available.

<img src="/img/nats-server-29-release/pull-fetch-prior29.jpg" style="display: block; margin: 0 auto 20px auto" width="500px" />

This could result in an imbalanced distribution of messages across available subscriptions. Depending on the processing time of each message, this could significantly decrease throughput.

In 2.9, the distribution algorithm was tweaked to fairly distribute messages across pending fetch requests.

<img src="/img/nats-server-29-release/pull-fetch-29.jpg" style="display: block; margin: 0 auto 20px auto" width="500px" />

For a set of fetch requests queued on the server, messages will be round-robin distributed until each fetch buffer is full or there are no more pending messages.

#### Inactive threshold for durable consumers

Consumers can be either ephemeral or durable. By design, an ephemeral consumer is intended to be used for one-off reads/replay of a stream and has a limited lifetime. In the client libraries, ephemerals are often created using one of the *convenience* methods. For example, in Go, using the [`JetStream`](https://pkg.go.dev/github.com/nats-io/nats.go#JetStream) interface.

```go
sub, _ := js.SubscribeSync("events.*")
// Do some work...
sub.Unsubscribe()
```

The client library handles:

- Looking up the stream by pattern matching the subject being subscribed to
- Auto-creating an *unnamed* consumer (which makes an ephemeral)
- Initializing a subscription and binding it to the consumer

From the server's persective, it keeps track of whether at least one subscription is bound to this ephemeral consumer _and_ if the subscription is still _active_. If/when it detects the subscription is no longer active, it will automatically delete the ephemeral consumer after the [`InactiveThreshold`](https://docs.nats.io/nats-concepts/jetstream/consumers#inactivethreshold) period (which defaults to five seconds).

In contrast, durables are intended to survive process crashes, restarts (client or server), and regardless if there are any active subscriptions. The lifecycle of a durable is expected to be managed by the application/operator.

However, what happens if consumers are being created and not properly cleaned up? Each consumer has a small amount of state associated with it that the server needs to keep track of, replicate, restore, etc. To prevent an evergrowing number of consumers, this consumer configuration can now be applied to durables.

```go
js.AddConsumer("EVENTS", &nats.ConsumerConfig{
  Durable: "event-processor",
  AckPolicy: nats.AckExplicitPolicy,
  InactiveThreshold: time.Hour,
})
```

In practice, an inactive threshold for a durable should be set to a value that would be highly unlikely the consumer would *not* have been active in the meantime. In other words, if the consumer is expected to be active regularly every couple minutes, if there is no activity for an hour, that may be a good indicator that consumer can be auto-deleted.

## Scale and Mobility

NATS was designed to scale in multiple dimensions whether the need is high message throughput or geographically distributed nodes to service users or devices.

Combine this with [subject-based messaging][subject-messaging] and intelligent routing of client messages to the closest _servicer_,  NATS provides a global, location transparent connective _fabric_ for messaging, streams, key-value stores, and object storage buckets.

This release brings _more_ capabilities to scale in more dimensions and make data locality more transparent.

[subject-messaging]: https://docs.nats.io/nats-concepts/subjects

#### Replica and mirror-based direct gets

Streams have supported a `GetMsg` operation since JetStream originally launched. This method is avaliable on the client's JetStream Manager interface and takes stream name and the specific sequence number to get a _raw_ message from the stream. For example, in Go:

```go
rmsg, _ := js.GetMsg("EVENTS", 29)
```

With the introduction of the [Key/Value Store][kv] layer which builds upon a stream and relies on subjects for keys, a new API has been exposed directly in the manager API called `GetLastMsg` which takes the stream name and a _subject_ and returns the last known message for that subject.

```go
rmsg, _ := js.GetLastMsg("EVENTS", "events.device.15")
```

With the increasing use cases and potential around the Key/Value API in order to reduce dependencies and infrastructure cost, there has also been a need to further optimize and scale _get_ operations.

Two new **opt-in** stream configuration options include `AllowDirect` and `MirrorDirect`. The first allows get operations to be directed to any replica of the stream, not only the leader, while the second spreads out the gets to any (unfiltered) [mirrors][mirrors] that have been created for that stream as well.

```go
js.AddStream(&nats.StreamConfig{
  Name: "EVENTS",
  Subjects: []string{"events.device.*"},
  AllowDirect: true,
  MirrorDirect: true,
})
```

Mirrors are of particular interest since they are typically created to provide read-only data locality to clients interested in a stream. For clients using these get operations, requests will be routed to the closest mirror rather than the origin stream.

<img src="/img/nats-server-29-release/direct-get.jpg" width="600px" style="display: block; margin: 0 auto 20px auto" />

Do note that this introduces a trade-off of reducing pressure on the leader to serve both reads and writes exclusively, however at the risk of getting a _stale_ read if the replica or mirror is not fully caught up. A stale read is much less likely among replicas, but for mirrors that there could be increased latency due to being across regions, or if there are network interruptions.

Since mirrors are technically streams themselves with a different name from the origin, each message returned from a *direct get* call will automatically include a few useful headers:

- `Nats-Stream` - original name of the stream the message was written to
- `Nats-Sequence` - original sequence number in the origin stream
- `Nats-Time-Stamp` - original timestamp associated with the message
- `Nats-Subject` - original subject of the message
- `Nats-Last-Sequence` - the previous sequence number for the subject

[kv]: https://docs.nats.io/nats-concepts/jetstream/key-value-store
[mirrors]: https://docs.nats.io/running-a-nats-service/nats_admin/jetstream_admin/replication#mirrors


#### Stream and key-value message republishing

Message republishgin was introduced as an experimental feature in 2.8.3. It has since evolved and matured as an established feature for use cases that want to _consume_ to a stream, but need the scale of core NATS. Combining republish with the more optimized *direct get* support mentioned above, a new pattern can be implemented to support _millions_ of concurrent subscriptions interested in one or more streams.

So what does republish do and how do you configure it?

For a stream:

```go
js.AddStream(&nats.StreamConfig{
  Name: "EVENTS",
  RePublish: &nats.RePublish{
    Destination: "repub.>",
    //Source: ">",
    //HeadersOnly: true,
  },
})
```

For a key-value store:

```go
js.CreateKeyValue(&nats.KeyValueConfig{
  Bucket: "SNAPSHOTS",
  RePublish: &nats.RePublish{
    Destination: "repub.>",
  },
})
```

There is a `Source` and `Destination` field which supports the [subject mapping][subject-mapping] transform. As shown above, the default `Source` is everything i.e. `>`. The `Destination` can be a single token subject or a valid transform from the source. In the above code, a source subject of `events.device.15` will be republished as `repub.events.device.15`.

A **new** option in this release is `HeadersOnly` which will omit republishing the *data*. There are two primary use cases this feature supports:

- Subscribers of republished messages only care about the headers
- Allow subscribers to perform a *direct get* for the messages they need the data payload (kind of a lazy/deferred data fetch)

Like the direct get capability above, each republished message has the same set of headers injected into it as metadata from the origin stream.

[subject-mapping]: https://docs.nats.io/nats-concepts/subject_mapping

#### Consumer replica, storage, and filter subject change

As of 2.8.3, consumer replicas and forcing memory storage has been supported to prevent inheriting the same configuration as a stream, for example three replicas and file storage.

For use cases that desire a large number of consumers, making them as lightweight as possible can help with scale and performance, such as one replica and having the state in memory.

```go
js.AddConsumer("EVENTS", &nats.ConsumerConfig{
  Durable: "processor",
  Replicas: 1,
  MemoryStorage: true,
})
```

For applications having consumers created prior to 2.8.3 or consumers created without those settings defined, these configuration options could not be changed.

This release brings the ability to update both `Replicas` and `MemoryStorage` after consumer creation.

In addition, the `FilterSubject` field is now able to be changed after creation.

```go
js.UpdateConsumer("EVENTS", &nats.ConsumerConfig{
  Durable: "processor",
  Replicas: 1,
  MemoryStorage: true,
  FilterSubject: "events.eu.*",
})
```

#### Server tags and moving streams

Server tags and placement of streams by tag were first introduced in 2.7.4. Each server in a cluster could be configured with zero or more tags indicating some property about them. For example, a cluster deployed in AWS within the us-east-2 region where each node is in a different availability zone.

```
// Node 1 configuration
server_tags: ["cloud:aws", "region:us-east-2", "az:us-east-2a"]

// Node 2 configuration
server_tags: ["cloud:aws", "region:us-east-2", "az:us-east-2b"]

// Node 3 configuration
server_tags: ["cloud:aws", "region:us-east-2", "az:us-east-2c"]
```

A stream could then be defined with a *placement* declaration indicating the subset of nodes in a cluster that the stream replicas should exist on.

```go
js.AddStream(&nats.StreamConfig{
  Name: "EVENTS",
  Placement: &nats.Placement{
    Tags: []string{"cloud:aws", "region:us-east-2"},
  },
})
```

When the server received this request it would determine whether there are a set of servers that have _all_ of these tags. If they have sufficient resources available to host a replica of the stream (assuming an R3 or R5), then that server would be elected.

The `unique_tag` server config was later introduced in 2.8.0 to declare which tag (by prefix) must be _unique_ with respect to the replicas of a stream. Prior to this addition, it could be possible that all replicas would be placed on the same node (which would defeat the purpose of replication).

```
jetstream {
  unique_tag: "az:"
}
```

With a servers having these additional config, placement of replicas for a stream would guarantee to be in different availability zones (being the most common use case).

Stream placement becomes even more flexible by supporting **changing** the placement declaration in order to transparently move a stream to new servers. This can be done by simply doing `js.UpdateStream` with a new `Placement` configuration.

## Operability and Security

NATS is multi-faceted infrastructure that can be used in a variety of ways, be it the messaging layer between microservices, leaf nodes deployed on edge devices to ingest sensor data, the backbone for data pipelines and stream processing, etc.

Given how fundamental NATS has become for increasingly large and complex systems, ease of operability and modern [security features and practices][security] are crucial.

This release brings a handful improvements including a new [encryption][encryption] choice for JetStream file storage, a new account stats endpoint and purge operation, and the ability to define user templates for scoped signing keys.

[security]: https://docs.nats.io/nats-concepts/security
[encryption]: https://docs.nats.io/running-a-nats-service/nats_admin/jetstream_admin/encryption_at_rest

#### Account stats endpoint and purge operation

For more insight into account resources and limits...

*TODO: what do `tiers` refer to in [updated payload](https://github.com/nats-io/nats-architecture-and-design/issues/120#issuecomment-1162441701)?*

For operators managing accounts, it may be desired to purge all resources associated with an account. A new API available to the system account has been implemented to support this.

```
nats req '$JS.API.ACCOUNT.PURGE.<account name>' ''
```

#### Templates for scoped signing keys

TODO

#### New subject mapping functions

TODO

#### AES-GCM cipher for JetStream file-based encryption

TODO: may not be too exciting of an annoncement? show how to declare in the config


