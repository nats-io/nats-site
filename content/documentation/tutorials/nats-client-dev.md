+++
date = "2015-09-27"
title = "Develop Go Clients for NATS"
description = ""
category = "tutorials"
[menu.main]
  name = "Develop Go Clients for NATS"
  weight = 11
  identifier = "tutorial-nats-client-dev"
  parent = "Tutorials"
+++

# Develop Go Clients for NATS

This tutorial describes how to write a NATS client in Go starting with basic functionality and adding features to it.

It is assumed that you have set up your Go environment and have the NATS server running.

## NATS client

A NATS client is a producer or consumer of a NATS message. Producers are message publishers and consumers are message subscribers. Subscribers can be asynchronous or synchronous. NATS clients communicate in a peer-to-peer fashion via the NATS server. Clients do not need to know of each other's location to communicate.

There are several client libraries for NATS, and Apcera actively maintains and supports several of these. In addition, you can write your own.

## Solution files

The /nats-docs/tutorials/examples/ directory provides the client code that is presented in this guide. The code is explained in detail below. You are encouraged to write the code yourself and experiment, or you can run each client as-is.

## Asynchronous subscriber

The `async-sub.go` client is a basic asynchronous subscriber with logging included for debugging purposes.

### Example code

```
package main

// Import Go and NATS packages
import (
  "runtime"
  "log"

  "github.com/nats-io/go-nats"
)

func main() {

    // Create server connection
    natsConnection, _ := nats.Connect(nats.DefaultURL)
    log.Println("Connected to " + nats.DefaultURL)

    // Subscribe to subject
    log.Printf("Subscribing to subject 'foo'\n")
    natsConnection.Subscribe("foo", func(msg *nats.Msg) {

      // Handle the message
      log.Printf("Received message '%s\n", string(msg.Data) + "'")
  })

  // Keep the connection alive
  runtime.Goexit()
}
```

### Import packages

The client imports the required `nats` package, as well as the `runtime` Go package which is required for subscribers. We use functions from the Go `log` package to log client messages.

### Create server connection

The client makes a connection to the NATS server. The client connects to the NATS server running on the default port: `nats://localhost:4222`.

### Subscribe to subject

The client subscribes to a NATS message on subject "foo." The subscriber method returns the payload of a received message.

### Handle the message

The subscriber implements a message handler to process the message asynchronously. In this case, the client is simply logging each received message. Without an explicit message handler, the subscription is synchronous requiring additional client code to process the message (see synchronous subscriber example below).

### Keep the connection alive

