+++
category = "api"
title = "Receiving Messages"
[menu.main]
    name = "Receiving Messages"
    weight = 7
    identifier = "doc-receiving-msg"
    parent = "Writing Applications"
+++

Receiving messages with NATS can be very library dependent. Some languages, like Go or Java, can provide synchronous and asynchronous APIS, while others may only support one type of subscription. In all cases, the process of subscribing involves having the client library tell the gnatsd that an application is interested in a particular subject. Under the covers, the client library will assign a unique id to each subscription. This id is used when the server sends messages to a specific subscription. Each subscription gets a unique id, so if the same connection is used multiple times for the same subject, the server will send multiple copies of the same message. When an application is done with a subscription it unsubscribes, which tells the server to stop sending messages.

### Synchronous Subscriptions

Synchronous subscriptions require the application to poll for messages. This type of subscription is easy to set-up and use, but requires the application to deal with looping if multiple messages are expected. For example, to subscribe to the subject `updates` and receive a single message you could do:

{{< partial "doc/subscribe_sync.html" >}}

### Asynchronous Subscriptions

Asynchronous subscriptions use callbacks, of some form, to notify an application when a message arrives. These subscriptions are usually easier to work with, but do represent some form of internal work and resource usage by the library. Check your libraries documentation for any resource usage associated with asynchronous subscriptions. The following example is the same as the previous one, only with asynchronous code:

{{< partial "doc/subscribe_async.html" >}}

### Unsubscribing

The client libraries provide a means to unsubscribe a previous subscription request. This process requires an interaction with the server, so for an asynchronous subscription there may be a small window of time where a message comes through, as the unsubscribe is processed by the library. Ignoring that slight edge case, the client library will clean up any outstanding messages and tell the server that the subscription is no longer used.

{{< partial "doc/unsubscribe.html" >}}

### Unsubscribing After a Specified Number of Messages

NATS provides a special form of unsubscribe that is configured with a message count, and takes effect when that many messages are sent to a subscriber. This mechanism is very useful if only a single message is expected. There are a few important things to know about auto unsubscribe. First, the message count you provide is the total message count for a subscriber. So if you unsubscribe with a count of 1, the server will stop sending messages to that subscription after it has received one. Or, if the subscriber has already received one or more messages, the unsubscribe will be immediate. This action based on history can be confusing if you try to auto unsubscribe on a long running subscription, but is logical for a new one.

> Auto unsubscribe is based on the total messages sent to a subscriber, not just the new ones.

Auto unsubscribe can also result in some tricky edge cases if a server cluster is used. The client will tell the server of the unsubscribe count when the application requests it. But if the client disconnects before the count is reached, it may have to tell another server of the remaining count. This dance between previous server notifications and new notifications on reconnect can result in unplanned behavior.

Finally, most of the client libraries also track the max message count after an auto unsubscribe request. Which means that the client will stop allowing messages to flow even if the server has miscounted due to reconnects or some other failure in the client library.

The following example unsubscribe after a single message:

{{< partial "doc/unsubscribe_auto.html" >}}

## Replying to a Message

Incoming messages have an optional reply-to field. If that field is set, it will contain a subject to which a reply is expected. In the publishing examples we sent a request for the current time, the following code will listen for that request and respond with the time:

{{< partial "doc/subscribe_w_reply.html" >}}

## Wildcards

There is no special code to subscribe with a wildcard subject. The main technique that may come in to play is to use the subject provided with the incoming message to determine what to do with the message.

For example, you can subscribe using `*` and then act based on the actual subject.

{{< partial "doc/subscribe_star.html" >}}

or do something similar with `>`:

{{< partial "doc/subscribe_arrow.html" >}}

The following example can be used to test these two subscribers. The `*` subscriber should receive at most 2 messages, while the `>` subscriber receives 4. More importantly the `time.*.east` subscriber won't receive on `time.us.east.atlanta` because that won't match.

{{< partial "doc/wildcard_tester.html" >}}

## Queues

Using queues, from a subscription standpoint, is super easy. The application simply includes a queue name with the subscription.

```viz-dot
digraph g {
  rankdir=LR
  publisher [shape=box, style="rounded", label="PUB updates"];
  subject [shape=circle, label="gnatsd"];
  sub1 [shape=box, style="rounded", label="SUB updates workers"];
  sub2 [shape=box, style="rounded", label="SUB updates workers"];
  sub3 [shape=box, style="rounded", label="SUB updates workers"];

  publisher -> subject [label="msgs 1,2,3"];
  subject -> sub1 [label="msg 2"];
  subject -> sub2 [label="msg 1"];
  subject -> sub3 [label="msg 3"];
}
```

For example, to subscribe to the queue `workers` with the subject `updates`:

{{< partial "doc/subscribe_queue.html" >}}

If you run this example with the publish examples that send to updates you will see that one of the instances gets a message, while the others you run won't. But the instance that receives the message will change.

## Receiving Structured Data

In the publishing examples we showed how to send JSON through NATs. Of course you can receive encoded data as well. Each client library may provide more or fewer tools to help with this encoding. The core traffic to gnatsd will always be byte arrays.

{{< partial "doc/subscribe_json.html" >}}