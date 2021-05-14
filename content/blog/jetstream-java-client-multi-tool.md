+++
categories = ["Clients", "Java", "JetStream"]
date = "2021-05-13"
tags = ["java", "stream", "publish", "subscribe", "benchmark", "tool"]
title = "NATS Java Client JetStream Multi Tool"
author = "Scott Fauerbach"
+++

As we were building the [NATS Java client](https://github.com/nats-io/nats.java) we realized we wanted code to run the client through its paces.
We built unit tests, example code and added basic functionality to our existing benchmarking tool.

As we talked to prospective users, they were asking for benchmarks across the variety of different ways we can publish and subscribe.
For instance see publishing synchronous versus asynchronous. 
Push versus pull consuming. Different amounts of threading with shared or individual connections to the server.
You get the idea. So we set out to build a tool to do just that.

No matter the functionality being tested, there were several things in common:

* Threading and connections to the server.
* The ability to be run with command line arguments or from java code.
* Statistics.
* Commonality between varieties of publishing like payload size.
* Commonality between varieties of subscriptions like ack policy.

So it made sense to put everything into one program and the 
[NATS Java Client JetStream Multi Tool](https://github.com/nats-io/nats.java/tree/main/src/examples/java/io/nats/examples/jsmulti)
was created to provide complete exercising and benchmarking specific to the NATS Java client with the intent of establishing a baseline for client performance and behavior.

> Administration and server related benchmarking of NATS should prefer the [NATS CLI](https://github.com/nats-io/natscli) tooling, especially in production environments.

I know what you are thinking. All developers worth their salt agonize on naming stuff and the best you could come up with is "Multi Tool"? 
How good could it be? Well, it's not like I'm asking you to trust a developer who's wearing a suit and tie!

Really, I swear, trust me! This tool is great.
Want to publish a million messages with 3 threads over separate connections to the server? Use the multi-tool.
Want to consume those messages multi-threaded simulating 4 consumers in a queue? That's right, use the multi-tool.
But wait, there's more! As a bonus, you get benchmarking statistics!

```
| --------- | -------------- | -------------- | --------------------- | -------------- |
|           |          count |           time |              msgs/sec |      bytes/sec |
| --------- | -------------- | -------------- | --------------------- | -------------- |
| Thread 1  |   100,000 msgs |   9,511.930 ms |   10,513.114 msgs/sec |    1.28 mb/sec |
| Thread 2  |   100,000 msgs |   9,546.104 ms |   10,475.477 msgs/sec |    1.28 mb/sec |
| Thread 3  |   100,000 msgs |   9,533.454 ms |   10,489.377 msgs/sec |    1.28 mb/sec |
| --------- | -------------- | -------------- | --------------------- | -------------- |
| Total     |   300,000 msgs |   9,546.104 ms |   31,426.432 msgs/sec |    3.84 mb/sec |
| --------- | -------------- | -------------- | --------------------- | -------------- |
```

In all seriousness, there is a lot of functionality wrapped up in the tool. 
I even took some time to document it because we know everyone loves to read docs. 
Please check out the [NATS Java Client JetStream Multi Tool](https://github.com/nats-io/nats.java/tree/main/src/examples/java/io/nats/examples/jsmulti)

## About the Author

Scott Fauerbach is a member of the engineering team at [Synadia Communications](https://synadia.com).
