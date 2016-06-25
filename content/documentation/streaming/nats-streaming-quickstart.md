+++
date = "2016-06-18"
title = "Getting Started with NATS Streaming"
description = ""
category = "tutorials"
[menu.main]
  name = "Getting started with NATS Streaming"
  weight = 9
  identifier = "tutorial-nats-streaming"
  parent = "Streaming"
+++

This tutorial demonstrates NATS Streaming using example [Go NATS Streaming clients](https://github.com/nats-io/go-nats-streaming.git). 

**Prerequisites**

- [Set up your Git environment](https://help.github.com/articles/set-up-git/).
- [Set up your Go environment](https://golang.org/doc/install).

**Setup**

Download and install the [NATS Streaming Server](https://github.com/nats-io/stan-server-preview/releases).

Clone the following repositories:

- NATS Streaming Server: `git clone https://github.com/nats-io/nats-streaming-server.git`
- NATS Streaming Client: `git clone https://github.com/nats-io/go-nats-streaming.git`

**Start the NATS Streaming Server**

Two options:

Run the binary that you downloaded, for example: `$ ./nats-streaming-server`

Or, run from source:

```
$ cd $GOPATH/src/github.com/nats-streaming-server
$ go run nats-streaming-server.go
```

You should see the following, indicating that the NATS Streaming Server is running:

```
go run nats-streaming-server.go
[89999] 2016/06/25 08:54:35.399071 [INF] Starting nats-streaming-server[test-cluster] version 0.1.0
[89999] 2016/06/25 08:54:35.399315 [INF] Starting nats-server version 0.9.0.beta
[89999] 2016/06/25 08:54:35.399326 [INF] Listening for client connections on localhost:4222
[89999] 2016/06/25 08:54:35.400721 [INF] Server is ready
[89999] 2016/06/25 08:54:35.737589 [INF] STAN: Message store is MEMORY
[89999] 2016/06/25 08:54:35.737610 [INF] STAN: Maximum of 1000000 will be stored
```

**Run the publisher client**

Publish several messages. For each publication you should get a result.

```
$ cd $GOPATH/src/github.com/go-nats-streaming/examples
go run stan-pub.go foo "msg one"
Published [foo] : 'msg one'
$ go run stan-pub.go foo "msg two"
Published [foo] : 'msg two'
$ go run stan-pub.go foo "msg three"
Published [foo] : 'msg three'
$ 
```

**Run the subscriber client**

Use the `--all` flag to receive all published messages.

```
$ go run stan-sub.go --all -c test-cluster -id myID foo
Connected to nats://localhost:4222 clusterID: [test-cluster] clientID: [myID]
subscribing with DeliverAllAvailable
Listening on [foo], clientID=[myID], qgroup=[] durable=[]
[#1] Received on [foo]: 'sequence:1 subject:"foo" data:"msg one" timestamp:1465962202884478817 '
[#2] Received on [foo]: 'sequence:2 subject:"foo" data:"msg two" timestamp:1465962208545003897 '
[#3] Received on [foo]: 'sequence:3 subject:"foo" data:"msg three" timestamp:1465962215567601196
```

**Explore other subscription options**

```
	--seq <seqno>                   Start at seqno
	--all                           Deliver all available messages
	--last                          Deliver starting with last published message
	--since <duration>              Deliver messages in last interval (e.g. 1s, 1hr, https://golang.org/pkg/time/#ParseDuration)
	--durable <name>                Durable subscriber name
	--unsubscribe                   Unsubscribe the durable on exit
```