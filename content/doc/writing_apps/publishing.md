+++
category = "api"
title = "Sending Messages"
[menu.main]
    name = "Sending Messages"
    weight = 6
    identifier = "doc-sending-msg"
    parent = "Writing Apps"
+++

NATS sends and receives messages composed of a target subject, an optional reply subject and an array of bytes. Some libraries may provide helpers to convert other data formats to and from bytes, but the gnatsd will treat all messages as opaque byte arrays. All of the NATS clients are designed to make sending a message simple. For example, to send the string "All is Well" to the "updates" subject as a UTF-8 string of bytes you would do:

{{< partial "doc/publish_bytes.html" >}}

### Reply-To

The optional reply-to field when publishing a message can be used on the receiving side to respond. The reply-to subject is often called an _inbox_, and some libraries may provide a method for generating unique inbox subjects. For example to send a request to the subject `time`, with no content for the messages, you might:

{{< partial "doc/publish_with_reply.html" >}}

### Request-Reply

The pattern of sending a message and receiving a response is encapsulated in most client libraries into a request method. Under the covers this method will publish a message with a unique reply-to subject and wait for the response before returning. In the older versions of some libraries a completely new reply-to subject is created each time. In newer versions, a subject hierarchy is used, so that a single subscriber in the client library listens for a wildcard, and requests are sent with a unique child subject of a single subject.

The primary difference between the request method and publishing with a reply-to is that the library is only going to accept one response, and in most libraries the request will be treated as a synchronous action. The library may provide a way to set the timeout. For example, updating the previous publish example we may request `time` with a one second timeout:

{{< partial "doc/request_reply.html" >}}

Ultimately you can build your own request-reply using publish-subscribe if you need a different semantic or timing.

### Publishing, Caches and Flush

For performance reasons, most if not all, of the client libraries will cache outgoing data. This may be as simple as a byte buffer that stores up a few messages before being pushed to the network. It is the libraries job to make sure messages flow in a high performance manner. But there may be times when an application needs to know that a message has "hit the wire." In this case, applications can use a flush call to tell the library to move data through the system.

{{< partial "doc/flush.html" >}}

#### Flush and Ping/Pong

Many of the client libraries use the PING/PONG interaction built into the NATS protocol to insure that flush pushed all of the cached messages to the server. When an application calls flush, in this case, the library will put a PING on the outgoing queue of messages, and wait for the server to send PONG before saying that the flush was successful.

## Sending Structured Data

Some client libraries provide helpers to send structured data, while others depend on the application to perform any encoding and decoding and just take byte arrays for sending. The following example shows how to send JSON, this could be easily altered to send a protocol buffer, YAML or some other format. JSON is a text format, so we also have to encode the string in most languages to bytes, we are using UTF-8 the JSON standard encoding.

Take a simple _stock ticker_ that sends the symbol and price of each stock:

{{< partial "doc/publish_json.html" >}}
