+++
title = "Recovering Quorum After Renaming Servers"
date = 2024-01-20T19:35:31-07:00
author = "John Weldon"
categories = ["Engineering"]
tags = ["nats", "helm", "kubernetes", "troubleshooting", "quorum"]
draft = false
+++

Occasionally, a NATS cluster can lose quorum for various reasons.
Here, we'll look at one specific case, and how to recover from it.

<!--more-->

# Context

## How To Rename Servers in a Cluster

The recommended way to rename NATS servers in a cluster is to rename one at a time.
After each rename, the cluster will have a record of both the old name and the new name.
The former will appear offline, and the latter should appear online.
You should remove the record of the old name before renaming the next server, otherwise, the
cluster may, sooner or later, end up with too many faux-offline servers, and will consider
itself to have lost quorum.

### NATS Helm Chart Caveats - <small>A Brief Diversion</small>

The [`values.yaml`][values.yaml] file for the [NATS Helm Chart][helm-chart] has an option
to set a [`serverNamePrefix`][serverNamePrefix], which you might be tempted to use to
rename the servers in a helm chart deployed cluster.

This setting should only be changed before the first installation.
Once the cluster is up and running, if you change this value, and then upgrade the
helm release, you'll cause all of the servers in the cluster to be simultaneously renamed.
This will double the number of recorded servers in the cluster (half with the old name, and
half with the new name, per the changed `serverNamePrefix`).
Consequently, there will not be enough servers active in the cluster to retain quorum.

## A Case Study

For the sake of this article, we'll assume a helm chart [^chart-name] deployed cluster of three servers. [^kind-repo]

We start by "breaking" this cluster, simply modifying the `serverNamePrefix` to rename the
servers, and update the release.

# First Indication of Trouble

## Logs

The first indication of trouble is when you see this `WRN` warning and `INF` message in the logs:

```sh
[WRN] Healthcheck failed: "JetStream has not established contact with a meta leader"
[INF] JetStream cluster no metadata leader
```

## Events

Another indication is that the NATS pods fail to progress to a ready state;
the NATS container specifically shows that it's running, but the readiness is false.

The events will show a warning with the message

```sh
Readiness probe failed: HTTP probe failed with statuscode: 503
```

## NATS CLI

Using the NATS CLI, running the `nats server report jetstream` will also show an error;
depending on the cluster state it could be any one of the following:

### Before Quorum is Lost

At first, you'll just see half the servers (with the old name) as being offline:

```sh
$ nats server report jetstream
╭───────────────────────────────────────────────────────────────────────────────────────────────────────────────────╮
│                                                 JetStream Summary                                                 │
├─────────────────────┬────────────────┬─────────┬───────────┬──────────┬───────┬────────┬──────┬─────────┬─────────┤
│ Server              │ Cluster        │ Streams │ Consumers │ Messages │ Bytes │ Memory │ File │ API Req │ API Err │
├─────────────────────┼────────────────┼─────────┼───────────┼──────────┼───────┼────────┼──────┼─────────┼─────────┤
│ x-nats-helm-kind-0  │ nats-helm-kind │ 0       │ 0         │ 0        │ 0 B   │ 0 B    │ 0 B  │ 0       │ 0       │
│ x-nats-helm-kind-1  │ nats-helm-kind │ 0       │ 0         │ 0        │ 0 B   │ 0 B    │ 0 B  │ 0       │ 0       │
│ x-nats-helm-kind-2* │ nats-helm-kind │ 0       │ 0         │ 0        │ 0 B   │ 0 B    │ 0 B  │ 0       │ 0       │
├─────────────────────┼────────────────┼─────────┼───────────┼──────────┼───────┼────────┼──────┼─────────┼─────────┤
│                     │                │ 0       │ 0         │ 0        │ 0 B   │ 0 B    │ 0 B  │ 0       │ 0       │
╰─────────────────────┴────────────────┴─────────┴───────────┴──────────┴───────┴────────┴──────┴─────────┴─────────╯

╭───────────────────────────────────────────────────────────────────────────────────────────────────────────╮
│                                        RAFT Meta Group Information                                        │
├─────────────────────────────────────────────────────┬──────────┬────────┬─────────┬────────┬────────┬─────┤
│ Name                                                │ ID       │ Leader │ Current │ Online │ Active │ Lag │
├─────────────────────────────────────────────────────┼──────────┼────────┼─────────┼────────┼────────┼─────┤
│ Server name unknown at this time (peerID: Wp0X92Zu) │ Wp0X92Zu │        │ false   │ false  │ 0s     │ 0   │
│ nats-helm-kind-0                                    │ YMpQSy04 │        │ false   │ false  │ 19.53s │ 1   │
│ nats-helm-kind-1                                    │ MGRogjE4 │        │ false   │ false  │ 0s     │ 13  │
│ x-nats-helm-kind-0                                  │ svvjmHnE │        │ true    │ true   │ 526ms  │ 0   │
│ x-nats-helm-kind-1                                  │ XCzEfWSa │        │ true    │ true   │ 525ms  │ 0   │
│ x-nats-helm-kind-2                                  │ XGX0cX6V │ yes    │ true    │ true   │ 0s     │ 0   │
╰─────────────────────────────────────────────────────┴──────────┴────────┴─────────┴────────┴────────┴─────╯

```

