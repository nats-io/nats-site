+++
title = "Quickstart"
description = "Run the NATS server locally"
[menu.main]
  name = "Quickstart"
  weight = 2
  identifier = "quickstart"
  parent = "Getting Started With NATS"
+++

This tutorial takes you from zero to [running](#run) the current version of NATS Server (version **{{< latest >}}**) locally in your preferred environment and [sending](#send) messages to and [receiving](#receive) messages from the NATS server using a client of your choice.

## Run the NATS Server locally {#run}

You can run the NATS server [as a static binary](#binary) or [using Docker](#docker).

### Static binary {#binary}

Click on the relevant OS/processor combo for your environment, which will trigger the download of a ZIP file (or you can copy the URL and download using a tool like [wget](https://www.gnu.org/software/wget/)):

{{< downloads >}}

The unzipped directory will contain a `LICENSE` file, a `README`, and a `gnatsd` binary that you can use to run the NATS Server.

Here are some example steps for `darwin-amd64`:

```bash
wget https://github.com/nats-io/gnatsd/releases/download/v{{< latest >}}/gnatsd-v{{< latest >}}-darwin-amd64.zip
unzip gnatsd-v{{< latest >}}-darwin-amd64.zip
ls gnatsd-v{{< latest >}}-darwin-amd64
LICENSE README.md gnatsd
```

To start up the server:

```bash
./gnatsd --debug
```

This will run the NATS Server on port 4222 in debug mode. Debug mode isn't *necessary* but it will come in handy during this tutorial.

### Docker

The [Docker](https://docker.com) image for the NATS Server is available via [Docker Hub](https://hub.docker.com/_/nats/).

To start up the server, make sure that Docker is running, then:

```bash
docker run -p 4222:4222 -p 8222:8222 nats:{{< latest >}}
```

This will run the NATS Server on port 4222 in debug mode. Debug mode isn't *necessary* but it will come in handy later in this tutorial.

## Send messages to NATS using a client {#send}

All NATS messages can include the following:

* A target subject
* A reply subject (optional)
* A message payload (as an array of bytes)

The language-specific examples below show you how to send a message with a target subject `updates` and a message payload of `All is well`:

{{< partial "doc/publish_bytes.html" >}}

> For more comprehensive instructions, see the [Sending Messages](/documentation/writing_applications/publishing) guide.

## Receive messages from NATS using a client {#receive}

NATS clients receive messages from NATS by establishing *subscriptions*. With subscriptions, the client notifies the NATS server about which subject the client is interested in and then listens for messages with that subject. Messages from NATS can be received either [synchronously](#sync) or [asynchronously](#async).

The language-specific examples below show you how to receive messages with the subject `updates` both [synchronously](#sync) and [asynchronously](#async).

> For more comprehensive instructions, see the [Receiving Messages](/documentation/writing_applications/subscribing/) guide.

### Receive messages synchronously {#sync}

{{< partial "doc/subscribe_sync.html" >}}

### Receive messages ascnchronously {#async}

{{< partial "doc/subscribe_async.html" >}}

## Next steps

Congrats! You've now successfully used NATS as a message broker using a client in your preferred language. But there's much more to explore in NATS.