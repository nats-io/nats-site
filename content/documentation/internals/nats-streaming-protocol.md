+++
date = "2016-07-15"
title = "NATS Streaming Protocol"
category = "internals"
[menu.main]
  name = "NATS Streaming Protocol"
  weight = 1
  identifier = "internals-nats-streaming-protocol"
  parent = "Internals"
+++

# NATS streaming protocol

The NATS streaming protocol sits atop the [core NATS protocol](../nats-protocol) and uses [Google's protocol buffers](https://developers.google.com/protocol-buffers/).  Protocol buffer messages are marshalled into bytes and published as core NATS messages on specific subjects described below.  In communicating with the NATS streaming server, The NATS [request/reply](../../concepts/nats-req-rep) pattern is used for all protocol messages that have a corresponding reply.

## NATS streaming protocol conventions

**Subject names**: Subject names, including reply subject (INBOX) names, are case-sensitive and must be non-empty alphanumeric strings with no embedded whitespace, and optionally token-delimited using the dot character (`.`), e.g.:

`FOO`, `BAR`, `foo.bar`, `foo.BAR`, `FOO.BAR` and `FOO.BAR.BAZ` are all valid subject names

`FOO. BAR`, `foo. .bar` and`foo..bar` are *not* valid subject names

**Wildcards**: NATS streaming does *not* support wildcards in subject subscriptions.

**Protocol definition**: The fields of NATS streaming protocol messages are defined in the go-nats-streaming [protocol file](https://github.com/nats-io/go-nats-streaming/blob/master/pb/protocol.proto).


## NATS streaming protocol messages

The following table briefly describes the NATS streaming protocol messages.

Click the name to see more detailed information, including usage:

| Message Name                      | Sent By |    Description
| --------------------------------- |:--------|:--------------------------------------------
| [`ConnectRequest`](#CONNREQ)      | Client  | Request to connect to the streaming server
| [`ConnectResponse`](#CONNRESP)    | Server  | Result of a connection request
| [`SubscriptionRequest`](#SUBREQ)  | Client  | Request sent to Subscribe to a subject and retrieve data
| [`SubscriptionResponse`](#SUBRESP)| Server  | Result of a subscription request
| [`UnsubscribeRequest`](#UNSUBREQ) | Client  | Unsubscribe from a subject
| [`PubMsg`](#PUBMSG)               | Client  | Publish a message to a subject, with optional reply subject
| [`PubAck`](#PUBACK)               | Server  | An acknowledgement that a published message has been persisted
| [`MsgProto`](#MSGPROTO)           | Server  | A message (originally published from a client) to a subscribing client
| [`Ack`](#ACK)                     | Client  | Acknowledges that a message has been received
| [`CloseRequest`](#CLOSEREQ)       | Client  | Request sent to close the connection to the streaming server
| [`CloseResp`](#CLOSERESP)         | Server  | Result of the close request

The following sections explain each protocol message.

## <a name="CONNREQ"></a>ConnectRequest

### Message Structure

* `ClientID`: A unique identifier for a client.
* `HeartbeatInbox`: An inbox to which the streaming server will send heartbeats to for the client to process.

### Description

A connection request is sent when a streaming client connects to the streaming server. The connection request contains a unique identifier representing the client, and an inbox subject the client will listen on for incoming heartbeats.  The identifier **must** be unique; a connection attempt with an identifier currently in use will fail.  The inbox subject is the subject where the client receives incoming heartbeats, and responds by publishing an empty NATS message to the reply subject, indicating it is alive.  The streaming server will return a [ConnectResponse](#CONNRESP) message to the reply subject specified in the NATS request message.

This request is published to a subject comprised of the `<discover-prefix>.cluster-id`, for example, if a NATS streaming server was started with a cluster-id of `mycluster`, and the default prefix was used, the client publishes to `_STAN.discover.mycluster`

## <a name="CONNRESP"></a>ConnectResponse

### Message Structure

*	`pubPrefix`: Prefix to use when publishing to this streaming server cluster   
*	`subRequests`: Subject used for subscription requests
*	`unsubRequests`: Subject used for unsubscribe requests
*	`closeRequests`: Subject for closing the connection to the streaming server
*	`error`: An error string, which will be empty/omitted upon success
*	`publicKey`:  Reserved for future use.

### Description
After a `ConnectRequest` is published, the streaming server responds with this message on the reply subject of the underlying NATS request.  The streaming server requires the client to make requests and publish messages on certain subjects (described above), and when a connection is successful, the client saves the information returned to be used in sending other NATS streaming protocol messages.  In the event the connection was not successful, an error is returned in the `error` field.

## <a name="SUBREQ"></a>SubscriptionRequest

### Message Structure

* `clientID`: Client ID originally provided to the [ConnectRequest](#CONNREQ)
* `subject`: Formal subject to subscribe to, e.g. foo.bar
* `qGroup`: Optional queue group
* `inbox`: Inbox subject to deliver messages on
* `maxInFlight`:  Maximum inflight messages without an acknowledgement allowed
* `ackWaitInSecs`: Timeout for receiving an acknowledgement from the client
* `durableName`: Optional durable name which survives client restarts
* `startPosition`: Start position type
* `startSequence`: Optional start sequence number
* `startTimeDelta`: Optional start time

StartPosition

* `NewOnly`: Send only new messages
* `LastReceived`: Send only the last received message
* `TimeDeltaStart`: Send messages from duration specified in the `startTimeDelta` field.
* `SequenceStart`:  Send messages starting from the sequence in the `startSequence` field.
* `First`:  Send all available messages

### Description
A `SubscriptionRequest` is published on the subject returned in the `subRequests` field of a [`ConnectResponse`](#CONNRESP), and creates a subscription to a subject on the NATS streaming server.  The streaming server will return a [SubscriptionResponse](#SUBRESP) message to the reply subject specified in the NATS protocol request message.

## <a name="SUBRESP"></a>SubscriptionResponse

#### Message Structure

* `ackInbox`:  subject the client sends message acknowledgements to the streaming server
* `error`: error string, empty/omitted if no error

### Description

The `SubscriptionResponse` message is the response from the `SubscriptionRequest`.  After a client has processed an incoming [MsgProto](#MSGPROTO) message, it must send an acknowledgement to the `ackInbox` subject provided here.

## <a name="UNSUBREQ"></a>UnsubscribeRequest

### Message Structure

* `clientID`: Client ID originally provided to the [ConnectRequest](#CONNREQ)
* `subject`: Subject for the subscription
* `inbox`: Inbox subject to identify subscription
* `durableName`: Optional durable name which survives client restarts

### Description

The `UnsubscribeRequest` unsubcribes the connection from the  specified subject.  The inbox specified is the `inbox` returned from the  streaming server in the `SubscriptionResponse`.

## <a name="PUBMSG"></a>PubMsg

### Message Structure

* `clientID`: Client ID originally provided to the [ConnectRequest](#CONNREQ)
* `guid`: a guid generated for this particular message
* `subject`: subject
* `reply`: optional reply subject
* `data`: payload
* `sha256`: optional sha256 of payload data

### Description

The `PubMsg` protocol message is published from a client to the streaming server.  The GUID must be unique, and is returned in the [PubAck](#PUBACK) message to correlate the success for failure of storing this particular message.

## <a name="PUBACK"></a>PubAck

### Message Structure

* `guid`: GUID of the message being acknowledged by the streaming server.
* `error`: An error string, empty/omitted if no error

### Description

The `PubAck` message is an acknowledgement from the streaming server that a message has been processed.  The message arrives on the subject specified on the reply subject of the NATS message the PubMsg was published on.  The GUID is the same GUID used in the PubMsg being acknowledge.  If an error string is present, the message was not persisted by the streaming server and is not guaranteed. `PubAck` messages may be handled asynchronously from published `PubMsg`.

## <a name="MSGPROTO"></a>MsgProto

### Message Structure

* `sequence`: Globally ordered sequence number for the subject's channel
* `subject`: Subject
* `reply`: Optional reply
* `data`: Payload
* `timestamp`: Time the message was stored in the server.
* `redelivered`: Flag specifying if the message is being redelivered
* `CRC32`: Optional IEEE CRC32

### Description

The `MsgProto` message is received by client from the streaming server, containing the payload of messages sent by a publisher.  A `MsgProto` message that is not acknowledged with an [Ack](#ACK) message, within the duration specified by the `ackWaitInSecs` field of the subscription request will be redelivered.

## <a name="ACK"></a>Ack

### Message Structure

* `subject`: Subject of the message being acknowledged
* `sequence`: Sequence of the message being acknowledged

### Description

An `Ack` message is an acknowledgement from the client that a [MsgProto](#MSGPROTO) message has been considered received.  It is published to the `ackInbox` field of the [`SubscriptionResponse`](#SUBRESP).

## <a name="CLOSEREQ"></a>CloseRequest

### Message Structure

* `clientID`: Client ID originally provided to the [ConnectRequest](#CONNREQ)

### Description

A close request is published on the `closeRequests` subject from the [`ConnectResponse`](#CONNRESP), and notifies the streaming server that the client connection is closing, allowing the streaming server to free up resources.  This message should always be sent when a client is finished with the connection.

## <a name="CLOSERESP"></a>CloseResponse

### Message Structure

* `error`: error string, empty/omitted if no error

### Description

A close response is sent by the streaming server on the reply subject of the `CloseRequest` NATS message.  This response contains any error that may have occurred with the corresponding close call.
