+++
date = "2015-09-27"
title = "Go Client"
description = "Usage details for Go NATS client"
category = "clients"
[menu.documentation]
  name = "Go Client"
  weight = 1
  identifier = "clients-go-client"
  parent = "clients"
+++

# Go Client for NATS

[Apcera](https://www.apcera.com/) actively maintains and supports the [Go](http://golang.org) client for [NATS](https://nats.io).

## Installation

To install the Go client library for NATS:

```
go get github.com/nats-io/nats
```

## Go client demos

Refer to the [NATS Pub Sub](/documentation/tutorials/nats-pub-sub) and [NATS Request Reply](/documentation/tutorials/nats-req-rep) tutorials.

## Basic client usage

The following examples demonstrate basic usage for the Go client.

```
// Server connection
nc, _ := nats.Connect(nats.DefaultURL)

// Simple Publisher
nc.Publish("foo", []byte("Hello World"))

// Simple Async Subscriber
nc.Subscribe("foo", func(m *nats.Msg) {
    fmt.Printf("Received a message: %s\n", string(m.Data))
})

// Simple Sync Subscriber
sub, err := nc.SubscribeSync("foo")
m, err := sub.NextMsg(timeout)

// Unsubscribing
sub, err := nc.Subscribe("foo", nil)
sub.Unsubscribe()

// Requests
msg, err := nc.Request("help", []byte("help me"), 10*time.Millisecond)

// Replies
nc.Subscribe("help", func(m *nats.Msg) {
    nc.Publish(m.Reply, []byte("I can help!"))
})

// Close connection
nc := nats.Connect("nats://localhost:4222")
nc.Close();
```

## Wildcard subscriptions

The asterisk character (`*`) matches any token at any level of the subject.

The greater than symbol (`>`) matches any length of the tail of a subject, and can only be the last token. For example: the wildcard subscription `foo.>` will match `foo.bar`, `foo.bar.baz`, and `foo.foo.bar.bax.22`.

```
nc.Subscribe("foo.*.baz", func(m *nats.Msg) {
    fmt.Printf("Msg received on [%s] : %s\n", m.Subject, string(m.Data));
})

nc.Subscribe("foo.bar.*", func(m *nats.Msg) {
    fmt.Printf("Msg received on [%s] : %s\n", m.Subject, string(m.Data));
})

nc.Subscribe("foo.>", func(m *nats.Msg) {
    fmt.Printf("Msg received on [%s] : %s\n", m.Subject, string(m.Data));
})

// Matches all of the above
nc.Publish("foo.bar.baz", []byte("Hello World"))
```

## Queue groups

All subscriptions with the same queue name will form a queue group. NATS queuing semantics stipulate that each message will be delivered to only one subscriber per queue group. You can have as many queue groups as you wish. Normal subscribers will continue to work as expected.

```
nc.QueueSubscribe("foo", "job_workers", func(_ *nats.Msg) {
  received += 1;
})
```

## Encoded usage

The Go client library for NATS supports three types of message encoders:

- Default encoder
- GOB encoder
- JSON encoder

### Default message encoder

The default encoder leaves untouched the `string` and `[ ]byte` fields of a NATS message. It is up to the receiving application to parse (decode) these them. The default encoder will also propely encode and decode booleans. However, the default encoder will attempt to turn numbers into appropriate strings that can be decoded (parsed).

To have more control over structures, you can use the GOB or JSON encoders provided by Go.

### GOB message encoder

The [GOB encoder](https://golang.org/pkg/encoding/gob/) is a binary format for transmitting messages as streams or for saving to file. The gob package manages streams of binary values exchanged between an encoder (publisher) and a decoder (subscriber).

### JSON message encoder

The [JSON encoder](https://golang.org/pkg/encoding/json/) uses the built in encoding/json package to marshal and unmarshal most types, including structs. The json package implements encoding and decoding of JSON objects as defined in RFC 4627.

The following example shows how to publish and consume JSON-encoded NATS messages for Go clients.

```
nc, _ := nats.Connect(nats.DefaultURL)
c, _ := nats.NewEncodedConn(nc, nats.JSON_ENCODER)
defer c.Close()

// Simple Publisher
c.Publish("foo", "Hello World")

// Simple Async Subscriber
c.Subscribe("foo", func(s string) {
    fmt.Printf("Received a message: %s\n", s)
})

// EncodedConn can Publish any raw Go type using the registered Encoder
type person struct {
     Name     string
     Address  string
     Age      int
}

// Go type Subscriber
c.Subscribe("hello", func(p *person) {
    fmt.Printf("Received a person: %+v\n", p)
})

me := &person{Name: "derek", Age: 22, Address: "585 Howard Street, San Francisco, CA"}

// Go type Publisher
c.Publish("hello", me)

// Unsubscribing
sub, err := c.Subscribe("foo", nil)
...
sub.Unsubscribe()

// Requests
var response string
err := nc.Request("help", "help me", &response, 10*time.Millisecond)

// Replying
c.Subscribe("help", func(subj, reply string, msg string) {
    c.Publish(reply, "I can help!")
})

// Close connection
c.Close();
```

## Go Channels (netchan)

The following example shows how to use Go channels.

```
nc, _ := nats.Connect(nats.DefaultURL)
ec, _ := nats.NewEncodedConn(nc, "json")
defer ec.Close()

type person struct {
     Name     string
     Address  string
     Age      int
}

recvCh := make(chan *person)
ec.BindRecvChan("hello", recvCh)

sendCh := make(chan *person)
ec.BindSendChan("hello", sendCh)

me := &person{Name: "derek", Age: 22, Address: "585 Howard Street"}

// Send via Go channels
sendCh <- me

// Receive via Go channels
who := <- recvCh
```

## Clustered usage

The following demonstrates how to configure the Go client for clustered server mode.

```
var servers = []string{
	"nats://localhost:1222",
	"nats://localhost:1223",
	"nats://localhost:1224",
}

// Setup options to include all servers in the cluster
opts := nats.DefaultOptions
opts.Servers = servers

// Optionally set ReconnectWait and MaxReconnect attempts.
// This example means 10 seconds total per backend.
opts.MaxReconnect = 5
opts.ReconnectWait = (2 * time.Second)

// Optionally disable randomization of the server pool
opts.NoRandomize = true

nc, err := opts.Connect()

// Setup callbacks to be notified on disconnects and reconnects
nc.Opts.DisconnectedCB = func(_ *Conn) {
    fmt.Printf("Got disconnected!\n")
}

// See who we are connected to on reconnect.
nc.Opts.ReconnectedCB = func(nc *Conn) {
    fmt.Printf("Got reconnected to %v!\n", nc.ConnectedUrl())
}
```

## Storing and dispatching subscription callbacks

When you make a subscription to the server, you need to store and dispatch callback handlers. The Go client library provides the following methods.

### ClosedCB

Called when the connection is closed. From the client you detected that the server disconnected the client. the closeCB is used to decide what to do when the server closes the connection.

### DisconnectedCB

Called if the server dies or crashes.

### ReconnecteCB

Reconnect to a crashed server. Here you implement reconnection logic. Add the two examples from the readme.

### AsynchErrorCB

You can have asynchronous and synchronous errors. An example of asynchronous error is when you make a publish that is malformed, such as more bytes than the subscriber has allowed: `hello 5` but you send 11 bytes. The error is a malformed protocol. The server sends you the error message `-ERR Parser error` and the connection is closed.

Synchronous error is when the client is being smarter about how to handle the error. For example, if the max payload is 1 MB and you exceed this. Note that the client is not aware of its own connection.

## Advanced Usage

The following examples demonstrate advanced usage for the Node client.

### Flush connections

Flush connection to server, returns when all messages have been processed.

```
nc.Flush()
fmt.Println("All clear!")
```

FlushTimeout specifies a timeout value as well.

```
err := nc.FlushTimeout(1*time.Second)
if err != nil {
    fmt.Println("All clear!")
} else {
    fmt.Println("Flushed timed out!")
}
```

### Auto unsubscribe

Automatically unsubscribe after the maximum number of messages (MAX_WANTED) is received.

```
const MAX_WANTED = 10
sub, err := nc.Subscribe("foo")
sub.AutoUnsubscribe(MAX_WANTED)
```

### Multiple connections

```
nc1 := nats.Connect("nats://host1:4222")
nc2 := nats.Connect("nats://host2:4222")

nc1.Subscribe("foo", func(m *nats.Msg) {
    fmt.Printf("Received a message: %s\n", string(m.Data))
})

nc2.Publish("foo", []byte("Hello World!"));
```
