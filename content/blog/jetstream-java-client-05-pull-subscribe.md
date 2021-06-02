+++
categories = ["Clients", "Java", "JetStream"]
date = "2021-06-03"
tags = ["java", "stream", "consumer"]
title = "JetStream Push Consumers with the NATS.io Java Library"
author = "Scott Fauerbach"
+++

The last entry in this series talked about the [consumer options](jetstream-java-client-03-consume.md) that are available when subscribing to messages.
This entry will demonstrate the basics of a push subscription.

## Push

A push subscription is where the server is in control and sends messages to client. 
It can be made durable or ephemeral based on your use case. Here are the api available to set up a push subscription:

```java
JetStreamSubscription subscribe(String subject) throws IOException, JetStreamApiException;
JetStreamSubscription subscribe(String subject, PushSubscribeOptions options) throws IOException, JetStreamApiException;
JetStreamSubscription subscribe(String subject, String queue, PushSubscribeOptions options) throws IOException, JetStreamApiException;
JetStreamSubscription subscribe(String subject, Dispatcher dispatcher, MessageHandler handler, boolean autoAck) throws IOException, JetStreamApiException;
JetStreamSubscription subscribe(String subject, Dispatcher dispatcher, MessageHandler handler, boolean autoAck, PushSubscribeOptions options) throws IOException, JetStreamApiException;
JetStreamSubscription subscribe(String subject, String queue, Dispatcher dispatcher, MessageHandler handler, boolean autoAck, PushSubscribeOptions options) throws IOException, JetStreamApiException;
```

* subject - every subscription needs a subject
* options - configure PushSubscribeOptions or use the default configuration
* queue - multiple consumers in using the same queue name will each get a unique portion of the messages in the stream.  
* dispatcher - necessary if you want to handle messages asynchronously
* handler - the asynchronously handler
* autoAck - for asynchronous handling, the message can be acknowledged for you before your own handler is called.

### PushSubscribeOptions

The `PushSubscribeOptions` allows you to identify the _stream name_ and 
is a helper for the most common push `ConsumerConfiguration` options, _durable name_ and the _deliver subject_. 
Setting those in the `PushSubscribeOptions` builder will 
create a `ConsumerConfiguration` with those values. If you also provide a `ConsumerConfiguration`
the values set in the `PushSubscribeOptions` builder will be used in place of any values already set in the
`ConsumerConfiguration`

### Synchronous

You can handle a push subscription message synchronously...

```java
JetStreamSubscription sub = js.subscribe("my-subject");
nc.flush(Duration.ofSeconds(1)); // flush outgoing communication with/to the server

while (keepGoing)
    // get the next message waiting a maximum of 1 second for it to arrive
    handleMessage(sub.nextMessage(Duration.ofSeconds(1)));
}

...
        
void handleMessage(Message msg) {
    if (msg == null) {
        // the server had no message for us. 
        // Maybe sleep here or do some housekeeping
    }
    else {
        if (msg.isJetStream()) {
            // do something with the message
            // don't forget to ack based on your consumer AckPolicy configuration
            msg.ack();
        }
        else if (msg.isStatusMessage()) {
            // status messages include heartbeat and flow control depending on
            // your consumer configuration
            System.out.println("STATUS " + msg.getStatus());
        }
    }
}
```

### Asynchronous

Or asynchronously in a separate thread...

```java
MessageHandler handler = (Message msg) -> {
    // see handleMessage in above example
    handleMessage(msg)
};

// create a dispatcher without a default handler.
Dispatcher dispatcher = nc.createDispatcher();

// create a subscription
// dispatcher is the object that routes messages asynchronously 
// handler is the function that processes the message
JetStreamSubscription sub = js.subscribe("my-subject", dispatcher, handler, false);
nc.flush(Duration.ofSeconds(1)); // flush outgoing communication with/to the server

// do other stuff and make sure you keep the program running since the handler is running in a separate thread
```

## Pull

A pull subscription allows you to control when the server sends the client messages. 
There are several varieties but the all start with the one pull subscribe api:

```java
JetStreamSubscription subscribe(String subject, PullSubscribeOptions options) throws IOException, JetStreamApiException;
```

### PullSubscribeOptions

The `PullSubscribeOptions` allows you to identify the _stream name_ and
is a helper for the most common pull `ConsumerConfiguration` option, the _durable name_.
(Remember, durable name is required for pull subscriptions.)
Setting those in the `PullSubscribeOptions` builder will create a `ConsumerConfiguration` with those values. 
If you also provide a `ConsumerConfiguration` the values set in the `PullSubscribeOptions` builder will be used
in place of any values already set in the `ConsumerConfiguration`

