+++
date = "2015-09-27"
title = "Auto Pruning Clients"
description = ""
category = "server"
[menu.main]
  name = "Auto Pruning Clients"
  weight = 8
  identifier = "server-gnatsd-prune"
  parent = "server"
+++

# NATS Auto Pruning of Clients

To support resiliency and high availability, NATS provides built-in mechanisms to automatically prune the registered listener interest graph that is used to keep track of subscribers, including slow consumers and lazy listeners.

## Slow consumers

NATS automatically handles a slow consumer. If a client is not processing messages quick enough, the NATS server cuts it off.

Each of the connections has a pending state. The NATS server does an accounting on the number of bytes the subscriber has yet to process. When it reaches max pending, which is a constant (default 10 MB), the NATS server disconnects the client. The max byte threshold is [configurable](/documentation/server/gnatsd-config/).

## Lazy listeners

To support scaling, NATS provides for auto-pruning of client connections. If a subscriber does not respond to ping requests from the server within the [ping-pong interval](/documentation/internals/nats-protocol/), the client is cut off (disconnected). The client will need to have reconnect logic to reconnect with the server.
