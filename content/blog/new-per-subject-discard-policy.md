+++
categories = ["Engineering", "General"]
date = "2022-11-14"
tags = ["NATS", "JetStream", "exactly-once", "Stream processing", "deduplication","Kafka","Pulsar"]
title = "Infinite message deduplication in JetStream"
author = "Jean-Noël Moyne"
+++

One feature, released in the [v2.9.0 NATS server
]https://nats.io/blog/nats-server-29-release/), that flew under the radar was the new `DiscardNewPerSubject` option on a stream. This blog post will describe this new feature as well as give a practical example of how it can be used to provide exactly-once message publication quality of service (QoS) through *infinite* deduplication that goes beyond the existing time-based deduplication feature of JetStream as well as many other streaming systems, such as Kafka.

In order to understand what this new feature is (bear with me here, as it introduces a subtle change in behavior) rather than just describe it, let me instead start by first describing one of the useful functionalities it enables.

## What can it do for you?

Starting at the highest level: from any developer's point of view (who wants to only have to worry about implementing business logic), you want the streaming service to be 'perfect'. 'Perfection' in this case means many things, but includes providing an 'exactly-once' quality of service, such that no matter what the failure scenario may be, the developer doesn't have to worry about handling and recovering from the failures that do happen in production (i.e. services and application being restarted unexpectedly because of: crashes, upgrades, VM and containers being moved, etc...). 

There are two parts to the exactly-once streaming QoS equation: 'publish exactly-once' which is done through server side message deduplication, and reliable consumption on the subscriber's side (a separate subject of its own) which is done through acknowledgements and re-deliveries. 

## Why would you need it?

Message deduplication is very useful to deal with two kinds of stream publishing failure scenarios:

1. Protecting against the failure scenarios where a client application 'fails' before it gets an acknowledgement of its publication being successful or not. In those scenarios, the application will typically re-publish the same message again upon re-connecting or restarting, thereby resulting in duplication of the message in the stream. This scenario can happen when the client application gets disconnected, crashes, when the server or client application process (or VM or container/pod) gets moved, updated, restarted, etc... This potential for message duplication also gets exacerbated when publication acks are handled asynchronously (such as when high throughput is desired).

2. Protecting against failure scenarios in stream processing pipelines where the event processing is happening in series of steps as messages representing the event being processed go through a number of streams (e.g. a message published on an upstream stream causes 1 or more messages to be published on one or more downstream streams). When there is a problem with one of the applications somewhere in the pipeline you can end up in a situation where some events can end up in a 'half-processed' state within the pipeline. In those scenarios, being able to recover the processing of those events simply by replaying original the event messages from the initial most stream *without having to worry about duplicate message publishing* (and its possible side effects in any of the steps of the pipeline as a result of the replay) becomes a very desirable functionality.

## Can't you do that already?

Indeed, this is obviously not a new problem and there are already available functionalities to provide some kind of message deduplication in many streaming systems. All of them rely on the concept of 'BYOID' (meaning you, the app developer, must bring your own unique ID for each of the event messages that you publish):

- JetStream does have a 'time scoped window' deduplication mechanism built-in. When enabled for a stream the NATS servers remember message IDs (specified in a header in the published messages) for a configurable period of time, which means that it applies regardless of client connections being dropped or client application processes being restarted as long as they reconnect within the period of time of the window.
- Similarly, Kafka also has a 'connection scoped window' deduplication mechanism built-in referred to as producer idempotence. When enabled the brokers remember all the request IDs received from a client connection ID and detects retries, which means that the producer can only guarantee idempotence for messages sent within a single session.

As you can probably guess both methods have some clear limitations back in the real world of production systems:

- The limitation of Kafka's producer idempotence being that you can never guarantee that the application publishing will never crash or be killed before receiving the publication's acknowledgement and therefore publish a duplicate when it restarts. And even then you still need to persist the positive acknowledgements that you have received to some kind of external datastore like Redis (so more than likely you are going to need to write and deploy something using Kafka Streams).
- The limitation of JetStream's stream deduplication window being that one can never tell ahead of time how much time it will actually take before a failing client process can be restarted and able to successfully process the messages in the stream.

## What is the feature itself?

Now this finally brings us to the part where I describe the feature itself 🎉

As the title of this blog implies, what this new feature of JetStream enables is the ability to have exactly-once publication through deduplication by BYOID over the entire stream, regardless of time between fault and restart, of client disconnections, or of the client or server processes getting restarted.

So, how do you actually use this new feature, and how does it work? Bear with me again as I first go through some prerequisite knowledge about stream limits and discard policies.

### Stream limits

