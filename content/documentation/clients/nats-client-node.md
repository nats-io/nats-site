+++
date = "2015-09-27"
title = "Node Client"
category = "clients"
[menu.main]
  name = "Node Client"
  weight = 2
  identifier = "clients-node-client"
  parent = "Clients"
+++

# Node.js Client for NATS

[Apcera](https://www.apcera.com/) actively maintains and supports the [Node.js](http://nodejs.org/) client for [NATS](https://nats.io).

## Installation

To install the Node.js client:

```
[sudo] npm install nats
```

Typically the Node client installs to directory `node_modules/nats`.

## Node client demo

Start NATS server:

```
gnatsd
```

CD to Node.js client install directory:

```
cd node_modules/nats/examples
```

Run the subscriber on subject `foo`:

```
node node-sub.js foo
```

Expected result:

```
node node-sub.js foo
Listening on [foo]
```

Publish a message:

```
node node-pub.js foo "Hello NATS"
```

Expected result publisher:

```
node node-pub.js foo "Hello NATS"
Published [foo] : "Hello NATS"
```

Expected result subscriber:

```
node node-sub.js foo
Listening on [foo]
Received "Hello NATS"
```

## Basic usage

The following examples demonstrate basic usage for the Node client.

```
// Server connection
var nats = require('nats').connect();

// Simple Publisher
nats.publish('foo', 'Hello World!');

// Simple Subscriber
nats.subscribe('foo', function(msg) {
  console.log('Received a message: ' + msg);
});

// Unsubscribing
var sid = nats.subscribe('foo', function(msg) {});
nats.unsubscribe(sid);

// Requests
nats.request('help', function(response) {
  console.log('Got a response for help: ' + response);
});

// Replies
nats.subscribe('help', function(request, replyTo) {
  nats.publish(replyTo, 'I can help!');
});

// Close connection
nats.close();

end
```

## Wildcard subscriptions

The asterisk character (`*`) matches any token, at any level of the subject.

The greater than symbol (`>`) matches any length of the tail of a subject, and can only be the last token. For example: the wildcard subscription `foo.>` will match `foo.bar`, `foo.bar.baz`, and `foo.foo.bar.bax.22`.

```
nats.subscribe('foo.*.baz', function(msg, reply, subject) {
  console.log('Msg received on [' + subject + '] : ' + msg);
});

nats.subscribe('foo.bar.*', function(msg, reply, subject) {
  console.log('Msg received on [' + subject + '] : ' + msg);
});

nats.subscribe('foo.>', function(msg, reply, subject) {
  console.log('Msg received on [' + subject + '] : ' + msg);
});
```

## Queue groups

All subscriptions with the same queue name will form a queue group. NATS queuing semantics stipulate that each message will be delivered to only one subscriber per queue group. You can have as many queue groups as you wish. Normal subscribers will continue to work as expected.

```
nats.subscribe('foo', {'queue':'job.workers'}, function() {
  received += 1;
});
```

## Clustered usage

If your NATS servers are clustered, you can configure the client to randomly connect to a server in the cluster group.

The `currentServer` is the URL of the connected server.

You can override the default random connection behavior and preserve the order when connecting to servers.

```
var nats = require('nats');

var servers = ['nats://nats.io:4222', 'nats://nats.io:5222', 'nats://nats.io:6222'];

var nc = nats.connect({'servers': servers});

console.log("Connected to " + nc.currentServer.host);

nc = nats.connect({'dontRandomize': true, 'servers':servers});
```

## Advanced usage

The following examples demonstrate advanced usage for the Node client.

### Publish with closure

You can publish a message with a closure, in which case the callback fires when server has processed the message.

```
nats.publish('foo', 'You done?', function() {
  console.log('msg processed!');
});
```

### Flush connections

You can flush the connection to server, in which case the callback fires when all messages have been processed.

```
nats.flush(function() {
  console.log('All clear!');
});
```

### Subscription timeouts

Subscriber times out if the message is not received within the timeout interval.

```
var sid = nats.subscribe('foo', function() {
  received += 1;
});
```

The client times out if the expected number of messages have not been received.

```
nats.timeout(sid, timeout_ms, expected, function() {
  timeout = true;
});
```

### Auto-unsubscribe

You can auto-unsubscribe after the maximum number of messages (MAX_WANTED) is received.

```
nats.subscribe('foo', {'max':MAX_WANTED});
nats.unsubscribe(sid, MAX_WANTED);
```

### Multiple connections

```
var nats = require('nats');
var nc1 = nats.connect();
var nc2 = nats.connect();

nc1.subscribe('foo');
nc2.publish('foo');
```

### Encoded message

By default messages received will be decoded using UTF8. To change that, set the encoding option on the connection.

```
nc = nats.connect({'servers':servers, 'encoding': 'ascii'});
```