### After Quorum is Lost

After the quorum is lost, but before the readiness probes cause the servers to stop responding,
for a brief window of time you'll see the error in the jetstream report:

```sh
$ nats server report jetstream
╭──────────────────────────────────────────────────────────────────────────────────────────────────────────────────╮
│                                                 JetStream Summary                                                │
├────────────────────┬────────────────┬─────────┬───────────┬──────────┬───────┬────────┬──────┬─────────┬─────────┤
│ Server             │ Cluster        │ Streams │ Consumers │ Messages │ Bytes │ Memory │ File │ API Req │ API Err │
├────────────────────┼────────────────┼─────────┼───────────┼──────────┼───────┼────────┼──────┼─────────┼─────────┤
│ x-nats-helm-kind-0 │ nats-helm-kind │ 0       │ 0         │ 0        │ 0 B   │ 0 B    │ 0 B  │ 0       │ 0       │
│ x-nats-helm-kind-1 │ nats-helm-kind │ 0       │ 0         │ 0        │ 0 B   │ 0 B    │ 0 B  │ 0       │ 0       │
│ x-nats-helm-kind-2 │ nats-helm-kind │ 0       │ 0         │ 0        │ 0 B   │ 0 B    │ 0 B  │ 0       │ 0       │
├────────────────────┼────────────────┼─────────┼───────────┼──────────┼───────┼────────┼──────┼─────────┼─────────┤
│                    │                │ 0       │ 0         │ 0        │ 0 B   │ 0 B    │ 0 B  │ 0       │ 0       │
╰────────────────────┴────────────────┴─────────┴───────────┴──────────┴───────┴────────┴──────┴─────────┴─────────╯


WARNING: No cluster meta leader found. The cluster expects 6 nodes but only 3 responded. JetStream operation require at least 4 up nodes.

```

### After Servers Stop Responding

Finally, the servers will possibly stop responding, giving you the general error:

```sh
$ nats server report jetstream
nats: error: nats: no servers available for connection
command terminated with exit code 1
```

# How To Recover

## Regain Quorum

To recover, the cluster must first regain quorum.
In this case, the cluster thinks that there are six nodes [^nodes] in the cluster,
so to regain quorum there needs to be a minimum of four nodes [^nodes] reachable from each other.

The way to do this is to add one more server, which will allow quorum to be regained.
You can do this by scaling the stateful set:

```sh
$ kubectl scale --replicas=4 statefulset/nats-helm-kind
```

Which, once complete, should result in quorum being regained:

