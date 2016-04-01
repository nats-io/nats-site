+++
date = "2015-09-27"
title = "Monitor and Debug NATS"
description = ""
category = "tutorials"
[menu.documentation]
  name = "Monitor and Debug NATS"
  weight = 8
  identifier = "tutorial-nats-monitoring"
  parent = "tutorials"
+++

# Monitor and Debug NATS

It is easy to monitor the NATS server. When the monitoring port is enabled, the NATS server runs a lightweight web server on port 8222 with has several endpoints that return JSON objects.

## Prerequisites

- [Set up your Go environment](/documentation/tutorials/go-install/)
- [Installed the NATS server](/documentation/tutorials/gnatsd-install/)

## Instructions

**1. In a terminal, CD to the NATS server directory.**

```
cd $GOPATH/src/github.com/nats-io/gnatsd
```

**2. Start the NATS server with monitoring enabled.**

```
gnatsd -m 8222
```

**3. Verify that the NATS server starts with the HTTP monitor on port 8222.**

```
[4528] 2015/08/19 20:09:58.572939 [INF] Starting gnatsd version 0.6.4
[4528] 2015/08/19 20:09:58.573007 [INF] Starting http monitor on port 8222
[4528] 2015/08/19 20:09:58.573071 [INF] Listening for client connections on 0.0.0.0:4222
[4528] 2015/08/19 20:09:58.573090 [INF] gnatsd is ready
```

**4. Explore the monitoring endpoints.**

The endpoint [http://localhost:8222/varz](http://localhost:8222/varz) reports various general statistics. If you run a subscriber and refresh the endpoint, you see that the number of connections changes from 0 to 1.

The endpoint [http://localhost:8222/connz](http://localhost:8222/connz) show details about the connections. Launch a publisher and refresh the endpoint to see the statistics. The [http://localhost:8222/varz](http://localhost:8222/varz) shows the number of messages processed by the server.

Launch another subscriber and check out the [http://localhost:8222/subscriptionsz](http://localhost:8222/subscriptionsz) endpoint. You’ll see that there are two subscribers. Publish more messages and monitor the results using the various endpoints. The [http://localhost:8222/routz](http://localhost:8222/routz) endpoint shows the current routes.
