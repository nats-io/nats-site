+++
date = "2015-09-27"
title = "Containerization"
description = ""
category = "server"
[menu.documentation]
  name = "Containerization"
  weight = 6
  identifier = "server-gnatsd-container"
  parent = "server"
+++

# NATS Server Containerization

The NATS server is provided as a Docker image that you can run using the Docker daemon. The NATS server Docker image is extremely lightweight, coming in at a mere 3 MB is size.

[Apcera](http://www.apcera.com/) actively maintains and supports the NATS server Docker image.

## Docker image

The NATS server Docker image is available on [Docker Hub](https://hub.docker.com/_/nats/) for public download.

## Usage

To use the Docker container image, install Docker and run:

```
docker pull nats
```

Run the NATS server:

```
$ docker run -d --name nats-main nats
```

By default the NATS server exposes multiple ports:

- 4222 is for clients.
- 8222 is an HTTP management port for information reporting.
- 6222 is a routing port for clustering.
- Use -p or -P to customize.

For example:

```
$ docker run -d --name nats-main nats
[INF] Starting gnatsd version 0.6.6
[INF] Starting http monitor on port 8222
[INF] Listening for route connections on 0.0.0.0:6222
[INF] Listening for client connections on 0.0.0.0:4222
[INF] gnatsd is ready
```

To run with the ports exposed on the host:

```
$ docker run -d -p 4222:4222 -p 6222:6222 -p 8222:8222 --name nats-main nats
```

To run a second server and cluster them together:

```
$ docker run -d --name=nats-2 --link nats-main nats --routes=nats-route://ruser:T0pS3cr3t@nats-main:6222
```

To verify the routes are connected:

```
$ docker run -d --name=nats-2 --link nats-main nats --routes=nats-route://ruser:T0pS3cr3t@nats-main:6222 -DV
[INF] Starting gnatsd version 0.6.6
[INF] Starting http monitor on port 8222
[INF] Listening for route connections on :6222
[INF] Listening for client connections on 0.0.0.0:4222
[INF] gnatsd is ready
[DBG] Trying to connect to route on nats-main:6222
[DBG] 172.17.0.52:6222 - rid:1 - Route connection created
[DBG] 172.17.0.52:6222 - rid:1 - Route connect msg sent
[DBG] 172.17.0.52:6222 - rid:1 - Registering remote route "ee35d227433a738c729f9422a59667bb"
[DBG] 172.17.0.52:6222 - rid:1 - Route sent local subscriptions
```

## Tutorial

See the [NATS Docker tutorial](/documentation/tutorials/nats-docker/) for instructions on using the NATS server Docker image.