JetStream allows you to set basic limits for a stream: the maximum number of messages in the stream, the maximum number of bytes, and you can specify the max amount of time you want the stream to keep messages (i.e. a TTL). Because it has the features that you would associate with a data store JetStream immediately enforces those limits. On the other hand, systems offering a distributed WAL feature set allow you to adjust when log compaction kicks in to prune the tail end of the stream data, and the log compaction functionality is completely decoupled from the ability to publish new messages for the topic.

### Discard policies

As it enforces limit immediately a publication, like writing a new row into a database table as opposed to adding a record to a log, JetStream also allows you to specify a 'discard policy': what happens to a publication when a limit is breached because of the new message being published. There are two discard policies:

- Discard `old` means that the stream will discard the oldest message in the stream in order to accept the new message being published while keeping the stream at the limit.

This is probably the most common use-case: you want the stream to be a rolling window of data and yet control the size of the stream, new publications silently push out the oldest message in the stream. It is, implicitly, the only kind of discard policy that you get when using a streaming system that only exposes WAL with log compaction functionality, as those systems are meant to always accept new messages or block until they can.

 - Discard `new` means that the JetStream publish operation will immediately return a "maximum messages exceeded" error if the message would take the stream over its max messages limit.

### Per subject limits

So far so good on the basic limits, but now this is where it gets interesting and relevant to message deduplication: JetStream also allows you to place a stream limit on the _exact_ maximum number of messages per subject that can be stored in the stream at any given time.

## How do you use it?

The exact per subject limit enforcement when combined with the new ability to choose which discard policy you want to have applied to the per subject limit means you can have a limit of 'exactly 1' messages per subject, and know right away if your publication breaks that limit. This enables many kinds of distributed logic coordination use cases, including the ability to have the streaming equivalent of using an `insert` (vs an `update` or an `upsert`) on a table with a unique id constraint in SQL.

### Using Publish as an 'Upsert'
When the stream's discard policy is `old`, and you also have a per subject limit of 1 (for example) then it means a new message being published on subject 'x' will always cause the automatic deletion of the message (if any) already stored in the stream with that subject.

When the stream's discard policy is `new`, and you also have a per subject limit of 1 then by default a new message on subject 'x' will always cause the automatic deletion of the message already stored in the stream for that subject (meaning the new message gets stored in the stream even if the stream is at capacity for the maximum number of messages) if there is one, or will return a "maximum messages exceeded" error if there isn't one and the stream is already at maximum capacity). 

So by default you can say that the 'per subject discard policy' is `old`, regardless of the stream's discard policy being `new` or `old`. 

This is because it is the behavior you want for one of the most basic and common use cases of streaming: the ability to act as a 'last message cache' so that subscribing applications immediately get an 'initial value' (the current latest message published) for the subject(s) they are subscribing to, rather than having to wait an unknown period of time until the next publication on that (or these) subjects to get any data.

### Using Publish as an 'Insert'

However, and this is the new feature being introduced in 2.9, JetStream also allows you to create streams with the `new-per-subject` attribute which sets the _per subject_ discard policy to `new` when the stream's discard policy is also set to `new`.

So for example if you have set the steam's max messages per subject limit to 1 and there is already a message stored in the stream with that subject then the JetStream publish call fails immediately, just like an `insert` fails if there's already a row for that key in a table with a unique id constraint in SQL.

This in turns gives us infinite exactly-once publication quality of service, simply by including the unique id somewhere in the subject name.

### Using Publish as an 'Update'

While it is outside the subject of this blog, I still want to mention that JetStream also has a 'compare and set' functionality (using the `nats.ExpectLastSequence()` publish option) which can be used to implement an equivalent to `update` in SQL.

## How does it work?
The ability to strictly and consistently enforce this limit (a key attribute for our use case) is possible because of a fundamental difference between JetStream and distributed log streaming systems: JetStream is 'subject-based addressing aware', it allows you to capture messages on multiple subjects into a single stream, rather than having a hard equivalency of exactly one topic per stream. Of course other streaming systems also allow the publishing application to provide a 'key' field along with the message being published to a topic, but the key is really meant to be only used for distribution (partitioning) purposes. But that is not the same thing as having the key(s) in the subject and then being able to use subject-based server-side (indexed) filtering consumers of the messages in a stream.

### Doesn't Kafka do this also?
And indeed, if you know your Kafka, this may look to you just like the 'keep at least one message per key' log compaction feature, but there is a big difference: JetStream is 'exactly *n*' maximum number of messages per subject while log compaction only ensures that you will have 'at least 1' message per key.

Besides the potential inefficiency (i.e. having to scan the whole to be sure to get the latest message for a specific key in the last message cache) you will not be able to use a streaming WAL functionality to enforce a strict per key limit, and to signal the client application publishing a message immediately when the publication would break the limit. This is why there is no concept of a `new` discard policy in distributed log streaming systems, they are designed and designed and meant for always accepting new messages or block until they can.

