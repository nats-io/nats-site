+++
categories = ["Clients", "Java", "JetStream"]
date = "2021-06-08"
tags = ["java", "stream", "consumer"]
title = "JetStream Pull Consumers with the NATS.io Java Library"
author = "Scott Fauerbach"
+++
# JetStream Pull Consumers with the NATS.io Java Library

The last entry in this series talked about [push consumers](jetstream-java-client-04-push-subscribe.md).
This entry will demonstrate the basics of a pull subscription.

## Pull

A pull subscription allows you to control when the server sends the client messages.
There is one API method call used for creating a pull subscription:

```
JetStreamSubscription subscribe(String subject, PullSubscribeOptions options) throws IOException, JetStreamApiException;
```

* subject - every subscription needs a subject
* options - configure PullSubscribeOptions or use the default configuration

### PullSubscribeOptions

The `PullSubscribeOptions` allows you to identify the _stream name_ and
is a helper for the most common pull `ConsumerConfiguration` option, the _durable name_.
(Remember, durable name is required for pull subscriptions.)
Setting those in the `PullSubscribeOptions` builder will create a `ConsumerConfiguration` with those values. 
If you also provide a `ConsumerConfiguration` the values set in the `PullSubscribeOptions` builder will be used
in place of any values already set in the `ConsumerConfiguration`

#### Builder

```
// set the stream name
public Builder stream(String stream)

// set the durable name
public Builder durable(String durable)

// set the configuration object
public Builder configuration(ConsumerConfiguration configuration)
```

### Manual Batch Message Retrieval

With a push subscription, you can just call `nextMessage` indefinitely to get the next message from the client's buffer,
but with a pull subscription, until you tell the server to send messages, the client buffer will be empty.
The `JetStreamSubscription` interface provides 3 different ways to tell the server you are ready for messages and will handle them manually.

#### Batch Size

The batch size can be 1 to 256 inclusive. Values outside that range will throw an exception.

#### Example Code

No matter which type of pull you do, you start the same way:

```
int BATCH_SIZE = 10;

JetStream js = nc.jetStream();

// Build our subscription options. Durable is REQUIRED for pull based subscriptions
PullSubscribeOptions pullOptions = PullSubscribeOptions.builder()
.durable("my-durable-name")
.build();

JetStreamSubscription sub = js.subscribe("my-subject", pullOptions);
nc.flush(Duration.ofSeconds(1));

...
```

#### pull(int batchSize);

Pull with batch size tells the server how many messages to send. 
If the server has the exact number or more than the batch size in messages, 
you will get exactly the batch size number of messages and then the batch will be finished.
You then have to make the pull call again to start a new batch.
If there are less than the batch size messages available, the server will send you what it has
and you can just keep trying with the client. The batch is not complete until the entire
batch size has been sent by the server, no matter how long it takes.

