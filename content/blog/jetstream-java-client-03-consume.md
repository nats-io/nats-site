+++
categories = ["Clients", "Java", "JetStream"]
date = "2021-05-24"
tags = ["java", "stream", "consumer"]
title = "JetStream Consumers with the NATS.io Java Library"
author = "Scott Fauerbach"
+++

The previous entry in this series showed us how to publish messages.
This entry will start building up to subscribing by describing the configuration for consumers.

## Push vs Pull Subscription

Consumers, once created, can subscribe as either a `push` or `pull` mode. The server sends messages to push consumers while pull consumers have to ask for messages.
This is mentioned here first because consumer configuration options may apply differently depending on the type of subscription.

## Durable vs Ephemeral

A consumer can be durable or ephemeral.

A durable consumer is intended to be long-lived and the server will keep track of where the consumer is in the stream.
So if the consumer stops then restarts, it will automatically restart where it left off and the configuration used to initialize
the consumer will be remembered. A durable consumer is required when making a pull subscription and is optional
when making a push subscription.

An ephemeral consumer will only be tracked by the server while it is active and showing interest in the stream.
Again, ephemeral consumers are only allowed in push subscriptions.

For durable consumers, some options cannot be changed once the consumer is created. For ephemeral consumers, 
this doesn't really apply since they are created new every time. 

## Configuration Object
The `ConsumerConfiguration` object has a builder to simplify setting options. Here is the builder skeleton showing all the builder methods.

```
ConsumerConfiguration c = ConsumerConfiguration.builder()
    .durable(...)
    .deliverPolicy(...)
    .startSequence(...)
    .startTime(...)
    .deliverSubject(...)
    .ackPolicy(...)
    .ackWait(...)
    .maxAckPending(...)
    .replayPolicy(...)
    .maxDeliver(...)
    .filterSubject(...)
    .rateLimit(...)
    .sampleFrequency(...)
    .idleHeartbeat(...)
    .flowControl(...)
    .build();
```

As you can see, there are several options. In general, the defaults will do just fine. 
The Durable name is probably the most common option used, so in the Java client we gave several ways
to set it when making a subscription.

### Durable (Name)

By default, a consumer is ephemeral. To make the consumer durable, set the name.
In the Java client, there are two ways to set the durable name. You can set it in the Consumer Configuration, or
you can leverage the helper method in the `PushSubscribeOptions` or `PullSubscribeOptions` builders, which will
either add it to the Consumer Configuration you supply or create a default one with the durable. The value in
the Consumer Configuration object takes precedence over the value supplied in either of the Subscribe options builders. 

### Deliver Policy / Start Sequence / Start Time

When a consumer is first created, it can specify where in the stream it wants to start receiving messages.
This is the `DeliverPolicy` and it's options are as follows:

| Option  | Description  |
| --- | --- |
| All | All is the default policy. The consumer will start receiving from the earliest available message. |
| Last | The consumer will start receiving messages with the last message added to the stream, so the very last message in the stream when the server realizes the consumer is ready. |
| New | The consumer will only start receiving messages that were created after the consumer was created. |
| ByStartSequence | The consumer is required to specify the `.startSequence(...)`, the sequence number to start on. It will receive the closest available sequence if that message was removed based on the stream limit policy. | 
| ByStartTime | The consumer is required to specify the `.startTime(...)`, the time in the stream to start at. It will receive the closest available message on or after that time. | 

### Deliver Subject

The subject to deliver observed messages. Not allowed for pull subscriptions.
Deliver subject is required for queue subscribing for ephemeral consumers as it configures a subject that all the queue consumers should listen on.
For durable consumers, an internal deliver subject will be created if one is not supplied.

### Ack Policy

`Explicit` is the default policy and means that each individual message must be acknowledged.
For pull consumers, `Explicit` is the only allowed option.
For push consumers, you can choose `None`, which means you do not have to ack any messages,
or `All` which means whenever you choose to ack a message, all the previous messages received are automatically acknowledged.
You must ack within the Ack Wait window or it will be as if the ack was not received.

### Ack Wait

Ack Wait is the time in nanoseconds that the server will wait for an ack for any individual message.
If an ack is not received in time, the message will be redelivered.

### Max Ack Pending

If you have received this number of messages without acking them, the server will stop sending messages.
If the server gets 1 or more acks, it will resume sending that number of messages.
If acks don't occur in the Ack Wait period, then the server will resume starting at the messages that have not been acked.

### Replay Policy

The replay policy applies when the deliver policy is `All`, `ByStartSequence` or `ByStartTime` since those deliver policies begin reading the stream at a position other than the end.
If the policy is `Original`, the messages in the stream will be pushed to the client at the same rate that they were originally received, simulating the original timing of messages.
If the policy is `Instant` (the default), the messages will be pushed to the client as fast as possible while adhering to the Ack Policy, Max Ack Pending and the client's ability to consume those messages.

### Max Deliver

The maximum number of times a specific message will be delivered. Applies to any message that is re-sent due to ack policy.

### Filter Subject

When consuming from a stream with a wildcard subject, this allows you to select a subset of the full wildcard subject to receive messages from.

### Rate Limit

Used to throttle the delivery of messages to the consumer, in bits per second.

### Sample Frequency

Sets the percentage of acknowledgements that should be sampled for observability, 0-100

### Idle Heartbeat

If the idle heartbeat period is set, the server will send a status message with to the client when the period has elapsed but it has not received any new messages.
This lets the client know that it's still there, but just isn't receiving messages.
The Java client's `Status` object has a helper method `isHeartbeat()` that can help you identify this specific status message.

### Flow Control

Flow control is another way for the consumer to manage back pressure. Instead of relying on the rate limit, it relies on the pending limits of max messages and/or max bytes.
If the server sends the number of messages or bytes without receiving an ack, it will send a status message letting you know it has reached this limit.
Once flow control is tripped, the server will not start sending messages again until the client tells the server, even if all messages have been acknowledged.
The Java client's `Status` object has a helper method `isFlowControl()` that can help you identify this specific status message.

## About the Author

Scott Fauerbach is a member of the engineering team at [Synadia Communications](https://synadia.com).
