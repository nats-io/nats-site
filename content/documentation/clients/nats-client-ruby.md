+++
date = "2015-09-27"
title = "Ruby Client"
category = "clients"
[menu.main]
  name = "Ruby Client"
  weight = 3
  identifier = "clients-ruby-client"
  parent = "Clients"
+++

# Ruby Client for NATS

[Apcera](https://www.apcera.com/) actively maintains and supports the [Ruby](http://ruby-lang.org) client for [NATS](https://nats.io).

## Supported Ruby platforms

The Ruby client for NATS is supported on the following Ruby platforms:

- MRI 1.9, 2.0, 2.1
- JRuby 1.6.8 (experimental)

## Installation

To install the Ruby client for NATS:

```
[sudo] gem install nats
```

Or, depending on your Ruby setup:

```
[sudo] rake geminstall
```

## Ruby client demo

Start NATS server:

```
gnatsd
```

Start Ruby subscriber:

```
nats-sub foo &
```

Expected result:

```
nats-sub foo &
[1] 24201
Listening on [foo]
```

Publish a message:

```
nats-pub foo 'Hello NATS!'
```

Expected result:

```
nats-pub foo 'Hello NATS!'
Published [foo] : 'Hello NATS!'[#1] Received on [foo] : 'Hello NATS!'
```

Publish another message:

```
nats-pub foo 'Hello NATS Again!'
```

Expected result:

```
nats-pub foo 'Hello NATS Again!'
[#2] Received on [foo] : 'Hello NATS Again!'
Published [foo] : 'Hello NATS Again!'
```

## Basic client usage

```
require "nats/client"

NATS.start do

  # Simple Subscriber
  NATS.subscribe('foo') { |msg| puts "Msg received : '#{msg}'" }

  # Simple Publisher
  NATS.publish('foo.bar.baz', 'Hello World!')

  # Unsubscribing
  sid = NATS.subscribe('bar') { |msg| puts "Msg received : '#{msg}'" }
  NATS.unsubscribe(sid)

  # Requests
  NATS.request('help') { |response| puts "Got a response: '#{response}'" }

  # Replies
  NATS.subscribe('help') { |msg, reply| NATS.publish(reply, "I'll help!") }

  # Stop using NATS.stop, exits EM loop if NATS.start started the loop
  NATS.stop

end
```

## Wildcard subscriptions

The asterisk character (`*`) matches any token at any level of the subject.

The greater than symbol (`>`) matches any length of the tail of a subject, and can only be the last token. For example: the wildcard subscription `foo.>` will match `foo.bar`, `foo.bar.baz`, and `foo.foo.bar.bax.22`.

```
NATS.subscribe('foo.*.baz') { |msg, reply, sub| puts "Msg received on [#{sub}] : '#{msg}'" }
NATS.subscribe('foo.bar.*') { |msg, reply, sub| puts "Msg received on [#{sub}] : '#{msg}'" }
NATS.subscribe('*.bar.*')   { |msg, reply, sub| puts "Msg received on [#{sub}] : '#{msg}'" }

NATS.subscribe('foo.>') { |msg, reply, sub| puts "Msg received on [#{sub}] : '#{msg}'" }
```

## Queues groups

All subscriptions with the same queue name will form a queue group. NATS queuing semantics stipulate that each message will be delivered to only one subscriber per queue group. You can have as many queue groups as you wish. Normal subscribers will continue to work as expected.

```
NATS.subscribe(subject, :queue => 'job.workers') { |msg| puts "Received '#{msg}'" }
```

## Clustered Usage

```
NATS.start(:servers => ['nats://127.0.0.1:4222', 'nats://127.0.0.1:4223'] do |c|
  puts "NATS is connected to #{c.connected_server}"
  c.on_reconnect do
    puts "Reconnected to server at #{c.connected_server}
  end
end

opts = {
  :dont_randomize_servers => true,
  :reconnect_time_wait => 0.5,
  :max_reconnect_attempts = 10,
  :servers => ['nats://127.0.0.1:4222', 'nats://127.0.0.1:4223', 'nats://127.0.0.1:4224]
}

NATS.connect(opts) do |c|
  puts "NATS is connected!"
end
```

## Advanced Usage

The following sections provide some advanced usage examples for the Ruby client.

### Publish with closure

The callback fires when the server has processed the message.

```
NATS.publish('foo', 'You done?') { puts 'msg processed!' }
```

### Subscription timeouts

Timeout if a message is not received within specified time.

```
sid = NATS.subscribe('foo') { received += 1 }
NATS.timeout(sid, TIMEOUT_IN_SECS) { timeout_recvd = true }
```

Timeout unless a certain number of messages have been received within the specified time limit.

```
NATS.timeout(sid, TIMEOUT_IN_SECS, :expected => 2) { timeout_recvd = true }
```

### Auto-unsubscribe

Automatically unsubscribe after the maximum number of messages (MAX_WANTED) is received.

```
NATS.unsubscribe(sid, MAX_WANTED)
```

### Multiple connections

```
NATS.subscribe('test') do |msg|
    puts "received msg"
    NATS.stop
end
```

### Second connection

Make a second connection to send a message.

```
NATS.connect { NATS.publish('test', 'Hello World!') }
```
