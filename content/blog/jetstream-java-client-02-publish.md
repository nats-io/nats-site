+++
categories = ["Clients", "Java", "JetStream"]
date = "2021-05-03"
tags = ["java", "stream", "publish"]
title = "JetStream Publishing with the NATS.io Java Library"
author = "Scott Fauerbach"
+++

The [previous entry](jetstream-java-client-01-stream-create.md) in this series showed us how to create a stream.
Once you have defined a stream, you can publish to the configured subjects. 
Publishing to stream subjects isn't really much different from publishing a regular NatsMessage. 
Once a subject is established, you could publish a regular NatsMessage to that subject,
but there are benefits to publishing via the JetStream API instead of the regular message API.

## Publish Acknowledgement

When you publish via the JetStream API, each publish will receive an acknowledgement or `PublishAck`. 
This is the server's way of letting you know it has received the message and has handled it according to the
options like storage, retention and replication that were established when creating the stream.

The acknowledgement contains 3 pieces of information

1. Stream Name - the stream (not the subject) where the message was published.
1. Sequence Number (seqno) - the server's internal sequence number for the message.
1. Duplicate - did this message have a duplicate Message ID? See Publish Options below for more on Message ID.

## Publish Options

There are some options that you can set when sending a message.

### Stream Name

When you publish to JetStream, you are required to supply the subject, but are not required to supply the 
stream name as the client will figure it out for you, so in regular uses cases this is not necessary.

So when would you use it? When the client creates a subscription, if you don't give it the stream name, 
it will look it up. Since this is done once per subscription, the overhead is minimal, so it's not really an issue
of time. There may be a security reason however that you would prefer the client not look up the stream name.

Another reason you would supply it would be when you are using the advanced mirror feature.
A mirror might have the same subject as a stream, and if you want to publish to the mirror, supplying the mirror
name as the stream name would be the only way to do this.

### Message ID

You can provide your own unique message ID for every message published. As you will see in the next section where we discuss
expectations, you can verify the last message ID as a condition of publishing.
This allows you to ensure that the sever has exactly the messages you expect it to have.
You can also query the server for this information, if you need to stop publishing and restart later.

## Publish Expectation Options

Publish expectation options allow you to verify that the last published message was the message you expected it to be.
They are pre-conditions to accepting the message you are now publishing.
If any of the expectations are not met, the server will reject the message and the client will throw a `JetStreamApiException`

### Expected Stream

You can require that the last message published on the subject was published to the correct stream. 
This should match the stream returned back on the last Publish Ack.

### Expected Sequence

Like expected stream name, you can verify the last sequence number, 
ensuring that no other message producer has published to the stream.

### Expected Message ID

As discussed before, when you publish, you can optionally set your own message ID.
This option verifies that the last publish was your expected message ID.

## Sync and Async

You are able to publish either synchronously or asynchronously. If speed is your primary concern
and for instance you don't really care if there are duplicated messages or not every message matters, then async is the way to go. If it's important
to ensure the order of or verify every message, then you most likely want to work synchronously so you can verify each publish before
you move on.

To publish, you will have to have a connection to the server, a stream already set up, then have a JetStream context available.

```java
Connection nc = Nats.connect("nats://demo.nats.io:4222")

// Create a JetStream context.
JetStream js = nc.jetStream();
```

### Synchronous Publishing

There are 4 different forms of the API you can use to publish. 
This is an excerpt from the `JetStream` context interface.

```java
PublishAck publish(String subject, byte[] body) throws IOException, JetStreamApiException;
PublishAck publish(String subject, byte[] body, PublishOptions options) throws IOException, JetStreamApiException;
PublishAck publish(Message message) throws IOException, JetStreamApiException;
PublishAck publish(Message message, PublishOptions options) throws IOException, JetStreamApiException;
```

Synchronous publishes *block* until the ack is received. Here is the basic publish: 

```java
byte[] messsageBytes = ...

PublishAck pa = js.publish("subject", messageBytes);

System.out.println("Published Acknowledged: stream " + pa.getStream() + ", seqno " + pa.getSeqno() + ", dupe " + pa.isDuplicate());
```

... or use the form that takes Publish Options. Notice there is a fluent style builder available.

