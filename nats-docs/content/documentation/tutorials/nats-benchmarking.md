+++
date = "2015-09-27"
title = "Benchmark and Tune NATS"
description = ""
category = "tutorials"
[menu.main]
  name = "Benchmark and Tune NATS"
  weight = 10
  identifier = "tutorial-nats-benchmarking"
  parent = "tutorials"
+++

# Benchmark and Tune NATS

NATS is fast and lightweight and places a premium on performance. NATS provides hooks for measuring and tuning performance. In this tutorial you learn how to benchmark and tune NATS.

## Prerequisites

- [Set up your Go environment](/documentation/tutorials/go-install/)
- [Installed the NATS server](/documentation/tutorials/gnatsd-install/)

## Instructions

**1. Start the NATS server with monitoring enabled.**

```
gnatsd -m 8222
```

Verify that the NATS server starts successfully, as well as the HTTP monitor:

```
[4528] 2015/08/19 20:09:58.572939 [INF] Starting gnatsd version 0.6.4
[4528] 2015/08/19 20:09:58.573007 [INF] Starting http monitor on port 8222
[4528] 2015/08/19 20:09:58.573071 [INF] Listening for client connections on 0.0.0.0:4222
[4528] 2015/08/19 20:09:58.573090 [INF] gnatsd is ready
```

**2. Set up the NATS Java client.**

If necessary, download and install [JDK 1.7](http://www.oracle.com/technetwork/java/javase/downloads/jdk7-downloads-1880260.html).

Clone the [Java client for NATS](https://github.com/tyagihas/java_nats) from the GitHub repository:

```
git clone https://github.com/tyagihas/java_nats.git
```

Set up your NATS Java client environment by running these commands:

```
cd java_nats
javac -d ./bin ./src/main/java/org/nats/*.java
export CLASSPATH=./bin
javac -d ./bin ./src/test/java/org/nats/benchmark/*.java
javac -d ./bin ./src/test/java/org/nats/examples/*.java
```

**3. Run the publisher performance test.**

```
cd ./bin

bash ./PubPerf.sh 100000 16
```

The publisher performance test publishes the specified number of messages. The output tells you how long NATS took to publish the messages, and the message rate per second.

Increase the number of messages published:

```
bash ./PubPerf.sh 10000000 16
```

You’ll see that it takes NATS approximately 2 seconds to publish the messages.

```
Performing Publish performance test

++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

…

++++++++++++++++++++++++++++++++++++++++

elapsed : 2.048766 seconds

msg/sec : 4880986.896502578
```

**4. Run the pub-sub performance test.**

```
bash ./PubSubPerf.sh 10000 16
```

The publisher sends all the messages and the subscriber consumes each. The output tells you how long NATS took to produce and consume all the messages, and the rate per second.

```
Performing Publish/Subscribe performance test

++++

elapsed : 0.040427 seconds

msg/sec : 247359.4379993569

Exiting...
```
