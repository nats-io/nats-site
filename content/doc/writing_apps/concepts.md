+++
title = "NATS Messaging Concepts"
category = "concepts"
[menu.main]
  name = "Concepts"
  weight = 1
  identifier = "doc-concepts"
  parent = "Writing Apps"
+++

NATS messaging involves the electronic exchange of data among computer applications.

NATS provides a layer between the application and the underlying physical network. Application data is encoded as a message and sent by the publisher. The message is received, decoded, and processed by one or more subscribers. A subscriber can process a NATS message synchronously or asynchronously, depending on the client library used.

Asynchronous processing uses a callback message handler to process messages. When a message arrives, the registered callback handler receives control to process the message. The client or consuming application is not blocked from performing other work while it is waiting for a message. Asynchronous processing lets you create multi-threaded dispatching designs.

Synchronous processing requires that application code explicitly call a method to process an incoming message. Typically an explicit call is a blocking call that suspends processing until a message becomes available. If no message is available, the period for which the message processing call blocks is set by the client. Synchronous processing is typically used by a server whose purpose is to wait for and process incoming request messages, and to send replies to the requesting application.

```viz-dot
graph g {
  graph [splines=ortho, nodesep=1];

  publisher [shape="record", label="{Application 1 | <nats> NATS Publisher}"];
  application [shape="record", label="{Application 3 | <nats>  }"];
  gnatsd [shape="box", label="", width=4, height=0, penwidth=1];
  subscriber [shape="record", label="{<nats> NATS Subscriber | Application 2}"];

  publisher:nats -- gnatsd [penwidth=2];
  application:nats -- gnatsd;
  gnatsd -- subscriber:nats [penwidth=2, dir="forward"];
}
```

NATS makes it easy for programs to communicate across different environments, languages, and systems because all a client has to do is parse the message. NATS lets programs share common message-handling code, isolate resources and interdependencies, and scale by easily handling an increase in message volume.

## Publish Subscribe

NATS implements a publish subscribe message distribution model. NATS publish subscribe is a one-to-many communication. A publisher sends a message on a subject. Any active subscriber listening on that subject receives the message. Subscribers can register interest in wildcard subjects. NATS and NATS Streaming combine to offer two qualities of service:

- **At Most Once Delivery (NATS w/TCP reliability)** - In the basic NATS platform, if a subscriber is not listening on the subject (no subject match), or is not active when the message is sent, the message is not received. NATS is a fire-and-forget messaging system. If you need higher levels of service, you can either use [NATS Streaming](/documentation/streaming/nats-streaming-intro/), or build the additional reliability into your client(s) yourself.

- **At Least Once Delivery ([NATS Streaming](/documentation/streaming/nats-streaming-intro/))** - Some applications require higher levels of service and more stringent delivery guarantees, at the potential cost of lower message throughput and higher end-to-end delivery latency. These applications rely on the underlying messaging transport to ensure that messages are delivered to subscribers irrespective of network outages or whether or not a subscriber is offline at a particular instant in time.

```viz-dot
digraph g {
  rankdir=LR
  publisher [shape=box, style="rounded", label="Publisher"];
  subject [shape=circle, label="Subject"];
  sub1 [shape=box, style="rounded", label="Subscriber"];
  sub2 [shape=box, style="rounded", label="Subscriber"];
  sub3 [shape=box, style="rounded", label="Subscriber"];

  publisher -> subject [label="msg1"];
  subject -> sub1 [label="msg1"];
  subject -> sub2 [label="msg1"];
  subject -> sub3 [label="msg1"];
}
```

## Request Reply

NATS supports two flavors of request reply messaging: point-to-point or one-to-many. Point-to-point involves the fastest or first to respond. In a one-to-many exchange, you set a limit on the number of responses the requestor may receive.

In a request-response exchange, publish request operation publishes a message with a reply subject expecting a response on that reply subject. You can request to automatically wait for a response inline.

The request creates an inbox and performs a request call with the inbox reply and returns the first reply received. This is optimized in the case of multiple responses.

```viz-dot
digraph g {
  rankdir=LR

  subgraph {
    publisher [shape=box, style="rounded", label="Publisher"];
  }

  subgraph {
    subject [shape=circle, label="Subject"];
    reply [shape=circle, label="Reply"];
    {rank = same subject reply}
  }

  subgraph {
    sub1 [shape=box, style="rounded", label="Subscriber"];
    sub2 [shape=box, style="rounded", label="Subscriber"];
    sub3 [shape=box, style="rounded", label="Subscriber"];
  }

  publisher -> subject [label="msg1"];
  publisher -> reply [style="invis", weight=2];
  reply -> sub3 [style="invis", weight=2];
  subject -> sub1 [label="msg1", style="dotted"];
  subject -> sub2 [label="msg1", style="dotted"];
  subject -> sub3 [label="msg1"];
  sub3 -> reply;
  reply -> publisher;
}
```

## Queue Subscribers & Sharing Work

NATS provides a load balancing feature called queue subscriptions. Using queue subscribers will load balance message delivery across a group of subscribers which can be used to provide application fault tolerance and scale workload processing.

To create a queue subscription, subscribers register a queue name. All subscribers with the same queue name form the queue group. As messages on the registered subject are published, one member of the group is chosen randomly to receive the message. Although queue groups have multiple subscribers, each message is consumed by only one.

Queue subscribers can be asynchronous, in which case the message handler callback function processes the delivered message. Synchronous queue subscribers must build in logic to process the message. Queue subscribers are ideal for auto scaling as you can add or remove them anytime, without any configuration changes or restarting the server or clients.

```viz-dot
digraph g {
  rankdir=LR
  publisher [shape=box, style="rounded", label="Publisher"];
  subject [shape=circle, label="Queue"];
  sub1 [shape=box, style="rounded", label="Subscriber"];
  sub2 [shape=box, style="rounded", label="Subscriber"];
  sub3 [shape=box, style="rounded", label="Subscriber"];

  publisher -> subject [label="msgs 1,2,3"];
  subject -> sub1 [label="msg 2"];
  subject -> sub2 [label="msg 1"];
  subject -> sub3 [label="msg 3"];
}
```