## How do I play with it?
Congratulations, you have now reached the practical exercise walk through part of this blog and you can test this for yourself using the `nats` CLI tool!

Prerequisite is access to a JetStream-enabled NATS service infrastructure (e.g. running `nats-server -js` locally) and having the `nats` CLI context pointing to it.

First let's create the stream:
```
nats stream add dedup --discard-per-subject
```
Specify a subject filter of your choice, it needs to have at least one `*` (or a `>`) wildcard for the subject token(s) where the unique id is located. In this example `foo.*`.

You can select what you want for the other parameters, or just hit return to use the defaults, as long as you set the "Per subject Messages Limit" to `1`, and the stream's discard policy to `new` (as this new discard per subject is not relevant to the `old` stream discard policy).
```
? Subjects foo.*
? Storage file
? Replication 1
? Retention Policy Limits
? Discard Policy New
? Stream Messages Limit -1
? Per Subject Messages Limit 1
? Total Stream Size -1
? Message TTL -1
? Max Message Size -1
? Duplicate tracking time window 0
? Allow message Roll-ups No
? Allow message deletion Yes
? Allow purging subjects or the entire stream Yes
Stream dedup was created

Information for Stream dedup created 2022-11-16 16:57:54

             Subjects: foo.*
             Replicas: 1
              Storage: File

Options:

            Retention: Limits
     Acknowledgements: true
       Discard Policy: New Per Subject
     Duplicate Window: 2m0s
    Allows Msg Delete: true
         Allows Purge: true
       Allows Rollups: false

Limits:

     Maximum Messages: unlimited
  Maximum Per Subject: 1
        Maximum Bytes: unlimited
          Maximum Age: unlimited
 Maximum Message Size: unlimited
    Maximum Consumers: unlimited


State:

             Messages: 0
                Bytes: 0 B
             FirstSeq: 0
              LastSeq: 0
     Active Consumers: 0
```
Let's do a JetStream publish of a message for id=1
```
nats req foo.1 one
``` 
Which is successful (here the message is assigned sequence number 1):
```
17:08:57 Sending request on "foo.1"
17:08:57 Received with rtt 284.958µs
{"stream":"dedup", "seq":1}
```
Let's publish another message, for id=2
```
nats req foo.2 one
```
Which is also successful (and assigned sequence number 2):
```
17:09:03 Sending request on "foo.2"
17:09:03 Received with rtt 267.584µs
{"stream":"dedup", "seq":2}
```
Now let's try to publish another message for id=1
```
nats req foo.1 two
```
Which fails, thereby ensuring message deduplication:
```
17:09:11 Sending request on "foo.1"
17:09:11 Received with rtt 192.709µs
{"error":{"code":503,"err_code":10077,"description":"maximum messages per subject exceeded"},"stream":"dedup","seq":0}
```
At this point we can for example remove the existing message for id=2 using its sequence number (2 in this example)
```
nats stream rmm dedup 2
```
And attempt to publish a new message for id=2
```
nats req foo.2 two
```
Which works:
```
17:09:52 Sending request on "foo.2"
17:09:52 Received with rtt 318.125µs
{"stream":"dedup", "seq":3}
```

## Closing thoughts

To resume: the newly introduced discard policy `new` for per subject limit now enables the ability to have an 'infinite deduplication window' to avoid duplicated publications that can otherwise happen to some failure scenarios.

This new ability is specific to JetStream due to its fundamental functionality differences compared to other distributed streaming systems: it is subject based addressing capable and has the features of a proper data store (rather than the features of an append-only log with compaction). The functionality is built-in to NATS server itself rather than something you have to implement and deploy using something additional (e.g. Kafka Streams processes) and requiring an external data store (e.g. Redis). 

Ensuring message deduplication is also not the only use for this new feature: it can effectively be used for any kind of (optimistic) distributed processing concurrency access control (e.g. forms of locks, semaphores, logic gating, etc...), and you can combine it with message TTL to automatically clear the lock after some time. Other use cases include:
- n Workers need to perform an action at most once/twice/thrice per period
- Out of 1000s of workers a subset only n should be able to do something concurrently

Finally, do remember that 'nothing comes for free': just like a proper data store should, JetStream uses indexing to ensure that it doesn't have to scan the entire stream to find any existing message with a matching subject. This means that the more individual subjects you have in a stream, the more the overhead (i.e. memory) taken up on the servers for this indexing. It doesn't mean that the existing time-based message deduplication window feature is not needed anymore, as there are some use cases where it may be better suited than using a per-subject limit.

## About the Author

Jean-Noël Moyne is Field CTO at [Synadia Communications](https://synadia.com).

Questions? Join our [Slack channel](https://slack.nats.io) or email [info@nats.io](mailto:info@nats.io).
