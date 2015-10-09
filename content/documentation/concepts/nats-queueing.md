+++
date = "2015-09-27"
title = "Queueing"
category = "concepts"
[menu.main]
  name = "Queueing"
  weight = 4
  identifier = "concepts-nats-queueing"
  parent = "concepts"
+++

# NATS Queueing

NATS supports message queueing using point-to-point (one-to-one) communication.

To create a message queue, subscribers register a queue name. All subscribers with the same queue name form the queue group. As messages on the registered subject are published, one member of the group is chosen randomly to receive the message. Although queue groups have multiple subscribers, each message is only consumed by only one.

Queue subscribers can be asynchronous, in which case the message handler callback function processes the delivered message. Synchronous queue subscribers must build in logic to processes the message.

![drawing](/documentation/img/nats-queue.png)
