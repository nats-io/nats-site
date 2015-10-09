+++
date = "2015-09-27"
title = "Request Reply"
category = "concepts"
[menu.main]
  name = "Request Reply"
  weight = 3
  identifier = "concepts-nats-req-rep"
  parent = "concepts"
+++

# NATS Request Reply

NATS supports two flavors of request reply messaging: point-to-point or one-to-many. Point-to-point involves the fastest or first to respond. In a one-to-many exchange, you set a limit on the number of responses the requestor may receive.

In a request-response exchange, publish request operation publishes a message with a reply subject expecting a response on that reply subject. You can request to automatically wait for a response inline.

The request creates an inbox and performs a request call with the inbox reply and returns the first reply received. This is optimized in the case of multiple responses.

![drawing](/documentation/img/nats-req-rep.png)
