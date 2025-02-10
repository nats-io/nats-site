+++
categories = ["General", "Engineering", "JetStream"]
date = "2021-07-15"
tags = ["kv","key-value","jetstream", "cli"]
title = "JetStream for Key-Value Store Tech Preview"
author = "R.I. Pienaar"
+++

Key-Value stores are specialised NoSQL databases that store values in a data
bucket under a specific key.

Key-Value stores are used extensively in modern cloud-native infrastructure, 
indeed etcd is the main storage engine of Kubernetes.

In recent releases we have made several enhancements to JetStream with regard to wildcard 
subject support. In NATS Server 2.3.2 we have all of the features needed for NATS
JetStream to be a powerful Key-Value store.

Today we'll show an experimental feature added to the `nats` CLI with full client
APIs to follow for our major supported languages.

Some features we will support:

 * Multiple named Buckets, each with replication, historical values and cluster affinity
 * Basic key-value operations of Get, Put and Watch
 * Per key TTLs for auto expiring of keys
 * Encoders and Decoders allowing zero trust data storage
 * In-memory read caches
 * Global replication for read-replicas stored near your clients
 * Read-After-Write safety
 
Please enjoy the accompanying video to see this experimental feature in action and get 
some background thoughts.

<iframe width="560" height="315" src="https://www.youtube.com/embed/yYL0ZGTNomE" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## About the Author

R.I. Pienaar is a long-time NATS Maintainer and a senior member of the engineering team at [Synadia Communications](https://www.synadia.com?utm_source=nats_io&utm_medium=nats).

Questions? Join our [Slack channel](https://slack.nats.io) or email [info@nats.io](mailto:info@nats.io).