```java
byte[] messsageBytes = ...

PublishOptions po = PublishOptions.builder()
        .stream("my-stream")
        .messageId("id00001")
        .expectedStream("my-stream")
        .build();

PublishAck pa = js.publish("subject", messageBytes, po);
```

Now let's use expectations to check that the last message published was in fact "id00001"
and the last sequence was 1. Remember that Publish Ack contains the sequence number for the 
message that was just published.

```java
byte[] messsageBytes = ...

PublishOptions po = PublishOptions.builder()
        .stream("my-stream")
        .messageId("id00002")
        .expectedStream("my-stream")
        .expectedLastMsgId("id00001)
        .expectedLastSequence(pa.getSeqno()))
        .build();

PublishAck pa = js.publish("subject", messageBytes, po);
```

You can also build the message.

```java
String messsage = "some string message";

PublishOptions po = PublishOptions.builder()
        .stream("my-stream")
        .messageId("id00003")
        .expectedStream("my-stream")
        .expectedLastMsgId("id00002)
        .expectedLastSequence(pa.getSeqno())
        .build();

Message msg = NatsMessage.builder()
        .subject(exArgs.subject)
        .headers(exArgs.headers)
        .data(data)
        .build();

PublishAck pa = js.publish("subject", msg, po);
```

### Asynchronous Publishing

Asynchronous publishing returns on a `CompleteableFuture<PublishAck>`.
It requires a little more setup since you would generally want to queue or collect the future for later handling.
The API for publishing async is parallel to sync

```java
CompletableFuture<PublishAck> publishAsync(String subject, byte[] body);
CompletableFuture<PublishAck> publishAsync(String subject, byte[] body, PublishOptions options);
CompletableFuture<PublishAck> publishAsync(Message message);
CompletableFuture<PublishAck> publishAsync(Message message, PublishOptions options);
```

Asynchronous published *do not block* so, as soon as you make the publish call, the method returns with the future.

```java
byte[] messsageBytes = ...

CompletableFuture<PublishAck> futurePa = js.publish("subject", messageBytes);

// No Waiting!
```

There are two common patterns to handling async publish.

### Sawtooth Pattern

The sawtooth pattern is essentially a loop where you publish some amount of messages, maybe 10 or 100, 
or maybe as many as you can publish in some short time period like 10 seconds. You publish all of the messages, 
collecting them probably in a list and when you reach the limit you set, only then do you go through all the 
futures in the list checking to see if they are done. Rinse and repeat.

Publish...

```java
List<CompletableFuture<PublishAck>> futures = new ArrayList<>;
while (my condition is not met) {
    PublishOptions po = ...
    Message msg = ...
    futures.add(js.publish(msg, po));
}
```

Here I loop through the futures but don't wait for one if it's not done yet
and just keep looping until all futures are done.

```java
while (futures.size() > 0) {
    List<CompletableFuture<PublishAck>> notDone = new ArrayList<>((int)roundSize);
    for (CompletableFuture<PublishAck> f : futures) {
        if (!f.isDone()) {
            notDone.add(f);
        }
        else if (f.isCompletedExceptionally()) {
            // handle the exception, either an io error or expectation error
        }
        else {
            // handle the completed ack
            PublishAck pa = f.get(); // this call blocks if it's not done, but we know it's done because we checked
        }
    }
    futures = notDone;
}
```

A variation on the theme

```java
for (CompletableFuture<PublishAck> f : futures) {
    try {
        PublishAck pa = f.get(); // this call blocks! There is also a get where you can provide a timeout
    }
    catch (ExecutionException ee) {
        // handle the exception, either an io error or expectation error
    }
}
```

### Parallel Pattern

You could optionally set up a separate thread to process the Publish Ack.
This would require some concurrent mechanism like the `java.util.concurrent.LinkedBlockingQueue`
Publishing would run on one thread and place the futures in the queue. The second thread would 
be pulling from the queue and handling it similarly to the sawtooth handler. 

Now you are ready to publish! Up next, Basic Subscribing!

## About the Author

Scott Fauerbach is a member of the engineering team at [Synadia Communications](https://www.synadia.com?utm_source=nats_io&utm_medium=nats).
