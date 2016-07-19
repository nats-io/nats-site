+++
date = "2015-09-27"
title = "Install NATS Streaming Server"
description = ""
category = "tutorials"
[menu.main]
  name = "Install NATS Streaming Server"
  weight = 2
  identifier = "tutorial-nats-streaming-install"
  parent = "Streaming"
+++

# Install and Run NATS Streaming Server

In this tutorial you install and run the NATS server (`nats-streaming-server`). You can follow this same procedure anytime you want to run the NATS Streaming server.

## Prerequisite

- [Set up your Go environment](/documentation/tutorials/go-install/)

## Instructions

**1. Install the NATS Streaming server.**

To install the latest released version of the NATS Streaming server, download one of the pre-built release binaries which are available for OSX, Linux (x86-64/ARM), and Windows. Instructions for using these binaries are on the [GitHub releases page](https://github.com/nats-io/nats-streaming-server/releases). 

Another way to install NATS is using Go:

```
go get github.com/nats-io/nats-streaming-server
```

Note that this method may not install the latest released version.

**2. Start the NATS Streaming server.**

You can invoke the NATS Streaming server binary, with no options and no configuration file, to start a server with acceptable standalone defaults (no authentication, no clustering).

```
nats-streaming-server
```

When the server starts successfully, you will see that the NATS Streaming server listens for client connections on TCP Port 4222:

```
[11455] 2016/06/10 12:31:07.880904 [INF] Starting nats-streaming-server[test-cluster] version 0.0.1.alpha
[11455] 2016/06/10 12:31:07.883148 [INF] Starting nats-server version 0.8.2
[11455] 2016/06/10 12:31:07.883170 [INF] Listening for client connections on localhost:4222
[11455] 2016/06/10 12:31:07.886044 [INF] Server is ready
[11455] 2016/06/10 12:31:07.967026 [INF] STAN: Message store is MEMORY
[11455] 2016/06/10 12:31:07.967047 [INF] STAN: Maximum of 1000000 will be stored
```

**3. Start the NATS server with monitoring enabled.**

The NATS Streaming server exposes a monitoring interface on port 8222.

```
nats-streaming-server -m 8222
```

If you run the NATS Streaming server with monitoring enabled, you see the following messages:

```
[11456] 2016/06/10 12:31:07.880904 [INF] Starting nats-streaming-server[test-cluster] version 0.0.1.alpha
[11456] 2016/06/10 12:31:07.883148 [INF] Starting nats-server version 0.8.2
[11456] 2016/06/10 12:32:13.883156 [INF] Starting http monitor on :8222
[11456] 2016/06/10 12:31:07.883170 [INF] Listening for client connections on localhost:4222
[11456] 2016/06/10 12:31:07.886044 [INF] Server is ready
[11456] 2016/06/10 12:31:07.967026 [INF] STAN: Message store is MEMORY
[11456] 2016/06/10 12:31:07.967047 [INF] STAN: Maximum of 1000000 will be stored
```