There are 2 detailed examples that can be found in the client repo: 
[NatsJsPullSubBatchSize](https://github.com/nats-io/nats.java/blob/main/src/examples/java/io/nats/examples/jetstream/NatsJsPullSubBatchSize.java)
and
[NatsJsPullSubBatchSizeUseCases](https://github.com/nats-io/nats.java/blob/main/src/examples/java/io/nats/examples/jetstream/NatsJsPullSubBatchSizeUseCases.java)

```
...

while (...) { 
    sub.pull(BATCH_SIZE);
    
    int count = 0;
    while (count < BATCH_SIZE) {
        Message m = sub.nextMessage(Duration.ofSeconds(1)); // first message
        while (m != null) {
            if (m.isJetStream()) {
                // process message
                count++;
                System.out.println("" + count + ". " + m);
                m.ack();
            }
            m = sub.nextMessage(Duration.ofMillis(100)); // other messages should already be on the client
        }
        // if we got a null message before we got the batch size, the server
        // does not have any more messages at the moment.
        // Maybe sleep here or do some housekeeping before trying again?
        // Don't just keep looping or you will just max the cpu in a wait loop.    
    }
}
```

#### pullNoWait(int batchSize);

No Wait is similar to the first pull. If there are enough messages to satisfy the batch, you will get the full batch size.
If there are less than the full batch size available, the server will send what it has and close the batch without waiting 
for more messages. In either case you have to make a new pull request to start the next batch.
When there are fewer messages available than in the batch, the server will send a status message `Status{code=404, message='No Messages'}` 
as the last message to indicate that the batch was incomplete. 

[NatsJsPullSubNoWaitUseCases](https://github.com/nats-io/nats.java/blob/main/src/examples/java/io/nats/examples/jetstream/NatsJsPullSubNoWaitUseCases.java) is a detailed example that can be found in the client repo.

```
...

while (...) { 
    sub.pullNoWait(BATCH_SIZE);
    
    int count = 0;
    Message m = sub.nextMessage(Duration.ofSeconds(1)); // first message
    while (m != null && count < BATCH_SIZE) {
        if (m.isJetStream()) {
            // process message
            count++;
            System.out.println("" + count + ". " + m);
            m.ack();
            m = sub.nextMessage(Duration.ofMillis(100)); // other messages should already be on the client
        }
        else if (m.isStatusMessage()) {
            // m.getStatus().getCode should == 404
            // m.getStatus().getCode should be "No Messages"
            m = null; // drop out of the while (m != null) loop because we are done. 
            // you could also m = sub.nextMessage(Duration.ofMillis(100)) because it will return null
        }
    }
    
    // here, count will be the number of jetstream messages received
}
```

#### pullExpiresIn(int batchSize, Duration expiresIn);

Pull expires is fairly complicated. The server will wait for the period of time that you request. If it gets
the full batch size of messages before the time expires, it will send the full batch, otherwise it will 
send as many as it has. You have to make a new pull request to start the next batch.
If your last pull was a pull expire and the batch was not completely filled, your next pull request or any type will 
get 1 status message `Status{code=408, message='Request Timeout'}` for each message that was not in the batch.
So if your batch size was 10, but there were only 4 messages, you will get 6 status messages.

There are two detailed examples, 
[NatsJsPullSubExpire](https://github.com/nats-io/nats.java/blob/main/src/examples/java/io/nats/examples/jetstream/NatsJsPullSubExpire.java)
and
[NatsJsPullSubExpireUseCases](https://github.com/nats-io/nats.java/blob/main/src/examples/java/io/nats/examples/jetstream/NatsJsPullSubExpireUseCases.java)
if you really want to look into it.

```
...

while (...) { 
    sub.pullExpiresIn(BATCH_SIZE, Duration.ofSeconds(2));
    
    int count = 0;
    Message m = sub.nextMessage(Duration.ofSeconds(1)); // first message
    while (m != null && count < BATCH_SIZE) {
        if (m.isJetStream()) {
            // process message
            count++;
            System.out.println("" + count + ". " + m);
            m.ack();
            m = sub.nextMessage(Duration.ofMillis(100)); // other messages should already be on the client
        }
        else if (m.isStatusMessage()) {
            // m.getStatus().getCode might == 408
            // m.getStatus().getCode should be "Request Timeout"
            m = null; // drop out of the while (m != null) loop because we are done. 
            // you could also m = sub.nextMessage(Duration.ofMillis(100)) because it will return null
        }
    }
    
    // here, count will be the number of jetstream messages received
}
```

### Macro Batch Message Retrieval

In addition to the manual pull methods, the subscription API provides 2 method calls that do the work of getting the messages for you.

#### List<Message> fetch(int batchSize, Duration maxWait);

The `fetch` method returns a list of messages. The list might contain 0 messages, and will at most contain the number of messages specified in the `batchSize`.
Since this is a blocking call, you tell it the maximum amount of time to wait for the first message to appear in the client's buffer.
If it gets messages or the wait time is exceeded, it returns the list. The list will only contain regular JetStream messages, never status messages.

```
while (...) {
    List<Message> messages = sub.fetch(BATCH_SIZE, Duration.ofSeconds(1));
    for (Message m : messages) {
        // process message
        m.ack();
    }
}
```

#### Iterator<Message> iterate(final int batchSize, Duration maxWait);

The `iterate` method returns an iterator. Just like `fetch` the iterator might contain 0 messages, and will at most contain the number of messages specified in the `batchSize`.
This is not a blocking call, so it returns immediately, but all calls to the iterator `hasNext()` method will block, in total, up to the
maximum wait time. If the total wait time is exceeded on any `hasNext` call or the batch size has been reached, the call will return false, indicating there are no more messages. 
The iterator will only contain regular JetStream messages, never status messages.

```
while (...) {
    Iterator<Message> iter = sub.iterate(BATCH_SIZE, Duration.ofSeconds(1));
    while (iter.hasNext()) {
        // process message
        Message m = iter.next();
        m.ack();
    }
}
```
