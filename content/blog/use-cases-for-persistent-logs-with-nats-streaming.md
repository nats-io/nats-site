# use-cases-for-persistent-logs-with-nats-streaming

+++ categories = \["Engineering"\] date = "2017-09-20" tags = \["nats", "guest post", "Golang", "technical"\] title = "Guest Post: Use cases for persistent logs with NATS Streaming" author = "Byron Ruth"

+++

## What are persistent logs?

In this context, a log is an ordered sequence of messages that you can append to, but cannot go back and change existing messages. The persistent bit simply means that they are remembered and potentially durable \(on disk\) beyond server restarts.

## What is NATS Streaming?

[NATS Streaming](http://nats.io/documentation/streaming/nats-streaming-intro/) is a lightweight, streaming platform built on top of [NATS](http://nats.io/) that provides an API for persistent logs.

A few of its features include:

* Lightweight, written in Go
* Single binary, zero runtime dependencies
* Ordered, log-based persistence
* At-least-once delivery model
* Automatic subscriber offset tracking
* Support to replay messages in a stream

These properties are similar to what [Apache Kafka](https://kafka.apache.org/) offers in terms of ordered, log-based, persistence streams. There are certainly differences between the two systems, but we won't be discussing them here. In my opinion, the best feature of NATS Streaming \(and NATS\) is the simplicity of operating it and the client API. If you want to learn more, leave a comment :\)

## Uses cases

I am going to assume basic knowledge of the [publish-subscribe pattern](https://en.wikipedia.org/wiki/Publish–subscribe_pattern), which is the core API provided by NATS Streaming. But even if not, you shouldn't have trouble following along.

Below are the list of use cases that can be solved using specific variants of the publish-subscribe pattern. I will show how these can be solved using the Subscription API NATS Streaming provides, and discuss the semantics and guarantees provided.

From the vantage point of the subscriber...

* "I just want to receive messages off a stream"
* "I want to pick up where I left off in case I disconnect"
* "I am new and want to read the entire history of the stream"
* "I want exactly once processing"
* "I want to share the work of processing messages"

## Setup NATS Streaming

If you want to code along and try out these patterns, [download a release of NATS Streaming from GitHub](https://github.com/nats-io/nats-streaming-server). There is also an [official Docker image called nats-streaming](https://hub.docker.com/_/nats-streaming/).

Assuming you downloaded the single binary, you can unpack it and run it with the following options:

```text
$ nats-streaming-server \
  --store file \
  --dir ./data \
  --max_msgs 0 \
  --max_bytes 0
```

By default, NATS Streaming uses an in-memory store. The `--store` option is used to change this to a file-based which can survive restarts. The `--max_msgs` and `--max_bytes` are set to zero to make all messages retained for all channels. Otherwise the server will default to 1 million messages or ~100 MB in size, in which case the channel will be pruned of messages to go below whichever limit was reached \(thus deleting history\).

Once that is running in a shell, we can starting writing some code. For the code examples, I will be using the [Go client](https://github.com/nats-io/go-nats-streaming). There are several official clients and a few community-built ones on the [downloads page](http://nats.io/download/).

## Boilerplate code

First we need to establish a connection.

```go
package main

import (
    "log"
    stan "github.com/nats-io/go-nats-streaming"
)

// Convenience function to log the error on a deferred close.
func logCloser(c io.Closer) {
    if err := c.Close(); err != nil {
        log.Printf("close error: %s", err)
    }
}


func main() {
    // Specify the cluster (of one node) and some client id for this connection.
    conn, err := stan.Connect("test-cluster", "test-client")
    if err != nil {
        log.Print(err)
        return
    }
    defer logCloser(conn)

    // Now the patterns..
}
```

## "I just want to receive messages off a stream"

This use case is solved using a subscription with the default configuration.

```go
handle := func(msg *stan.Msg) {
    // Print message data as a string to stdout.
    fmt.Printf("%s", string(msg.Data))
}

sub, err := conn.Subscribe(
  "stream-name",
  handle,
)
if err != nil {
    log.Print(err)
    return
}
defer logCloser(sub)
```

It is really that simple. NATS Streaming guarantees messages are received and processed in order. One caveat \(which will be addressed in a later example\) is that if there is an issue with acknowledging \(ACK-ing\) that a message has been processed to the server \(such as a disconnect or timeout\), then the message will be redelivered later \(after earlier messages were processed\).

Likewise if there is an error while processing, by default there is no way to not send an ACK. This can be solved by adding a subscription option: `stan.SetManualAckMode()`

```go
handle := func(msg *stan.Msg) {
    // If the msg is handled successfully, you can manually
    // send an ACK to the server. More importantly, if processing
    // fails, you can choose *not* send an ACK and you will receive
    // the message again later.

    // This will only fail if the connection with the server
    // has gone awry.
    if err := msg.Ack(); err != nil {
        log.Prinf("failed to ACK msg: %d", msg.Sequence)
    }
}

conn.Subscribe(
    "stream-name",
    handle,
    stan.SetManualAckMode(),
)
```

You may be thinking, why would you want to get the message redelivered if it failed the first time? This depends on what kind of failure, but if it was a temporary failure then the second or third time may work. What about if it is a bug in your code and it will never succeed?

## "I want to pick up where I left off in case I disconnect"

With the default options, a subscription is only tracked while it is online. That is, if the client re-subscribes later, it receives only new messages. It won't receive any messages that were published while it was offline.

For certain use cases, it may be desirable to "pick up where you left" such as work queues, \[data replication streams\]\([https://en.wikipedia.org/wiki/Replication\_\(computing](https://en.wikipedia.org/wiki/Replication_%28computing)\)\), and [CQRS architectures](https://martinfowler.com/bliki/CQRS.html).

Making a subscriber "resumable" is as simple as adding another subscription option.

```go
handle := func(msg *stan.Msg) {
    // ...
}

conn.Subscribe(
    "stream-name",
    handle,
    stan.DurableName("i-will-remember"),
)
```

The `stan.DurableName` option takes a name you provide for that particular subscription. It is bound to the stream, so you can reuse the same durable name for different streams and the offset of each stream will be tracked separately.

At the end of the previous section, I asked what happens if there is a bug if your handler code. With a durable subscription, you now have the freedom to bring the subscriber offline, fix the bug, and bring it back online resuming where it left off.

To know whether the handler is failing, you should be logging these errors, but you can also immediately disconnect when the first _non-retryable_ error occurs.

```go
// Declare above so the handler can reference it.
var sub stan.Subscription

handle := func(msg *stan.Msg) {
    err := process(msg)

    // Close subscription on error.
    if err != nil {
        logCloser(sub)
    }
}

sub, _ = conn.Subscribe(
    "stream-name",
    handle,
    stan.DurableName("i-will-remember"),
)
```

Since messages are processed in ordered, closing the subscription on the first error will prevent subsequent messages from being processed. On reconnect, the message that failed will be redelivered followed by all new messages.

This approach also guarantees fully ordered processing _no matter what_. Messages beyond the failure won't be processed, thus a redelivery can't be interleaved with new messages.

This guaranteed ordering can also be achieved using the MaxInFlight option along with manual ACK-ing.

```go
handle := func(msg *stan.Msg) {
    err := process(msg)
    if err == nil {
        msg.Ack()
    }
}

conn.Subscribe(
    "stream-name",
    handle,
    stan.DurableName("i-will-remember"),
    stan.MaxInflight(1),
    stan.SetManualAckMode(),
)
```

Even without closing the subscription, this guarantees messages will be processed and retried in order since only one message is "in flight" at a time. The past examples did not have this restriction and thus multiple messages would be queued up to be processed.

## "I want exactly once processing"

A small oversight in the above two examples is what happens if processing succeeds, but the ACK fails? NATS Streaming has an "at-least-once" delivery model which means it will continue to redeliver the same message if the server doesn't get the acknowledgment.

To satisfy this case, the client has to take on some responsibility of retaining the last message it processed successfully.

```go
var lastProcessed uint64

handle := func(msg *stan.Msg) {    
    // Only process messages greater than the last one processed.
    // If it has been seen, skip to acknowledge it to the server.
    if msg.Sequence > lastProcessed {
        if err := process(msg); err != nil {
            // Log error and/or close subscription.
            return
        }

        // Processing successful, set the `lastProcessed` value.
        atomic.SwapUnint64(&lastProcessed, msg.Sequence)
    }

    // ACK with the server.
    msg.Ack()
}

conn.Subscribe(
    "stream-name",
    handle,
    stan.DurableName("i-will-remember"),
    stan.MaxInflight(1),
    stan.SetManualAckMode(),
)
```

The server maintains the last message ID that was acknowledged by the client, but to ensure exactly once processing, the client also has to maintain its view of the world. For this to be true after restarts, the client would need to persist the lastProcessed value someone and load it on start. But this could be as simple as a local file to contains the ID of the message that was last processed.

## "I want to read the entire history of the stream"

This use case is most applicable to consumers that want to build some internal state based on the stream. In fact, this approach is exactly how many databases work in maintaining their internal indexes to support queries. All changes are written to a log first \(for durability\), and then an internal process applies those changes to in-memory indexes to support fast lookups.

Unless you are building a one-off index, in general you want to use a durable subscription so on restart, only a small set of the changes needs to be processed. Starting from the beginning is just another option.

```go
handle := func(msg *stan.Msg) {
    // ...
}

conn.Subscribe(
    "stream-name",
    handle,
    stan.DurableName("i-will-remember"),
    stan.DeliverAllAvailable(),
)
```

This is a nice pattern to use when you want to deploy a new version of the internal state that requires processing old messages \(because you discovered a bug or are applying more features, etc.\). This can be done offline and take as long as it needs. Once built, it can be deployed alongside the old version and traffic can be routed over to the new version.

## "I want to share the work of processing messages"

So far, each use case only needed a single subscriber to do the work since ordering was implied to be important in these cases \(maybe with the exception of the first\). However if ordering is not important or message processing can be done in parallel \(and maybe reconciled later\), then you can take advantage of the "queue subscriber".

The queue subscriber enables multiple clients to subscribe to the same stream with the same "queue name" and messages will be distributed to each member of the queue group.

```go
handle := func(msg *stan.Msg) {
    // ...
}

conn.QueueSubscribe(
    "stream-name",
    "queue-name",
    handle,
    // options: durable, manual ack, etc.
)
```

All the options mentioned above still apply, including durability. Just add a DurableName option and you have a durable queue subscription.

## Epilogue

### Always use `SetManualAckMode()`

This provides control over acking even though it adds a couple extra lines to the handle function. If nothing else, an ACK failure can be logged which is [not currently being done with implicit ACKs](https://github.com/nats-io/go-nats-streaming/blob/master/stan.go#L467-L473).

### Start with the messages

Before assuming everything needs to be durable, it is important to think about the types of messages being handled. Specifically, are they time sensitive in any way? If so, then either the subscriber does not need to be durable or if it is, then the handle function needs to be aware of this and skip expired messages.

Likewise, think about if total ordering is actually required. Basically if any message in the stream is dependent on the processed result of a previous one, then total ordering is required. This is when `MaxInflight(1)` should be used or the subscription should be auto-closed on an error.

### "Exactly once" with QueueSubscribe

The example of "exactly once" only works with a single subscriber. For a "queue subscription", the `lastProcessed` ID would need to be centrally \(and atomically\) accessible by all members of the queue subscription. If this is desirable, the simplest approach would be to use a shared key-value store that support atomic operations on setting a value.

### Example simulations

I put together [some examples](https://github.com/bruth/code-examples/tree/master/patterns-nats-streaming) that highlight a few of the scenarios discussed above. Runnable examples are provided as well as the output in the README to illustrate the behavior.

