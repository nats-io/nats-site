+++
date = "2016-07-15"
title = "NATS Streaming Protocol"
category = "internals"
[menu.main]
  name = "Streaming Protocol"
  weight = 5
  identifier = "doc-streaming-protocol"
  parent = "Event Streaming"
+++

The NATS streaming protocol sits atop the core [NATS protocol](/doc/internals/nats-protocol) and uses [Google's Protocol Buffers](https://developers.google.com/protocol-buffers/).  Protocol buffer messages are marshaled into bytes and published as NATS messages on specific subjects described below.  In communicating with the NATS Streaming Server, the NATS [request/reply](/doc/writing_applications/concepts) pattern is used for all protocol messages that have a corresponding reply.

## NATS streaming protocol conventions

**Subject names**: Subject names, including reply subject (INBOX) names, are case-sensitive and must be non-empty alphanumeric strings with no embedded whitespace, and optionally token-delimited using the dot character (`.`), e.g.:

`FOO`, `BAR`, `foo.bar`, `foo.BAR`, `FOO.BAR` and `FOO.BAR.BAZ` are all valid subject names

`FOO. BAR`, `foo. .bar` and`foo..bar` are *not- valid subject names

**Wildcards**: NATS streaming does **not*- support wildcards in subject subscriptions

**Protocol definition**: The fields of NATS streaming protocol messages are defined in the go-nats-streaming [protocol file](https://github.com/nats-io/go-nats-streaming/blob/master/pb/protocol.proto).

## NATS streaming protocol messages

The following table briefly describes the NATS streaming protocol messages.

Click the name to see more detailed information, including usage:

| Message Name                      | Sent By |    Description
| --------------------------------- |:--------|:--------------------------------------------
| [`ConnectRequest`](#CONNREQ)      | Client  | Request to connect to the NATS Streaming Server
| [`ConnectResponse`](#CONNRESP)    | Server  | Result of a connection request
| [`SubscriptionRequest`](#SUBREQ)  | Client  | Request sent to subscribe and retrieve data
| [`SubscriptionResponse`](#SUBRESP)| Server  | Result of a subscription request
| [`UnsubscribeRequest`](#UNSUBREQ) | Client  | Unsubscribe from a subject
| [`PubMsg`](#PUBMSG)               | Client  | Publish a message to a subject, with optional reply subject
| [`PubAck`](#PUBACK)               | Server  | An acknowledgement that a published message has been processed on the server
| [`MsgProto`](#MSGPROTO)           | Server  | A message from the NATS Streaming Server to a subscribing client
| [`Ack`](#ACK)                     | Client  | Acknowledges that a message has been received
| [`CloseRequest`](#CLOSEREQ)       | Client  | Request sent to close the connection to the NATS Streaming Server
| [`CloseResp`](#CLOSERESP)         | Server  | Result of the close request

The following sections explain each protocol message.

## <a name="CONNREQ"></a>ConnectRequest

#### Description

A connection request is sent when a streaming client connects to the NATS Streaming Server. The connection request contains a unique identifier representing the client, and an inbox subject the client will listen on for incoming heartbeats.  The identifier **must*- be unique; a connection attempt with an identifier currently in use will fail.  The inbox subject is the subject where the client receives incoming heartbeats, and responds by publishing an empty NATS message to the reply subject, indicating it is alive.  The NATS Streaming Server will return a [ConnectResponse](#CONNRESP) message to the reply subject specified in the NATS request message.

This request is published to a subject comprised of the `<discover-prefix>.cluster-id`, for example, if a NATS Streaming Server was started with a cluster-id of `mycluster`, and the default prefix was used, the client publishes to `_STAN.discover.mycluster`

#### Message Structure

- `clientID`: A unique identifier for a client
- `heartbeatInbox`: An inbox to which the NATS Streaming Server will send heartbeats for the client to process

## <a name="CONNRESP"></a>ConnectResponse

#### Description

After a `ConnectRequest` is published, the NATS Streaming Server responds with this message on the reply subject of the underlying NATS request.  The NATS Streaming Server requires the client to make requests and publish messages on certain subjects (described above), and when a connection is successful, the client saves the information returned to be used in sending other NATS streaming protocol messages.  In the event the connection was not successful, an error is returned in the `error` field.

#### Message Structure

- `pubPrefix`: Prefix to use when publishing
- `subRequests`: Subject used for subscription requests
- `unsubRequests`: Subject used for unsubscribe requests
- `closeRequests`: Subject for closing a connection
- `error`: An error string, which will be empty/omitted upon success
- `publicKey`:  Reserved for future use

## <a name="SUBREQ"></a>SubscriptionRequest

#### Description

A `SubscriptionRequest` is published on the subject returned in the `subRequests` field of a [`ConnectResponse`](#CONNRESP), and creates a subscription to a subject on the NATS Streaming Server.  The  will return a [SubscriptionResponse](#SUBRESP) message to the reply subject specified in the NATS protocol request message.

#### Message Structure

- `clientID`: Client ID originally provided in the [ConnectRequest](#CONNREQ)
- `subject`: Formal subject to subscribe to, e.g. foo.bar
- `qGroup`: Optional queue group
- `inbox`: Inbox subject to deliver messages on
- `maxInFlight`:  Maximum inflight messages without an acknowledgement allowed
- `ackWaitInSecs`: Timeout for receiving an acknowledgement from the client
- `durableName`: Optional durable name which survives client restarts
- `startPosition`: An enumerated type specifying the point in history to start replaying data
- `startSequence`: Optional start sequence number
- `startTimeDelta`: Optional start time

#### StartPosition enumeration

- `NewOnly`: Send only new messages
- `LastReceived`: Send only the last received message
- `TimeDeltaStart`: Send messages from duration specified in the `startTimeDelta` field.
- `SequenceStart`:  Send messages starting from the sequence in the `startSequence` field.
- `First`:  Send all available messages

## <a name="SUBRESP"></a>SubscriptionResponse

#### Description

The `SubscriptionResponse` message is the response from the `SubscriptionRequest`.  After a client has processed an incoming [MsgProto](#MSGPROTO) message, it must send an acknowledgement to the `ackInbox` subject provided here.

#### Message Structure

- `ackInbox`:  subject the client sends message acknowledgements to the NATS Streaming Server
- `error`: error string, empty/omitted if no error

## <a name="UNSUBREQ"></a>UnsubscribeRequest

#### Description

The `UnsubscribeRequest` unsubcribes the connection from the  specified subject.  The inbox specified is the `inbox` returned from the NATS Streaming Server in the `SubscriptionResponse`.

#### Message Structure

- `clientID`: Client ID originally provided in the [ConnectRequest](#CONNREQ)
- `subject`: Subject for the subscription
- `inbox`: Inbox subject to identify subscription
- `durableName`: Optional durable name which survives client restarts

## <a name="PUBMSG"></a>PubMsg

#### Description

The `PubMsg` protocol message is published from a client to the NATS Streaming Server.  The GUID must be unique, and is returned in the [PubAck](#PUBACK) message to correlate the success or failure of storing this particular message.

#### Message Structure

- `clientID`: Client ID originally provided in the [ConnectRequest](#CONNREQ)
- `guid`: a guid generated for this particular message
- `subject`: subject
- `reply`: optional reply subject
- `data`: payload
- `sha256`: optional sha256 of payload data

## <a name="PUBACK"></a>PubAck

#### Description

The `PubAck` message is an acknowledgement from the NATS Streaming Server that a message has been processed.  The message arrives on the subject specified on the reply subject of the NATS message the `PubMsg` was published on.  The GUID is the same GUID used in the `PubMsg` being acknowledged.  If an error string is present, the message was not persisted by the NATS Streaming Server and no guarantees regarding persistence are honored. `PubAck` messages may be handled asynchronously from their corresponding `PubMsg` in the client.

#### Message Structure

- `guid`: GUID of the message being acknowledged by the NATS Streaming Server
- `error`: An error string, empty/omitted if no error

## <a name="MSGPROTO"></a>MsgProto

#### Description

The `MsgProto` message is received by client from the NATS Streaming Server, containing the payload of messages sent by a publisher.  A `MsgProto` message that is not acknowledged with an [Ack](#ACK) message within the duration specified by the `ackWaitInSecs` field of the subscription request will be redelivered.

#### Message Structure

- `sequence`: Globally ordered sequence number for the subject's channel
- `subject`: Subject
- `reply`: Optional reply
- `data`: Payload
- `timestamp`: Time the message was stored in the server.
- `redelivered`: Flag specifying if the message is being redelivered
- `CRC32`: Optional IEEE CRC32

## <a name="ACK"></a>Ack

#### Description

An `Ack` message is an acknowledgement from the client that a [MsgProto](#MSGPROTO) message has been considered received.  It is published to the `ackInbox` field of the [`SubscriptionResponse`](#SUBRESP).

#### Message Structure

- `subject`: Subject of the message being acknowledged
- `sequence`: Sequence of the message being acknowledged

## <a name="CLOSEREQ"></a>CloseRequest

#### Description

A `CloseRequest` message is published on the `closeRequests` subject from the [`ConnectResponse`](#CONNRESP), and notifies the NATS Streaming Server that the client connection is closing, allowing the server to free up resources.  This message should **always*- be sent when a client is finished using a connection.

#### Message Structure

- `clientID`: Client ID originally provided in the [ConnectRequest](#CONNREQ)

## <a name="CLOSERESP"></a>CloseResponse

#### Description

The `CloseResponse` is sent by the NATS Streaming Server on the reply subject of the `CloseRequest` NATS message.  This response contains any error that may have occurred with the corresponding close call.

#### Message Structure

- `error`: error string, empty/omitted if no error
