+++
date = "2015-06-17"
title = "NATS Streaming"
description = ""
category = "server"
[menu.documentation]
  name = "NATS Streaming"
  weight = 1
  identifier = "streaming-nats-streaming-intro"
  parent = "server"
+++

# NATS Streaming

NATS Streaming is a data streaming system powered by NATS, and written in the Go programming language. The executable name for the NATS Streaming server is `nats-streaming-server`. NATS Streaming embeds, extends, and interoperates seamlessly with the core NATS platform. The [NATS Streaming server](https://github.com/nats-io/nats-streaming-server) is provided as open source software under the MIT license. [Apcera](http://www.apcera.com/) actively maintains and supports the NATS Streaming server.

![drawing](/img/documentation/stan-simple-view.png)

## Features

In addition to those already provided by the core NATS platform, NATS Streaming provides the following:

- At-least-once-delivery
- Rate matching per subscriber
- Replay by time or sequence number (or delta offset)
- Last/initial value caching
- Durable subscriptions
 
## Installation

NATS provides a [server binary](/documentation/tutorials/nats-streaming-install/) for Linux, Mac, and Windows. You can install the server from source on any platform you choose.

## Usage, Configuration and Administration

NATS provides a rich set of commands and parameters to configure all aspects of the server. Please refer to the [README](https://github.com/nats-io/nats-streaming-server/) for further info on usage, configuration, and administration.