The [runtime.Goexit](http://golang.org/src/runtime/panic.go?s=8250:8263#L289) function keeps the subscriber active after the main function is executed. In other words, the client does not terminate after a single message is received.

### Test

When you have coded the subscriber, run it as follows:

```
go run async-sub.go foo
```

Expected result:

```
go run async-sub.go foo
2015/09/26 17:40:54 Connected to nats://localhost:4222
2015/09/26 17:40:54 Subscribing to subject 'foo'
```

## Simple publisher

The `pub-simple.go` client publishes a simple NATS message ("Hello NATS") on subject name "foo." The async-sub.go client should receive this message.

### Example code

```
package main

// Import packages
import (
  "log"

  "github.com/nats-io/go-nats"
)

func main() {

  // Connect to server; defer close
  natsConnection, _ := nats.Connect(nats.DefaultURL)
  defer natsConnection.Close()
  log.Println("Connected to " + nats.DefaultURL)

  // Publish message on subject
  subject := "foo"
  natsConnection.Publish(subject, []byte("Hello NATS"))
  log.Println("Published message on subject " + subject)
}
```

### Import packages

The client imports the required `nats` package, as well as the Go `log` package to log client messages.

### Create server connection

The client makes a connection to the NATS server. The client connects to the NATS server running on the default port: `nats://localhost:4222`. The client also defers closing the connection until after the message is sent.

### Publish simple payload

The client publishes the message "Hello NATS" on subject "foo." The `async-sub.go` client receives this message.

After you have written this client, you can explore pub-sub messaging using the two clients you have written. Experiment with changing the subject name and use a wildcard subscriber. To go further, add a message incrementer to the client subscriber to indicate the message number received.

### Test

When you have coded the subscriber, run it as follows:

```
go run async-sub.go foo
```

Expected result:

```
go run pub-simple.go foo hello nats
2015/09/26 17:48:16 Connected to nats://localhost:4222
2015/09/26 17:48:16 Published message on subject foo
```

## Message publisher

In addition to a simple message payload (string), you can also use the message struct. The solution file `pub-msg.go` demonstrates one such implementation.

### Example code

```
package main

import (
  "fmt"
  "log"

  "github.com/nats-io/go-nats"
)

func main() {
    fmt.Println("Publishing Hello World")

    natsConnection, _ := nats.Connect(nats.DefaultURL)
    defer natsConnection.Close()
    fmt.Println("Connected to NATS server: " + nats.DefaultURL)

    // Msg structure
    msg := &nats.Msg{Subject: "foo", Reply: "bar", Data: []byte("Hello World")}
    natsConnection.PublishMsg(msg)

    log.Println("Published msg.Subject = " + msg.Subject, "| msg.Data = " + string(msg.Data))
}
```

## Synchronous subscriber

A synchronous subscriber does not implement a message handler with the subscriber. Instead the client is responsible for implementing code to process the message. The client is blocked from receiving more messages until it process the received message.

For example:

```
sub, err := nc.SubscribeSync("foo")
m, err := sub.NextMsg(timeout)
```

## Client authentication

You can enable authentication on the NATS server so that a client must authentication when connecting.

As shown below, you can start the server with authentication required by passing in the required credentials with the server start command. Alternatively, you can enable authentication and set the credentials in the server configuration file.

For example, using the command line:

```
gnatsd -DV -m 8222 -user foo -pass bar
```

Then, update your `async-sub.go` client as follows:

```
package main

import (
  "runtime"
  "log"

  "github.com/nats-io/go-nats"
)

func main() {

    // Create authentication server connection
    natsConnection, _ := nats.Connect("nats://foo:bar@localhost:4222")
    log.Println("Connected to " + nats.DefaultURL)

    // Subscribe to subject
    log.Printf("Subscribing to subject 'foo'\n")
    natsConnection.Subscribe("foo", func(msg *nats.Msg) {

      // Handle the message
      log.Printf("Received message '%s\n", string(msg.Data) + "'")
  })

  // Keep the connection alive
  runtime.Goexit()
}
```

And, do the same for the `pub-simple.go` client as well:

```
package main

import (
  "log"

  "github.com/nats-io/go-nats"
)

func main() {

    // Connect to server with auth credentials
    natsConnectionString := "nats://foo:bar@localhost:4222"
    natsConnection, _ := nats.Connect(natsConnectionString)
    defer natsConnection.Close()
    log.Println("Connected to " + natsConnectionString)

    // Publish message on subject
    subject := "foo"
    natsConnection.Publish(subject, []byte("Hello NATS"))
    log.Println("Published message on subject " + subject)
}
```

## Error handling, disconnecting and reconnecting

The server reports an error similar to the following if the credentials are not right:

```
[49163] 2015/09/05 19:13:24.488825 [ERR] ::1:65218 - cid:1 - Authorization Error
```

The `-DV` flag enables trace and debug for the server, which is recommended when using auth. The server reports information such as the following:

```
$ gnatsd -DV -m 8222 -user foo -pass bar

[49163] 2015/09/05 19:06:03.235424 [INF] Starting gnatsd version 0.6.6
[49163] 2015/09/05 19:06:03.235526 [INF] Starting http monitor on port 8222
[49163] 2015/09/05 19:06:03.236509 [INF] Listening for client connections on 0.0.0.0:4222
[49163] 2015/09/05 19:06:03.236546 [INF] gnatsd is ready
[49163] 2015/09/05 19:13:24.485939 [DBG] ::1:65218 - cid:1 - Client connection created
[49163] 2015/09/05 19:13:24.488699 [TRC] ::1:65218 - cid:1 - ->> [CONNECT {"verbose":false,"pedantic":false,"ssl_required":false,"name":"","lang":"go","version":"1.1.0"}]
[49163] 2015/09/05 19:13:24.488825 [ERR] ::1:65218 - cid:1 - Authorization Error
[49163] 2015/09/05 19:13:24.488847 [DBG] ::1:65218 - cid:1 - Client connection closed
[49163] 2015/09/05 19:18:56.334749 [DBG] ::1:65301 - cid:4 - Client connection created
[49163] 2015/09/05 19:18:56.335130 [TRC] ::1:65301 - cid:4 - ->> [CONNECT {"verbose":false,"pedantic":false,"user":"foo","pass":"bar","ssl_required":false,"name":"","lang":"go","version":"1.1.0"}]
[49163] 2015/09/05 19:18:56.335160 [TRC] ::1:65301 - cid:4 - ->> [PING]
[49163] 2015/09/05 19:18:56.335164 [TRC] ::1:65301 - cid:4 - <<- [PONG]
[49163] 2015/09/05 19:18:56.335452 [TRC] ::1:65301 - cid:4 - ->> [SUB foo  1]
[49163] 2015/09/05 19:19:14.317482 [DBG] ::1:65308 - cid:5 - Client connection created
[49163] 2015/09/05 19:19:14.317791 [TRC] ::1:65308 - cid:5 - ->> [CONNECT {"verbose":false,"pedantic":false,"user":"foo","pass":"bar","ssl_required":false,"name":"","lang":"go","version":"1.1.0"}]
[49163] 2015/09/05 19:19:14.317816 [TRC] ::1:65308 - cid:5 - ->> [PING]
[49163] 2015/09/05 19:19:14.317820 [TRC] ::1:65308 - cid:5 - <<- [PONG]
[49163] 2015/09/05 19:19:14.318053 [TRC] ::1:65308 - cid:5 - ->> [PUB foo 10]
[49163] 2015/09/05 19:19:14.318066 [TRC] ::1:65308 - cid:5 - ->> MSG_PAYLOAD: [Hello NATS]
[49163] 2015/09/05 19:19:14.318082 [TRC] ::1:65301 - cid:4 - <<- [MSG foo 1 10]
[49163] 2015/09/05 19:19:14.319103 [DBG] ::1:65308 - cid:5 - Client connection closed
[49163] 2015/09/05 19:19:23.511810 [DBG] ::1:65301 - cid:4 - Client connection closed
^C[49163] 2015/09/05 19:31:52.968571 [DBG] Trapped Signal; interrupt
[49163] 2015/09/05 19:31:52.968585 [INF] Server Exiting..
```
