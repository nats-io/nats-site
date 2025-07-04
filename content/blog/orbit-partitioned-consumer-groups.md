+++
categories = ["Engineering", "General"]
date = "2025-06-05"
tags = ["NATS", "JetStream", "Partitioning", "Strictly-ordered","Kafka"]
title = "Client-side Partitioned Consumer Groups for JetStream"
author = "Jean-Noël Moyne"
+++

Just added to [Orbit.go](https://github.com/synadia-io/orbit.go) is the new client-side implementation of a frequently requested feature: '[partitioned consumer groups](https://github.com/synadia-io/orbit.go/tree/main/pcgroups)' for NATS JetStream! 

This library is so named because what it implements is functionally equivalent to what Apache Kafka calls 'consumer groups' and how they implement partitioning, although the functionality is not unique to Kafka. It is purely implemented by the clients using the library but requires new server functionalities introduced with NATS server version 2.11. Note that there may be some new server functionalities introduced in post 2.11 versions that would push some of this functionality into the server and would make this library much smaller.

# What is it, and why would you need it

So, one of the big fundamental differences between NATS JetStream and the other streaming systems such as Apache Kafka, is the approach to scaling message consumption from Streams. NATS is unique in that it does not require you to partition Streams in order to parallelize consumption from the Stream, while the others force you to use partitioning if you want to have more than just one consuming thread on the Stream.

Initially that's great: you never have to worry about how many instances will be pulling messages from the same JetStream consumer at the same time. The messages are distributed on an on-demand basis, it's completely elastic, you never have to worry about the figuring out the right number of partitions, re-partitioning, or limits on total number of partitions. While this is great and works to parallelize consumption for most use cases, there is one main exception for use cases that require 'strictly in order consumption' from the messages in the Stream. 

As the name says, this is for when you absolutely cannot consume messages out of order from the Stream. Now regular JetStream consumers do deliver messages in order, but as soon as you allow the consumer to deliver to instances with consuming client applications with more than one message at a time (in-flight), then there is a theoretical possibility that two messages could be processed 'out of order' (e.g. re-deliveries happen, or one client instance is much slower at processing messages than another one). So to guarantee an always in-order processing of the messages, you can only deliver and process one message at a time. For JetStream, this means you have to set the maximum number of acknowledgements pending for the consumer to exactly 1, and the (desired) side effect is that you serialize the consumption for the whole Stream, no parallelization, very limited throughput.

Now, if the use case requires strictly ordered consumption of _all_ of the messages in a Stream, then you have no other option than to serialize the whole Stream. However, in reality, most use cases don't need strict ordering of all of the messages in the Stream, but only of all _related_ (by some common part of the subject) messages in the Stream. For example, you don't need to process all requests from all customers in strict order, but you need to process all of the requests of a particular customer in strict order. Just like Apache Kafka's consumer groups, this library addresses this specific use case by allowing you to parallelize consumption of messages from a Stream (such that you can consume with max acks pending set to 1 to ensure the consumption is strictly ordered for all messages with the same 'key').

There are other use cases that can leverage partitioned distribution of the consumption on a Stream (e.g. optimizing local data caching), but per subject strictly ordered consumption is by far the main need for it.

# What is does

This library enables the parallelization through partitioning of the consumption of messages from a single Stream using all or parts of the message's subject as a partitioning key.

It allows the creation of any number of durable 'consumer groups' on a Stream, where each 'member' of the consumer group can consume from the group in parallel (with max acks pending set to 1 if needed), with the guarantee that in no way more than one message for a particular key can be consumed at the same time. Client applications wanting to consume messages from the group simply do so using a 'member name' and providing a callback. The library leverages the 'pinned consumer' server functionality to provide fault-tolerance of members: even if more than one instance of a member is deployed, only one of those instances will deliver messages at a time.

The library is meant to make the partitioning as transparent to the users as possible. Partition numbers are basically invisible to the library users and administrators. They only need to worry about membership names and provide a 'maximum number of members' when creating the consumer group (the actual number of members can be anything between 1 (no parallelization) and that maximum). The balanced mapping between member names and partition numbers is done automatically, or you can specify a custom set of 'member name to set of partition numbers' mappings if you want to skew the distribution in any way (e.g because balanced distribution has hot-spots). The partition number computation is done using a consistent hashing algorithm of the value(s) of any of the subject token(s).

NATS Partitioned consumer groups come in two flavors: *elastic* and *static*.

## Static Partitioned Consumer Groups
***Static*** partitioned consumer groups assume that the Stream already has a partition number present as the first token of the message's subjects (something that can be done automatically when messages are stored in the Stream by setting a subject transform for the Stream). You can only create and delete static consumer groups. You can create as many consumer groups (each if a different number or set of members, up to the max number of members) as you want on the same Stream. Static partitioned consumer groups can have any acknowledgement mode, but if you want strict in order processing then you will need to use explicit acknowledgements.

The advantages of static partitioned consumer groups over elastic are lower latency and faster speeds, and fewer server resources being used. The disadvantage is obviously that they are static: you can not change the membership of a group, you have to delete and re-create.

### How it's implemented
In static mode, all the library does is automate the partition to member mapping and the creation of the actual JetStream consumers that the members' instances uses to receive messages.

## Elastic Partitioned Consumer Groups
***Elastic*** partitioned consumer groups on the other hand are implemented differently: the Stream doesn't need to already contain a partition number subject token (so you can create elastic consumer groups on any Stream you may already have) and you can administratively add and drop members from the consumer group's config whenever you want without having to delete and re-create the consumer (like you have to with static consumer groups). You can create multiple elastic consumer groups on the same Stream, each with its own maximum number of members. Elastic partitioned consumer groups must use explicit acknowledgements.

Compared to static partitioned consumer groups, elastic groups will use more resources on the server and will have slightly higher latency, but the obvious advantage is that they are elastic, you can scale consumption up and down simply by adding or removing members administratively from the group at any time with almost no interruption in the consumption of the messages.

### How it's implemented
In elastic mode, the consumer group is implemented a bit like a materialized view in a database. The consumer group is 'materialized' into a work queue Stream that the library automatically creates and that sources from the Stream being consumed on, inserting a partition number as part of that sourcing. This library automatically creates and updates the JetStream consumers on this work queue Stream as the membership changes.

Because the elastic consumer group's work queue Stream contains copies of the messages in the original Stream, when the members are consuming, you can tell 'how far behind' message consumption is by monitoring the size of that Stream. You can also control the maximum size a work queue Stream can grow to by specifying a max size (in number of messages or bytes) when creating the elastic consumer group, in which case if the Stream reaches a size limit when sourcing messages, then the sourcing pauses for about 1 second before attempting to resume.

# How to use it

For the client application programmer, there is one basic functionality exposed by both static and elastic partitioned consumer groups: join and potentially consume messages from a named consumer group on a Stream by specifying a _member name_, a regular JetStream consumer config, and a _callback_.

There are also administrative functions to create and delete consumer groups, and only in the case of elastic consumer groups, the ability to add/drop members or to change the custom member to partition mappings on an existing elastic consumer group.

## The `cg` tool

The repository also includes a CLI tool, located in the `cg` directory, to administratively interact with and manage partitioned consumer groups and their client instances (it can even be used to consume messages, allowing you to play with, test, or demonstrate the partitioned consumer group functionality).

This `cg` CLI tool can be used by passing it commands and arguments directly, or with an interactive prompt using the `prompt` command (e.g. `cg static prompt`).

## Demo walkthrough

See the walkthrough [here](https://github.com/synadia-io/orbit.go/blob/main/pcgroups/README.md#demo-walkthrough).
