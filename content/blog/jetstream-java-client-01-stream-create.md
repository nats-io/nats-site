+++
categories = ["Clients", "Java", "JetStream"]
date = "2021-04-22"
tags = ["java", "stream", "create", "jetstream"]
title = "JetStream Stream Creation with the NATS.io Java Library"
author = "Scott Fauerbach"
+++

The <a href="https://github.com/nats-io/java-nats">NATS Java library</a> with support for JetStream has just been released!

JetStream allows you to persist streams of messages, allowing consumers to either subscribe in real time
or to access the messages at a later time, with the flexibility to where in the stream you want to start receiving messages from. 
You can start reading from the stream at a specific point in time or starting at a specific message sequence number.

Since JetStream is built on top of NATS Messaging, you get streaming on top of all the benefits of normal NATS messaging.
Stream messages are sent on subjects, just like a normal NATS message, so you can even just use a normal NATS subscription to
get messages. Using the stream functionality however provides benefits above and beyond regular messaging.

There are various ways to create Streams. You can use configuration. You can use the command line program (CLI).
Or you can use the Java client's JetStream Management API to manage streams. 
There are several stream functions you can execute with the management api:

- Create a stream
- Modify a stream
- Delete a stream
- Purge messages from a stream
- Get information about a stream
- Manage the consumers of a stream

This blog entry will focus on creating a stream and the available options.

## Creating a Stream

The stream is essentially a grouping or organization for a set of subjects.
It might identify a business function or logical domain of your business

Every stream needs a name and it must be unique within your account. The stream name itself
cannot contain spaces or tabs, a period (`.`), the greater than wildcard character (`>`) or the
asterisk wildcard (`*`) character.

There are several options when creating a stream.

### Storage Type

There are 2 types of storage, Memory or File, with File being the default. 
Memory storage is excellent for development purposes, and also good if absolute speed is a requirement.
If replicas are used, the stream data is replicated across multiple servers whether it's File or Memory storage.
Memory streams are not persisted across the shutdown of an individual server (but will be repopulated in a cluster 
setup depending on replication settings.)

### Subject(s)

Streams can have 1 or more subjects.
Subjects are just like regular NATS subjects, except in this case they are associated with a stream and
therefore the messages in the stream all adhere to the configuration of the stream policies.

### Sample Code

Let's create a basic stream.

```java
Connection nc = Nats.connect("nats://localhost:4222")

// Create a JetStreamManagement context.
JetStreamManagement jsm = nc.jetStreamManagement();

// Build the configuration
StreamConfiguration streamConfig = StreamConfiguration.builder()
   .name("Widgets")
   .storageType(StorageType.Memory)
   .subjects("widget.one", "subject.two")
   .build();

// Create the stream
StreamInfo streamInfo = jsm.addStream(streamConfig);
```

Using our command line interface (CLI), I can check on the stream:

```
> nats stream info MyStream
Information for Stream MyStream created 2021-04-21T10:03:15-04:00

Configuration:

             Subjects: subject.one, subject.two
     Acknowledgements: true
            Retention: Memory - Limits
             Replicas: 1
       Discard Policy: Old
     Duplicate Window: 2m0s
     Maximum Messages: unlimited
        Maximum Bytes: unlimited
          Maximum Age: 0.00s
 Maximum Message Size: unlimited
    Maximum Consumers: unlimited


State:

             Messages: 0
                Bytes: 0 B
             FirstSeq: 0
              LastSeq: 0
     Active Consumers: 0
```

## Advanced Options

As you can see in the CLI output there are several other options available for configuring the stream.

### MaxAge

The maximum age of any message in the stream, expressed in nanoseconds.
Messages older than this will be removed from the stream.
The default is 0 which is unlimited, meaning the age of the message age is not considered when pruning the stream.
MaxAge is independent of the Discard and Retention policies (see below) 

### MaxMsgSize

The maximum size of the data portion of a message that will be accepted by the Stream. 
Messages with data containing more bytes will be refused.

### MaxConsumers

The maximum number of Consumers that can have interest / be active for a given Stream. 
The default is -1 for unlimited. 
If you attempt to create a consumer that would exceed this setting, it will be refused. 

### MaxBytes

The maximum total number of bytes allowed for a stream.
Message removal is determined according to the Discard Policy (see below).
The default is -1, meaning unlimited.

Each message counts towards the byte count in the following manner:
- The entire number of bytes in the subject
- The entire number of bytes of any data
- Overhead data including length information, timestamp, sequence number and hash code.
    - Memory streams, 16 bytes
    - File streams, 30 bytes

If there are headers, add this much:
- The number of bytes making up header tuples. A tuple consists of the key and value for each value of a key
- 3 bytes of overhead per tuple
- Overhead for headers
    - Memory streams, 12 bytes
    - File streams, 16 bytes

### MaxMsgs

You can limit the total number of messages allowed for a stream.
Message removal is handled according to Discard Policy.
Default is -1 meaning unlimited.

### NoAck

Disables acknowledging messages that are received by the Stream

### Replicas

Set how many replicas to keep for each message in a clustered JetStream. Default is 0, maximum is 5

### Retention

How message retention is considered, LimitsPolicy (default), InterestPolicy or WorkQueuePolicy.
Limits policy enforces the MaxBytes and MaxMsgs limits. 
Interest policy keeps messages as long as there is a consumer that has not acknowledged the message unless
MaxAge, MaxBytes or MaxMsgs would prune them.
WorkQueuePolicy removes a message as soon as anyone acknowledges it, or again, one of the Max policies requires it to be removed.

### Discard

Discard Policy can be either Old or New. It affects how MaxMessages and MaxBytes operate. 
If a limit is reached and the policy is Old, the oldest message is removed. 
If the policy is New, new messages are refused if it would put the stream over the limit.

### Duplicates

The window within which to track duplicate messages. 
This only matters if you are sending a message id when publishing.
If a message with an id that has already been received during the window, it will be refused.
If a message with an id that has already been received is received outside the window, it will be accepted.

## Builder with Advanced Options
```java
Connection nc = Nats.connect("nats://localhost:4222")

// Create a JetStreamManagement context.
JetStreamManagement jsm = nc.jetStreamManagement();

// Build the configuration
StreamConfiguration streamConfig = StreamConfiguration.builder()
   .name("MyStream")
   .storageType(StorageType.Memory)
   .subjects("subject.one", "subject.two")
   // .discardPolicy(...)
   // .retentionPolicy(...)
   // .maxConsumers(...)
   // .maxBytes(...)
   // .maxAge(...)
   // .maxMsgSize(...)
   // .replicas(...)
   // .noAck(...)
   .build();

// Create the stream
StreamInfo streamInfo = jsm.addStream(streamConfig);
```

Up next, Publishing

## About the Author

Scott Fauerbach is a member of the engineering team at [Synadia Communications](https://synadia.com).

