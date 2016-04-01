+++
date = "2015-09-27"
title = "Publish Subscribe"
category = "concepts"
[menu.main]
  name = "Publish Subscribe"
  weight = 2
  identifier = "concepts-nats-pub-sub"
  parent = "concepts"
+++

# NATS Publish Subscribe

NATS implements a publish subscribe messaging model. NATS publish subscribe is a one-to-many communication. A publisher sends a message on a subject. Any active subscriber listening on that subject receives the message. Subscribers can register interest in wildcard subjects.

If a subscriber is not listening on the subject (no subject match), or is not active when the message is sent, the message is not received. NATS is a fire-and-forget messaging system. If you need higher levels of service, you build it into the client.

In an asynchronous exchange, messages are delivered to the subscriber's message handler. If there is no handler, the subscription is synchronous and the client may be blocked until it can process the message.

![drawing](/documentation/img/nats-pub-sub.png)
