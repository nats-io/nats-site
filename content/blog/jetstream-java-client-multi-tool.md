+++
categories = ["Clients", "Java", "JetStream"]
date = "2021-05-05"
tags = ["java", "stream", "publish", "subscribe", "benchmark", "tool"]
title = "JetStream Multi Tool"
author = "Scott Fauerbach"
+++

As we were building the [NATS Java client](https://github.com/nats-io/nats.java) we realized that we wanted code to run the client through it's paces.
We built unit tests, example code and added basic functionality to our existing benchmarking tool.

As we talked to prospective users, we noticed that they were asking us for some more complex examples
where they could for instance see publishing synchronously versus asynchronously.
They also wanted to see all the different varieties of subscribing and consuming messages.
There are quite a few different combinations of ways publishing or subscribing,  
synchronous versus asynchronous, and various threading models.

As we started to build the code, I realized that all these examples are going to need the exact same things:

* One or more connections to the server.
* One or more threads.
* The ability to be run with command line arguments.

The answer was to put everything into the kitchen sink and build the [JetStream Multi Tool](https://github.com/nats-io/nats.java/blob/main/src/examples/java/io/nats/examples/stability/JsMulti.java).
I know what you are thinking, <i>what a great name</i>!

But really, this tool is great.
Want to create a stream? Use the multi-tool.
Want to publish a million messages with 3 threads over separate connections to the server? Use the multi-tool.
Want to consume those messages multi-threaded simulating 4 consumers in a queue? That's right, use the multi-tool.
But wait, there's more! As a bonus, you get benchmarking statistics for publish and subscribe runs!

```
Thread 1   |      400,000 msgs |    7,248.515 ms |     55,183 msg/s |    6.74 mb/s
Thread 2   |      400,000 msgs |    7,223.174 ms |     55,377 msg/s |    6.76 mb/s
Thread 3   |      400,000 msgs |    5,924.235 ms |     67,519 msg/s |    8.24 mb/s
Total      |    1,200,000 msgs |   ------------- |     58,835 msg/s |    7.18 mb/s
```

I know what you are thinking, nothing beats OxyClean and a ShamWow, so I'm going to just show you how great this tool is!

### Prerequisites

The [JetStream Multi Tool](https://github.com/nats-io/nats.java/blob/main/src/examples/java/io/nats/examples/stability/JsMulti.java)
is part of the [NATS Java client](https://github.com/nats-io/nats.java) code, so download it or git clone it.

You will need to have your servers installed / setup.

## Command Line Usage

Change into the nats.java directory, and then using gradle, build the source

```shell
gradle build -x test
``` 

Once the code is built, you can run the multi tool by adding the libraries to your java classpath
or the java command line, with the fully qualified name of the JsMulti program, the required parameters and the optional parameters.

```shell
java -cp build/libs/jnats-2.11.1.jar:build/libs/jnats-2.11.1-examples.jar io.nats.examples.jsmulti.JsMulti requireds [optionals]
```

## From your IDE

The JsMulti program has a `public static void main(String[] args)` method, so it's easy enough to run from any ide.

Most IDEs allow you to build a runtime configuration and pass command line arguments.
I like to just modify the code and set the arguments there. Check out the comments in the code's main method for examples.

## Arguments

For ease of reading, when providing numbers, since they are all integers, you can use java underscore format, US or European style. So these are all valid:

```
1000000
1_000_000
1,000,000
1.000.000
```

### Action Argument

`-a` The action to execute. Always required. One of the following (case ignored)

* `create` create the stream
* `delete` delete the stream
* `info` get the stream info
* `pubSync` publish synchronously
* `pubAsync` publish asynchronously
* `subPush` push subscribe read messages (synchronously)
* `subQueue` push subscribe read messages with queue (synchronously)
* `subPull` pull subscribe read messages (different durable if threaded)
* `subPullQueue` pull subscribe read messages (all with same durable)

### Server Argument

`-s` The url of the server. if not provided, will defaults to `nats://localhost:4222`

```java
... JsMulti -s localhost ...
... JsMulti -s nats://myhost:4444 ...
```

## Stream Management

The multi tool allows you to:

* `create` create the stream
* `delete` delete the stream
* `info` get the stream info

(You can do all three of these functions with our [natscli](https://github.com/nats-io/natscli) command line tool.)

### Required Argument

`-t` The name of the stream

### Optional Arguments

`-o` file|memory when creating the stream, default to memory

`-c` replicas when creating the stream, default to 1. Make sure you are running a cluster!

#### Examples

Create a stream called `multistream` with memory based storage

```java
... JsMulti -a create -t multistream
```

Create a stream called `multistream` with file based storage and replication factor of 3

```java
... JsMulti -a create -o file -c 3 -t multistream
```

Delete a stream

```java
... JsMulti -a delete -t multistream
```

Get info for a stream.

```java
... JsMulti -a info -t multistream

StreamInfo{
    created=2021-05-03T19:55:06.901279100Z[GMT]
    StreamConfiguration{
        name='multistream'
        subjects=[multisubject]
        retentionPolicy=limits
        maxConsumers=-1
        maxMsgs=-1
        maxBytes=-1
        maxAge=PT0S
        maxMsgSize=-1
        storageType=memory
        replicas=1
        noAck=false
        template='null'
        discardPolicy=old
        duplicateWindow=PT2M
        mirror=null
        placement=null
        sources=[]
    }
    StreamState{
        msgs=0
        bytes=0
        firstSeq=0
        lastSeq=0
        consumerCount=0
        firstTime=0001-01-01T00:00Z[GMT]
        lastTime=0001-01-01T00:00Z[GMT]
    }
    cluster=null
    mirror=null
    sources=null
}
```

## Publishing and Subscribing

Publishing and subscribing have some options in common.

### Required Arguments

`-u` The subject for publishing or subscribing

### Optional Arguments

`-m` the total number of messages to publish or subscribe (consuming). Defaults to 1,000,000

`-n shared` When running with more than 1 thread, only connect to the server once and share the connection among all threads. This is the default.

`-n individual` When running with more than 1 thread, each thread will make it's own connection to the server.

`-d` Number of threads to use for publishing or subscribe (consuming). Defaults to 1 thread.

`-j` Jitter between publishing or subscribe (consuming), in milliseconds, defaults to 0.
A random amount of time from 0 up to the number of milliseconds to sleep between publishing or requesting the next message while subscribing. Intended to help simulate a more real world scenario.

### Publish Only Optional Arguments

`-p` For publishing only, the payload size (the number of data bytes) to publish. Defaults to 128 bytes

`-z` Round size for `pubAsync` action, default to 100.
Publishing asynchronously uses the "sawtooth" pattern. This means we publish a round of messages, collecting all the futures that receive the PublishAck
untill we reach the round size. At that point we process all the futures we have collected, then we start over until we have published all the messages.

### Subscribe (Consume) Only Optional Arguments

`-k explicit` Explicit ack policy. Acknowledge each message received. This is the default.

`-k none` None ack policy. Configures the consumer to not have to ack messages.

`-z` Batch size for `subPull` or `subPullQueue` actions, default to 100. Pull subscriptions work in batches, maximum of 256

## Publish Examples

#### synchronous processing of the acknowledgement

* publish to `multisubject`
* 1 thread (default)
* 1 million messages (default)
* payload size of 128 bytes (default)
* shared connection (default)

```java
... JsMulti -a pubSync -u multisubject
```

#### synchronous processing of the acknowledgement

* publish to `multisubject`
* 5 threads
* 5 million messages
* payload size of 256 bytes
* jitter of 1 second (1000 milliseconds)

```java
... JsMulti -a pubSync -u multisubject -d 5 -m 5_000_000 -p 256 -j 1000
```

#### asynchronous processing of the acknowledgement

* publish to `multisubject`
* 2 threads
* 2 million messages
* payload size of 512 bytes
* round size of 20
* individual connections to the server

```java
... JsMulti -a pubAsync -u multisubject -d 2 -m 2_000_000 -p 512 -z 20 -n individual
```

## Subscribe Examples

####  push subscribe

* from `multisubject`
* 1 thread (default)
* 1 million messages (default)
* explicit ack (default)

```java
... JsMulti -a subPush -u multisubject
```

####  push subscribe to a queue

> IMPORTANT subscribing (push or pull) with a queue requires multiple threads

* from `multisubject`
* 2 threads
* 1 million messages (default)
* explicit ack (default)

```java
... JsMulti -a subQueue -u multisubject -d 2
```

####  pull subscribe

* from `multisubject`
* 2 threads
* 1 million messages (default)
* ack none
* batch size 20 (default is 100, max is 256)

```java
... JsMulti -a subQueue -u multisubject -d 2 -k none -z 20
```
