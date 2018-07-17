+++
categories = ["Clients"]
date = "2018-07-17"
tags = ["java", "community update"]
title = "Java Client Hits 2.0!"
author = "Stephen Asbury"
+++

## We Are Listening

We know the [NATS Java library](https://github.com/nats-io/java-nats) hasn't seen a lot of love in the last year, but we are reinvigorated and the library has reached a new milestone. We wanted to let the community know we have taken your feedback from GitHub:

* [Optional reconnect behavior on connect](https://github.com/nats-io/java-nats/issues/158)
* [Excessive thread usage](https://github.com/nats-io/java-nats/issues/151)
* [Disabling the reconnect buffer](https://github.com/nats-io/java-nats/issues/138)
* [Notification on cluster discovery](https://github.com/nats-io/java-nats/issues/116)
* [Improve robustness](https://github.com/nats-io/java-nats/issues/126)
* [Improve robustness](https://github.com/nats-io/java-nats/issues/150)
* [Better documentation](https://github.com/nats-io/java-nats/issues/25)

as well as comments in face to face meetings, and on Slack, to build a new compact library with:

* Higher performance
* Fewer threads
* Extensive error handling
* Lots of tests (> 95% coverage)
* Good memory profile
* No external dependencies

## Performance

Speaking of performance, on an iMac the example benchmark is publishing at a rate of over 9 million messages a second, and round tripping at over 3 million messages a second in multiple threads:

```
Starting benchmark(s) [msgs=5000000, msgsize=256, pubs=2, subs=2]
Current memory usage is 966.14 mb / 981.50 mb / 14.22 gb free/total/max
Pub Only stats: 9,584,263 msgs/sec ~ 2.29 gb/sec
 [ 1] 4,831,495 msgs/sec ~ 1.15 gb/sec (2500000 msgs)
 [ 2] 4,792,145 msgs/sec ~ 1.14 gb/sec (2500000 msgs)
  min 4,792,145 | avg 4,811,820 | max 4,831,495 | stddev 19,675.00 msgs
Pub/Sub stats: 3,735,744 msgs/sec ~ 912.05 mb/sec
 Pub stats: 1,245,680 msgs/sec ~ 304.12 mb/sec
  [ 1] 624,385 msgs/sec ~ 152.44 mb/sec (2500000 msgs)
  [ 2] 622,840 msgs/sec ~ 152.06 mb/sec (2500000 msgs)
   min 622,840 | avg 623,612 | max 624,385 | stddev 772.50 msgs
 Sub stats: 2,490,461 msgs/sec ~ 608.02 mb/sec
  [ 1] 1,245,230 msgs/sec ~ 304.01 mb/sec (5000000 msgs)
  [ 2] 1,245,231 msgs/sec ~ 304.01 mb/sec (5000000 msgs)
   min 1,245,230 | avg 1,245,230 | max 1,245,231 | stddev .71 msgs
Final memory usage is 2.02 gb / 2.94 gb / 14.22 gb free/total/max
```

This test used about a GB of memory with no memory restrictions. In other tests, running for 24 hours with non-maxed message load, the library produced easily collectable memory and actually reduced the memory load over time.

## New API

This release introduces a number of API changes.

Dispatchers put control of callback threads in the hands of the application. You can group callbacks for multiple subscriptions into a single dispatcher, but can also create multiple dispatchers to adjust thread resources as needed:

```
Dispatcher d = nc.createDispatcher((msg) -> {
    String response = new String(msg.getData(), StandardCharsets.UTF_8);
    ...
});

d.subscribe("subject");
d.subscribe("another.subject");
```

Added new options you can set at connect time:

```
Options o = new Options.Builder().
                        server("nats://serverone:4222").
                        server("nats://servertwo:4222").
                        maxReconnects(-1).
                        reconnectBufferSize(-1).
                        maxControlLine(1024).
                        build();
Connection nc = Nats.connect(o);
```

including support for setting the reconnect buffer size to "infinite" and setting the maximum control line size, which needs to match any changes in the server configuration.

An experimental API has been added for connecting in the background:

```
Options options = new Options.Builder().
                        server(Options.DEFAULT_URL).
                        connectionListener(handler).
                        build();
Nats.connectAsynchronously(options, true);
```

## Building is Easy

To simplify the build requirement, we have moved from Maven to Gradle.

Everything is packaged in a [tiny jar file](https://search.maven.org/remotecontent?filepath=io/nats/jnats/2.0.0/jnats-2.0.0.jar).

Of course, you can still find jnats at Maven Central:

```
<dependency>
    <groupId>io.nats</groupId>
    <artifactId>jnats</artifactId>
    <version>2.0.0</version>
</dependency>
```

.. and building from source is as easy as `./gradlew build`.

## We Want Your Feedback

An [updated version](https://github.com/nats-io/java-nats-streaming/tree/version2) of the Java NATS Streaming library is in progress, available in a branch, and should be released by the end of the month.

This new version uses 1.8 features of Java and is not optimized for mobile (Android). But perhaps we can improve on that with your help. If you are using NATS for Android and have ideas, please open issues on the [repo](https://github.com/nats-io/java-nats).

We believe the Java community will enjoy this new version and with your help we can make NATS even more Java friendly.
