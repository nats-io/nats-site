+++
date = "2015-09-27"
title = "NATS Protocol"
category = "internals"
[menu.main]
  name = "NATS Protocol"
  weight = 1
  identifier = "internals-nats-protocol"
  parent = "internals"
+++

# NATS protocol

The NATS wire protocol is a simple, text-based publish/subscribe style protocol. Clients connect to and communicate with `gnatsd` (the NATS server) through a regular TCP/IP socket using a small set of protocol operations that are terminated by newline.

Unlike traditional messaging systems that use a binary message format that require an API to consume, the text-based NATS protocol makes it easy to implement clients in a wide variety of programming and scripting languages.

The NATS server implements a [zero allocation byte parser](https://youtu.be/ylRKac5kSOk?t=10m46s) that is fast and efficient.

## NATS protocol conventions

**Subject names**: Subject names, including reply subject (INBOX) names, are case-sensitive and must be non-empty alphanumeric strings with no embedded whitespace, but may be delimited by dots, e.g.:

`FOO`, `BAR`, `foo.bar`, `foo.BAR`, `FOO.BAR` and `FOO.BAR.BAZ` are all valid subject names

`FOO. BAR`, `foo. .bar` and`foo..bar` are *not* valid subject names

**Wildcards**: NATS supports the use of wildcards in subject subscriptions.

- The asterisk character (`*`) matches any token at any level of the subject.
- The greater than symbol (`>`), also known as the _full wildcard_, matches one or more tokens at the tail of a subject, and must be the last token. The wildcarded subject `foo.>` will match `foo.bar` or `foo.bar.baz.1`, but not `foo`. 
- Wildcards must be separate tokens (`foo.*.baz` or `foo.>` are syntactically valid; `foo*.bar`, `f*o.b*r` and `foo>` are not)

For example, the wildcard subscriptions `foo.*.quux` and `foo.>` both match `foo.bar.quux`, but only the latter matches `foo.bar.baz`.  With the full wildcard,
it is also possible to express interest in every subject that may exist in NATS: `sub > 1`.

**Field Delimiters**: The fields of NATS protocol messages are delimited by whitespace characters '` `' (space)  or `\t` (tab). 
Multiple whitespace characters will be treated as a single field delimiter.

**Newlines**: Like other text-based protocols, NATS uses `CR` followed by `LF` (`CR+LF`, `\r\n`, `0x0D0A`) to terminate protocol messages. 
This newline sequence is also used to mark the beginning of the actual message payload in a `PUB` or `MSG` protocol message. 


## NATS protocol messages

The following table briefly describes the NATS protocol messages. 
NATS protocol operation names are case insensitive, thus `SUB foo 1\r\n` and `sub foo 1\r\n` are equivalent.

Click the name to see more detailed information, including syntax:


| OP Name              | Sent By        |    Description
| -------------------- |:-------------- |:--------------------------------------------
| [`INFO`](#INFO)      | Server         | Sent to client after initial TCP/IP connection
| [`CONNECT`](#CONNECT)| Client         | Sent to server to specify connection information
| [`PUB`](#PUB)        | Client         | Publish a message to a subject, with optional reply subject
| [`SUB`](#SUB)        | Client         | Subscribe to a subject (or subject wildcard)
| [`UNSUB`](#UNSUB)    | Client         | Unsubscribe (or auto-unsubscribe) from subject
| [`MSG`](#MSG)        | Server         | Delivers a message payload to a subscriber
| [`PING`](#PINGPONG)  | Both           | PING keep-alive message
| [`PONG`](#PINGPONG)  | Both           | PONG keep-alive response
| [`+OK`](#OKERR)      | Server         | Acknowledges well-formed protocol message in `verbose` mode
| [`-ERR`](#OKERR)     | Server         | Indicates a protocol error. Will cause client disconnect.



The following sections explain each protocol message.

## <a name="INFO"></a>INFO

### Syntax

`INFO {["option_name":option_value],...}`

The valid options are as follows:

* `server_id`: The unique identifier of the NATS server
* `version`: The version of the NATS server
* `go`: The version of golang the NATS server was built with
* `host`: The IP address of the NATS server host
* `port`: The port number the NATS server is configured to listen on
* `auth_required`: If this is set, then the client should try to authenticate upon connect.
* `ssl_required`: If this is set, then the client must authenticate using SSL.
* `max_payload`: Maximum payload size that the server will accept from the client.

### Description

As soon as the server accepts a connection from the client, it will send information about itself and the configuration and security requirements that are necessary for the client to successfully authenticate with the server and exchange messages.

### Example

Below you can see a sample connection string from a telnet connection to the `demo.nats.io` site.

```
telnet demo.nats.io 4222

Trying 107.170.221.32...
Connected to demo.nats.io.
Escape character is '^]'.
INFO {"server_id":"1ec445b504f4edfb4cf7927c707dd717","version":"0.6.6","go":"go1.4.2","host":"0.0.0.0","port":4222,"auth_required":false,"ssl_required":false,"max_payload":1048576}
```

## <a name="CONNECT"></a>CONNECT

### Syntax

`CONNECT {["option_name":option_value],...}`

The valid options are as follows:

* `verbose`: Turns on [`+OK`](#OKERR) protocol acknowledgements.
* `pedantic`: Turns on additional strict format checking, e.g. for properly formed subjects
* `ssl_required`: Indicates whether the client requires an SSL connection.
* `auth_token`: Client authorization token
* `user`: Connection username (if `auth_required` is set)
* `pass`: Connection password (if `auth_required` is set)
* `name`: Optional client name
* `lang`: The implementation language of the client.
* `version`: The version of the client.

### Description
The `CONNECT` message is analogous to the `INFO` message. Once the client has established a TCP/IP socket connection with the NATS server, and an `INFO` message has been received from the server, the client may send a `CONNECT` message to the NATS server to provide more information about the current connection as well as security information.

### Example
Here is an example from the default string of the Go client:

```
CONNECT {"verbose":false,"pedantic":false,"ssl_required":false,"name":"","lang":"go","version":"1.1.0"}\r\n
```

Most clients set `verbose` to `false` by default. This means that  that the server will not be sending an `+OK` payload back to the client after the server ingested the message.

## <a name="PUB"></a>PUB

### Syntax
`PUB <subject> [reply-to] <#bytes>\r\n[payload]\r\n`

where:

* `subject`: The destination subject to publish to
* `reply-to`: The reply inbox subject that subscribers can use to send a response back to the publisher/requestor
* `#bytes`: The payload size in bytes
* `payload`: The message payload data

### Description
The `PUB` message publishes the message payload to the given subject name, optionally supplying a reply subject. If a reply subject is supplied, it will be delivered to eligible subscribers along with the supplied payload. Note that the payload itself is optional. To omit the payload, set the payload size to 0.

### Example

To publish the string message payload "Hello NATS!" to subject FOO:

`PUB FOO 11\r\nHello NATS!\r\n`

To publish a request message "Knock Knock" to subject FRONT.DOOR with reply subject INBOX.22:

`PUB FRONT.DOOR INBOX.22 11\r\nKnock Knock\r\n`

To publish an empty message to subject NOTIFY:

`PUB NOTIFY 0\r\n\r\n`

## <a name="SUB"></a>SUB

### Syntax
`SUB <subject> [queue group] <sid>\r\n`

where:

* `subject`: The subject name to subscribe to
* `queue group`: If specified, the subscriber will join this queue group
* `sid`: A unique alphanumeric subscription ID

### Description

`SUB` initiates a subscription to a subject, optionally joining a distributed queue group.

### Example

To subscribe to the subject `FOO` with the connection-unique subject identifier (sid) `1`:

`SUB FOO 1\r\n`

To subscribe the current connection to the subject `BAR` as part of distribution queue group `G1` with sid `44`:

`SUB BAR G1 44\r\n`

## <a name="UNSUB"></a>UNSUB

### Syntax

`UNSUB <sid> [max_msgs]`

where:

* `sid`: The unique alphanumeric subscription ID of the subject to unsubscribe from
* `max_msgs`: Number of messages to wait for before automatically unsubscribing

### Description

`UNSUB` unsubcribes the connection from the  specified subject, or auto-unsubscribes after the specified number of messages has been received.

### Example

The following examples concern subject `FOO` which has been assigned sid `1`. To unsubscribe from `FOO`:

`UNSUB 1\r\n`

To auto-unsubscribe from `FOO` after 5 messages have been received:

`UNSUB 1 5\r\n`

## <a name="MSG"></a>MSG

### Syntax

`MSG <subject> <sid> [reply-to] <#bytes>\r\n[payload]\r\n`

where:

* `subject`: Subject name this message was received on
* `sid`: The unique alphanumeric subscription ID of the subject
* `reply-to`: The inbox subject on which the publisher is listening for responses
* `#bytes`: Size of the payload in bytes
* `payload`: The message payload data

### Description

The `MSG` protocol message delivers a message to the client.

### Example

The following message delivers a message from subject `FOO.BAR`:

`MSG FOO.BAR 9 11\r\nHello World\r\n`

Deliver the same message along with a reply inbox:

`MSG FOO.BAR 9 INBOX.34 11\r\nHello World\r\n`

## <a name="PINGPONG"></a>PING/PONG

### Description

`PING` and `PONG` implement a simple keep-alive mechanism between client and server. Once a client establishes a connection to the NATS server, the server will continuously send `PING` messages to the client at a configurable interval. If the client fails to respond with a `PONG` message within the configured response interval, the server will terminate its connection. If your connection stays idle for too long, it is cut off:

```
telnet demo.nats.io 4222

Trying 107.170.221.32...
Connected to demo.nats.io.
Escape character is '^]'.
INFO {"server_id":"ad29ea9cbb16f2865c177bbd4db446ca","version":"0.6.8","go":"go1.5.1","host":"0.0.0.0","port":4222,"auth_required":false,"ssl_required":false,"max_payload":1048576}
PING
PING
-ERR 'Stale Connection'
Connection closed by foreign host.
```

If the server sends a ping request, you can reply with a pong message to notify the server that you are still interested. You can also ping the server and will receive a pong reply. The ping/pong interval is configurable.

## <a name="OKERR"></a>+OK/ERR

### Syntax

`+OK`

`-ERR <error message>`

When the `verbose` connection option is set to `true` (the default value), the server acknowledges each well-formed protocol message from the client with a `+OK` message. Most NATS clients set the `verbose` option to `false` using the [CONNECT](#CONNECT) message

The `-ERR` message is used by the server indicate a protocol, authorization, or other runtime connection error to the client. Most of these errors result in the server closing the connection.

Handling of these errors usually has to be done asynchronously.

Protocol error messages which close the connection:

- `-ERR 'Unknown Protocol Operation'`: Unknown protocol error
- `-ERR 'Authorization Violation'`: Client failed to authenticate to the server with credentials specified in the [CONNECT](#CONNECT) message.
- `-ERR 'Authorization Timeout'`: Client took too long to authenticate to the server after establishing a connection (default 1 second)
- `-ERR 'Parser Error'`: Cannot parse the protocol message sent by the client
- `-ERR 'Stale Connection'`: PING/PONG interval expired.
- `-ERR 'Slow Consumer'`: The server pending data size for the connection has reached the maximum size (default 10MB).
- `-ERR 'Maximum Payload Exceeded'`: Client attempted to publish a message with a payload size that exceeds the `max_payload` size configured on the server. This value is supplied to the client upon connection in the initial [`INFO`](#INFO) message. The client is expected to do proper accounting of byte size to be sent to the server in order to handle this error synchronously.

Protocol error messages which do not close the connection:

- `-ERR 'Invalid Subject'`: Client sent a malformed subject (e.g. `sub foo. 90`)


## Protocol demo

Refer to the topic [NATS Protocol Demo](/documentation/internals/nats-protocol-demo/) to demo the NATS protocol for yourself.
