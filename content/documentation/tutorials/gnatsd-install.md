+++
date = "2015-09-27"
title = "Install NATS Server"
description = ""
category = "tutorials"
[menu.documentation]
  name = "Install NATS Server"
  weight = 2
  identifier = "tutorial-gnatsd-install"
  parent = "tutorials"
+++

# Install and Run NATS Server

In this tutorial you install and run the NATS server (`gnatsd`). You can follow this same procedure anytime you want to run the NATS server.

## Prerequisite

- [Set up your Go environment](/documentation/tutorials/go-install/)

## Instructions

**1. Install the NATS server.**

```
go get github.com/nats-io/gnatsd
```

**2. Start the NATS server.**

You can invoke the NATS server binary, with no options and no configuration file, to start a server with acceptable standalone defaults (no authentication, no clustering).

```
gnatsd
```

When the server starts successfully, you will see that the NATS server listens for client connections on TCP Port 4222:

```
[1] 2015/08/12 15:18:22.301550 [INF] Starting gnatsd version 0.6.4
[1] 2015/08/12 15:18:22.301762 [INF] Listening for client connections on 0.0.0.0:4222
[1] 2015/08/12 15:18:22.301769 [INF] gnatsd is ready
```

**3. Start the NATS server with monitoring enabled.**

The NATS server exposes a monitoring interface on port 8222.

```
gnatsd -m 8222
```

If you run the NATS server with monitoring enabled, you see the following messages:

```
[5] 2015/06/30 19:28:58.631339 [INF] Starting gnatsd version 0.6.0
[5] 2015/06/30 19:28:58.631442 [INF] Starting http monitor on port 8222
[5] 2015/06/30 19:28:58.631633 [INF] Listening for client connections on 0.0.0.0:4222
[5] 2015/06/30 19:28:58.631714 [INF] gnatsd is ready
```

**4. Start the NATS server with routes enabled.**

If routing is enabled, route (server) connections listen on port 6222.

```
[1] 2015/08/12 15:18:22.301550 [INF] Starting gnatsd version 0.6.4
[1] 2015/08/12 15:18:22.301594 [INF] Starting http monitor on port 8222
[1] 2015/08/12 15:18:22.301707 [INF] Listening for route connections on :6222
[1] 2015/08/12 15:18:22.301762 [INF] Listening for client connections on 0.0.0.0:4222
[1] 2015/08/12 15:18:22.301769 [INF] gnatsd is ready
```
