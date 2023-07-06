+++
date = "2023-07-05"
draft = false
title = "Release Candidate - NATS 1.0.0 Helm Chart"
author = "Caleb Lloyd"
categories = ["Engineering"]
tags = ["NATS", "Release","Kubernetes","Helm", "k8s"]
+++

As the Kubernetes ecosystem continues to grow, installing NATS via [Helm](https://helm.sh/) has become a very popular method.

The NATS 0.x series of the Helm Chart was initially released in 2020, a full year before JetStream was even available in the NATS Server.

The past 3 years have taught us that it is important to support all of the extensibility options possible in Kubernetes resources - custom Image Registries, ConfigMaps, TLS Secrets, Volumes and Mounts, Init Containers, and more.

Today we are announcing the first [1.0.0 release candidate of the Helm Chart](https://github.com/nats-io/k8s/releases/tag/nats-1.0.0-rc.0), evolved from the 0.x series learnings. This pre-release period will continue for the remainder of July 2023 with an expected GA timeline of August 2023.

## New Service for Clients

NATS uses a Stateful Set so that multiple containers in the NATS Cluster can discover each other via cluster Routes. Stateful Sets require defining a [Headless Service](https://kubernetes.io/docs/concepts/services-networking/service/#headless-services) to be used for discovery.

In the 0.x Helm Chart, NATS only created a Headless Service. The first issue users ran into is that this service type cannot be changed to a ClusterIP, NodePort, or LoadBalancer service. For those exposing NATS outside of their cluster, it was common to have to create a sub-chart for NATS and add the custom service type to the parent chart.

JetStream health checks have also evolved to be more comprehensive. New health checks have been added to ensure that JetStream starts and catches up on stream replication prior to being marked as ready. This resulted in having to enable `publishNotReadyAddresses` on the Headless Service, so that NATS containers could still discover each other prior to JetStream being ready. The downside was that clients connecting through the Headless Service could reach a server that was not ready.

The 1.0.0 Helm Chart introduces a service for clients, which defaults to a ClusterIP service type. It can easily be changed to NodePort or LoadBalancer also. This service considers Pod Readiness, so clients will always be connecting to a server that passes Startup and Readiness checks.

The Headless Service has been renamed to add a suffix of “-headless”. It is still used by the NATS containers to discover their peer routes, but should not be used directly by clients.

## Ingress Support for WebSocket Connections

NATS supports connections over WebSockets, and the 1.0.0 Helm Chart makes it simple to expose WebSockets via an ingress:

```yaml
config:
  websocket:
    enabled: true
    ingress:
      enabled: true
      hosts:
        - demo.nats.io
```

## Fully Customizable

One of the pitfalls of Helm Charts is that they don’t always provide a way to customize a particular resource. In 0.x we spent a lot of time adding new values to the Helm Chart to customize the NATS Config and Kubernetes Resources.

1.0.0 introduces a new model - there are a handful of explicitly defined options, and everything in the NATS Config or Kubernetes Resources can be overridden by merge and patch keys.

For example, to set accounts/users in the NATS Config:

```yaml
config:
  merge:
    accounts:
      A:
        users:
          - { user: a, password: a }
      B:
        users:
          - { user: b, password: b }
```

Or to add resource constraints to the NATS Container:

```yaml
container:
  env:
    # different from k8s units, suffix must be B, KiB, MiB, GiB, or TiB
    # should be ~90% of memory limit
    GOMEMLIMIT: 7GiB
  merge:
    # recommended limit is at least 2 CPU cores and 8Gi Memory for production JetStream clusters
    resources:
      requests:
        cpu: "2"
        memory: 8Gi
      limits:
        cpu: "2"
        memory: 8Gi
```

Any new NATS Config or Kubernetes option is immediately supported by the 1.0.0 Helm Chart without waiting for a new chart version to support specific functionality.

## Try it Today

The 1.0.0 Helm Chart Release Candidate is available on [ArtifactHub](https://artifacthub.io/packages/helm/nats/nats) and [GitHub](https://github.com/nats-io/k8s). To leave feedback, please open issues or discussions on the [nats-io/k8s repo](https://github.com/nats-io/k8s) or ask questions in the [NATS #k8s channel](https://natsio.slack.com/archives/CTM4A2TR7). Thanks!

## About the Author

[Caleb Lloyd](https://www.linkedin.com/in/calebjlloyd) is the Director of Engineering for SaaS at Synadia and a maintainer of the NATS Helm Charts.
