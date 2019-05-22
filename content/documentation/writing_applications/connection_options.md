# connection\_options

+++ category = "api" title = "Connection Options" \[menu.main\] name = "Connection Options" weight = 4 identifier = "doc-connection-options" parent = "Writing Applications" +++

The NATS client libraries offer a range of options for controlling how connections operate. Some of these are language dependent while some are library/version dependent. Please see the documentation for the client library your application uses for a full list of options. This page presents some options commonly used and options related to NATS internals that are important to understand.

### Setting the Connection Name

Connections can be assigned a name which will appear in some of the server monitoring data. This name is not required but can help in debugging and testing.

## Ping/Pong

The client and server use a simple PING/PONG protocol to check that they are both still connected. The client will ping the server on a regular, configured interval so that the server usually doesn't have to initiate the PING/PONG interaction.

 `digraph g { rankdir=LR client [shape=box, style="rounded", label="NATS Client"]; nats-server [shape=circle, label="nats-server"]; client -> nats-server [label="PING"]; nats-server -> client [label="PONG"]; }`

### Set the Ping Interval

If you have a connection that is going to be open a long time with few messages traveling on it, setting this PING interval can control how quickly the client will be notified of a problem. However on connections with a lot of traffic, the client will often figure out there is a problem between PINGS, and as a result the default PING interval is often on the order of minutes. To set the interval to 20s:

### Limit Outgoing Pings

The PING/PONG interaction is also used by most of the clients as a way to flush the connection to the server. Clients that cache outgoing messages provide a flush call that will run a PING/PONG. The flush will wait for the PONG to return, telling it that all cached messages have been processed, including the PING. The number of cached PING requests can be limited in most clients to ensure that traffic problems are identified early. This configuration for _max outgoing pings_ or similar will usually default to a small number and should only be increased if you are worried about fast flush traffic, perhaps in multiple threads.

For example, to set the maximum number of outgoing pings to 5:

## Controlling the Client/Server Protocol

The protocol between the client and the server is fairly simple and relies on a control line and sometimes a body. The control line contains the operations being sent, like PING or PONG, followed by a carriage return and line feed, CRLF or "\r\n". The server has a setting that can limit the maximum size of a control line. For PING and PONG this doesn't come into play, but for messages that contain subject names, the control line length can be important. The server is also configured with a maximum payload size, which limits the size of a message body. The server sends the maximum payload size to the client at connect time but doesn't currently tell the client the maximum control line size.

### Set the Maximum Control Line Size

Some clients will try to limit the control line size on themselves to prevent an error from the server. These clients may or may not allow you to set the size being used, but if they do, the size should be set to match the server configuration.

For example, to set the maximum control line size to 2k:

### Get the Maximum Payload Size

While the client can't control the maximum payload size, clients may provide a way for applications to get the size after the connection is made. This will allow the application to chunk or limit data as needed to pass through the server.

### Turning Off Echo'd Messages

By default the server will echo messages. This means that if a publisher on a connection sends a message to a subject any subscribers on that same connection may receive the message. Turning off echo is a fairly new feature for the NATS server, but some of the clients already support it.

 `digraph { rankdir=LR; subgraph cluster_1 { shape=box; style="rounded"; label = "Connection #1"; publisher [shape=box, style="rounded", label="Publisher"]; subscriber_1 [shape=box, style="rounded", label="Subscriber"]; } subgraph cluster_2 { shape=box; style="rounded"; label = "Connection #2"; subscriber_2 [shape=box, style="rounded", label="Subscriber"]; } subject [shape=circle, label="Subject"]; publisher -> subject [label="msg"]; subject -> subscriber_1 [label="echo'd msg", style="dashed"]; subject -> subscriber_2 [label="msg"]; }`

Keep in mind that each connection will have to turn off echo, and that it is per connection, not per application. Also, turning echo on and off can result in a major change to your applications communications protocol since messages will flow or stop flowing based on this setting and the subscribing code won't have any indication as to why.

### Turn On Pedantic Mode

The NATS server provides a _pedantic_ mode that does extra checks on the protocol. By default, this setting is off but you can turn it on:

### Turn On/Off Verbose Mode

The NATS server also provide a _verbose_ mode. By default, verbose mode is enabled and the server will reply to every message from the client with either a +OK or a -ERR. Most clients turn off verbose mode, which disables all of the +OK traffic. Errors are rarely subject to verbose mode and client libraries handle them as documented. To turn on verbose mode, likely for testing:

