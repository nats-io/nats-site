+++
date = "2015-09-27"
title = "NATS Server"
description = ""
category = "server"
[menu.main]
  name = "NATS Server"
  weight = 1
  identifier = "server-gnatsd-intro"
  parent = "Server"
+++

# NATS Server

NATS provides a server that is written in the Go programming language. The executable name for the NATS server is `gnatsd`, which stands for Go NATS Deamon. The [NATS server](https://github.com/nats-io/gnatsd) is provided as open source software under the Apache-2.0 license. Synadia actively maintains and supports the NATS server.

## Installation

NATS provides a [server binary](/documentation/tutorials/gnatsd-install/) for Linux, Mac, and Windows. You can install the server from source on any platform you choose.

## Usage

The NATS server is easy to [use](/documentation/server/gnatsd-usage/), supports [authorization](/documentation/server/gnatsd-authorization/), and provides [logging](/documentation/server/gnatsd-logging/) facilities.

## Configuration

NATS provides a rich set of commands and parameters to configure all aspects of the server. You can run the server without any commands on the default port, or use the [command line](/documentation/server/gnatsd-usage/) or a [config file](/documentation/server/gnatsd-config/) to configure the server.

## Containerization

A fully configured NATS server is provided as a [Docker image](/documentation/server/gnatsd-container/) that you can pull from the [Docker Hub](https://hub.docker.com/_/nats/).

## Clustering

One of the [design goals](/documentation/#design-goals) of NATS is that it be always on and available like a dial tone. To implement this design goal, NATS provides mechanisms for [clustering servers](/documentation/server/gnatsd-cluster/) to achieve resiliency and high availability.

## Auto-Pruning

NATS provides built-in mechanisms to manage [slow consumers](/documentation/server/gnatsd-prune/) and [lazy listeners](/documentation/server/gnatsd-prune/). If a subscriber is not quick enough, or is not responding, the NATS server cuts it off.

## Monitoring and Troubleshooting

The NATS server exposes a monitoring port and several endpoints with JSON payloads that you can use to [monitor the system](/documentation/server/gnatsd-monitoring/) and create custom monitoring applications.

## Server Statistics

The [nats-top utility](/documentation/server/gnatsd-top/) lets you monitor NATS server activity in real time and view subscription statistics.

## Performance Benchmarking and Tuning

NATS provides a robust set of tooling for [performance benchmarking and tuning](/documentation/server/gnatsd-perf/) the messaging system.