```sh
$ nats server report jetstream
╭───────────────────────────────────────────────────────────────────────────────────────────────────────────────────╮
│                                                 JetStream Summary                                                 │
├─────────────────────┬────────────────┬─────────┬───────────┬──────────┬───────┬────────┬──────┬─────────┬─────────┤
│ Server              │ Cluster        │ Streams │ Consumers │ Messages │ Bytes │ Memory │ File │ API Req │ API Err │
├─────────────────────┼────────────────┼─────────┼───────────┼──────────┼───────┼────────┼──────┼─────────┼─────────┤
│ x-nats-helm-kind-0  │ nats-helm-kind │ 0       │ 0         │ 0        │ 0 B   │ 0 B    │ 0 B  │ 0       │ 0       │
│ x-nats-helm-kind-1  │ nats-helm-kind │ 0       │ 0         │ 0        │ 0 B   │ 0 B    │ 0 B  │ 0       │ 0       │
│ x-nats-helm-kind-2* │ nats-helm-kind │ 0       │ 0         │ 0        │ 0 B   │ 0 B    │ 0 B  │ 0       │ 0       │
│ x-nats-helm-kind-3  │ nats-helm-kind │ 0       │ 0         │ 0        │ 0 B   │ 0 B    │ 0 B  │ 0       │ 0       │
├─────────────────────┼────────────────┼─────────┼───────────┼──────────┼───────┼────────┼──────┼─────────┼─────────┤
│                     │                │ 0       │ 0         │ 0        │ 0 B   │ 0 B    │ 0 B  │ 0       │ 0       │
╰─────────────────────┴────────────────┴─────────┴───────────┴──────────┴───────┴────────┴──────┴─────────┴─────────╯

╭───────────────────────────────────────────────────────────────────────────────────────────────────────────╮
│                                        RAFT Meta Group Information                                        │
├─────────────────────────────────────────────────────┬──────────┬────────┬─────────┬────────┬────────┬─────┤
│ Name                                                │ ID       │ Leader │ Current │ Online │ Active │ Lag │
├─────────────────────────────────────────────────────┼──────────┼────────┼─────────┼────────┼────────┼─────┤
│ Server name unknown at this time (peerID: Wp0X92Zu) │ Wp0X92Zu │        │ false   │ false  │ 0s     │ 0   │
│ nats-helm-kind-0                                    │ YMpQSy04 │        │ false   │ false  │ 47m27s │ 6   │
│ nats-helm-kind-1                                    │ MGRogjE4 │        │ false   │ false  │ 0s     │ 18  │
│ x-nats-helm-kind-0                                  │ svvjmHnE │        │ true    │ true   │ 461ms  │ 0   │
│ x-nats-helm-kind-1                                  │ XCzEfWSa │        │ true    │ true   │ 461ms  │ 0   │
│ x-nats-helm-kind-2                                  │ XGX0cX6V │ yes    │ true    │ true   │ 0s     │ 0   │
│ x-nats-helm-kind-3                                  │ G7oD67bf │        │ true    │ true   │ 461ms  │ 0   │
╰─────────────────────────────────────────────────────┴──────────┴────────┴─────────┴────────┴────────┴─────╯

```

## Remove Offline/Old Servers

Now you can begin cleaning up the old server records.
You can do this either with the CLI or by using NATS directly.

### CLI

Using the CLI [^kubectl-exec]:

```sh
$ nats server cluster peer-remove -f <peer ID>
```

### Using NATS Directly

You can also remove a peer directly by publishing to the JetStream API subjects:

```sh
$ nats publish '$JS.API.SERVER.REMOVE' '{"peer":"","peer_id":"YMpQSy04"}'
```

Which will send a response message on the same channel that confirms the action:

```json
{
  "type": "io.nats.jetstream.api.v1.meta_server_remove_response",
  "success": true
}
```

## Remove Temporarily Added Server

### Scale Back Down to Three Servers

Now that the number of servers is four instead of six, it's safe to scale back down to three servers,
and then remove the record of the server we temporarily added.

```sh
$ kubectl scale --replicas=3 statefulset/nats-helm-kind
```

### Remove Peer

```sh
$ nats server cluster peer-remove -f G7oD67bf
```

## Success!

Finally, the state of the cluster should be restored now, with three servers.

## About The Author

John Weldon is a Customer Solutions Architect at [Synadia Communications](https://www.synadia.com/).

[^chart-name]: The name of the helm release in this article is `nats-helm-kind`; it could be anything, often the default is just `nats`
[^kind-repo]: You can replicate the [kind][] environment I used in this article, by referring to [this][nats-helm-kind-playground] repository.
[^kubectl-exec]:
    Throughout this article I use nats-box to execute nats commands; the simple way to do it from the command line is:
    `kubectl exec -it deployment/nats-helm-kind-box -- nats <command> <args>`

    nats-box is deployed by default in the nats helm chart.

    For simplicity, I'll just show the plain NATS command in the examples.

[^nodes]: NATS Servers are also called "nodes" - sometimes interchangeably.

[helm-chart]: https://github.com/nats-io/k8s/blob/main/helm/charts/nats/README.md "HELM Chart README"
[values.yaml]: https://github.com/nats-io/k8s/blob/main/helm/charts/nats/values.yaml "default values.yaml"
[serverNamePrefix]: https://github.com/nats-io/k8s/blob/2ce9a408f17b823d51223e04e806b73cead51993/helm/charts/nats/values.yaml#L273 "in the default values.yaml"
[kind]: https://kind.sigs.k8s.io/ "kind is a tool for running local kubernetes clusters using docker"
[nats-helm-kind-playground]: https://github.com/johnweldon/nats-helm-kind-playground "scripts and config to quickly stand up a nats cluster on kind"
