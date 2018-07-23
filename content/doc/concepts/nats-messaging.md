+++
date = "2015-09-27"
title = "NATS Messaging"
category = "concepts"
[menu.main]
  name = "Messaging"
  weight = 1
  identifier = "concepts-nats-messaging-1"
  parent = "Concepts and Architecture"
+++

# NATS Messaging

NATS messaging involves the electronic exchange of data among computer applications.

NATS provides a layer between the application and the underlying physical network. Application data is encoded as a message and sent by the publisher. The message is received, decoded, and processed by one or more subscribers. A subscriber can process a NATS message [asynchronously](#async) or [synchronously](#sync).

```viz-dot
graph g {
  graph [splines=ortho, nodesep=1];

  publisher [shape="record", label="{Application 1 | <nats> NATS Publisher}"];
  application [shape="record", label="{Application 3 | <nats>  }"];
  gnatsd [shape="box", label="", width=4, height=0, penwidth=1];
  subscriber [shape="record", label="{<nats> NATS Subscriber | Appliation 2}"];

  publisher:nats -- gnatsd [penwidth=2];
  application:nats -- gnatsd;
  gnatsd -- subscriber:nats [penwidth=2, dir="forward"];
}
```

NATS makes it easy for programs to communicate across different environments, languages, and systems because all a client has to do is parse the message. NATS lets programs share common message-handling code, isolate resources and interdependencies, and scale by easily handling an increase in message volume.

## Asynchronous processing <a name="async"></a>

Asynchronous processing uses a callback message handler to process messages. When a message arrives, the registered callback handler receives control to process the message. The client or consuming application is not blocked from performing other work while it is waiting for a message. Asynchronous processing lets you create multi-threaded dispatching designs.

## Synchronous processing <a name="sync"></a>

Synchronous processing requires that application code explicitly call a method to process an incoming message. Typically an explicit call is a blocking call that suspends processing until a message becomes available. If no message is available, the period for which the message processing call blocks is set by the client. Synchronous processing is typically used by a server whose purpose is to wait for and process incoming request messages, and to send replies to the requesting application.
