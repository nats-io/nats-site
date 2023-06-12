+++
date = "2023-06-12"
draft = false
title = "Preview Release New JetStream Client API"
author = "Tomasz Pietrek"
categories = ["General"]
tags = ["NATS", "API", "JetStream"]
+++

# Preview Release of the New JetStream Client API

The NATS Maintainers at Synadia are excited to announce the **preview release** of the latest major improvement to the NATS client libraries - the new JetStream API. This is an important milestone to continue delivering developer-friendly, flexible, and comprehensive tooling for NATS. We’ve listened to your feedback and are confident this new API will simplify JetStream-related development and adoption.

The two-week preview period, starting June 12, 2023, is an opportunity for you to try the new API and provide feedback to refine and polish the client APIs. During the preview period, subtle breaking changes will likely be made. The client releases following the preview period will then be considered stable.

## How did we get here?

With our first JetStream API implementation, we tried to make it closely resemble the Core NATS API, especially when it came to how users retrieved messages from streams and consumers. This led to the introduction of a `Subscribe` method on the JetStream context which implicitly managed the consumer lifecycle.

Unfortunately, as JetStream grew in features and capabilities, this method was hiding more and more complexity, making it difficult to understand its behavior.

Observing developer confusion and helping many people in the NATS Slack led to the decision to re-design the JetStream client API from the ground up, including method signatures, configuration options, and error handling. The goal was to focus on simplicity while still providing flexibility as well as ensuring the design and naming followed language-specific best practices.

Another important change is the focus on Pull Consumers. This change simplifies decision-making around the NATS setup and eliminates the dilemma of choosing between Pull or Push Consumers, all without compromising API patterns available to users.

## The Anatomy of the New API

To create an API that’s easy to grasp, yet powerful and faithful to client language idioms, we designed the API around pivotal reference points that align with NATS architecture:

* JetStream Context
* Streams
* Consumers

Let’s delve into their functionalities using the [Go client](https://pkg.go.dev/github.com/nats-io/nats.go@v1.26.0/jetstream) as an example.

### JetStream Context

Just like in the previous JetStream API, you initiate operations by creating a JetStream Context. Note how the new API exists in a separate package that is imported.

```go
nc, err := nats.Connect(“demo.nats.io”)
js, err := jetstream.New(nc)
```

Like the existing API, this context provides all the management capabilities such as creating, retrieving, and deleting JetStream resources.

Here’s how you can retrieve a stream using the new API:

```go
nc, err := nats.Connect(“demo.nats.io”)
js, err := jetstream.New(nc)
stream, err := jetstream.Stream(ctx, “STREAM”)
```

That returned a Stream object.

### Stream

Stream is now a first-class object providing a set of methods for operating on a specific stream, allowing you to manage consumers, purge streams, and fetch information about the stream, or a specific message by its sequence.

Here’s how you retrieve a consumer:

```go
nc, err := nats.Connect(“demo.nats.io”)
js, err := jetstream.New(nc)
stream, err := jetstream.Stream(ctx, “STREAM”)
consumer, err := stream.Consumer(ctx, “CONSUMER”)
```
As shown above, you can retrieve a consumer from a stream just as you retrieved a stream from the context.

### Consumer

Similar to the stream above, a consumer is an object providing various methods for accessing information, but also provides a set of new mechanisms for fetch messages, including:

* next - get only next message
* fetch - get a specified number of messages
* consume - endless process that provides messages to the user in an optimized fashion

The most interesting way to fetch messages is `consume`. If you think that that’s how the old `Subscribe` worked, you are right (except it does not create any consumers).

The difference however is that it not only optimizes the process while allowing fine-grained control via options, but it also works for Pull Consumers!

This means you no longer need to loop fetch operations for Pull Consumers. Simply call ‘consume’ on a Pull Consumer, and the client will handle the rest.

Here is an example:

```go
consumer, err := stream.Consumer(ctx, “CONSUMER”)
cons, _ := consumer.Consume(ctx, func(msg jetstream.Msg) {
    msg.Ack()
    fmt.Printf(“Received a JetStream message: %s\n”, string(msg.Data()))
})
defer cons.Stop()
```

Those examples are based on the Go client, but thanks to Context, Stream, and Consumer orientation points and the fact that each client API follows its language idioms, you should have no issues writing the above code in your language of choice.

Also, definitely check [NATS By Example](https://natsbyexample.com) where you can find examples in various languages along with a [migration guide to the new API](https://natsbyexample.com/examples/jetstream/api-migration/go).

## Embrace the New JetStream API Today

The new API preview has been released for our major clients:

* Go
* Nodejs/Deno/WebSocket
* Rust
* Java
* .NET

We firmly believe that this new API represents a significant step forward in simplifying and enhancing your interaction with JetStream. We encourage you to embrace the new JetStream API and to start enjoying these improvements today. Dive in, explore the new functionalities, and discover how our new API can help you build more robust and flexible applications.

Your feedback has always been crucial to us, and we are eager to hear about your experiences with the new JetStream API. Happy coding!

## About the Author

[Tomasz Pietrek](https://www.linkedin.com/in/tomasz-pietrek/) is a Software Engineer at Synadia, working on various topics around NATS, from the NATS Server and Rust Client to abstraction layers like the microservices framework and Object Store. His journey to NATS was built on a broad spectrum of roles in the technology industry, having served as Principal Architect, Tech Lead, and Solution Architect in various fields, from Fintech and Industry 4.0 to eCommerce and Telecommunications. Today, Tomasz continues his tech journey focusing on innovative solutions and growth, leveraging NATS.
