+++
date = "2015-09-27"
title = "Run NATS Docker Image"
description = ""
category = "tutorials"
[menu.main]
  name = "Run NATS Docker Image"
  weight = 4
  identifier = "tutorial-gnatsd-docker"
  parent = "tutorials"
+++

# Run NATS Server Docker Image

In this tutorial you run the [NATS server Docker image](https://hub.docker.com/_/nats/). The Docker image provides an instance of the [NATS Server](/server/gnatsd-intro/). Apcera actively maintains and supports the gnatsd Docker image. The NATS image is only 3 MB in size.

## Prerequisite

- [Set up your Go environment](/documentation/tutorials/go-install/)

## Instructions

**1. Set up Docker.**

See [Get Started with Docker](http://docs.docker.com/mac/started/) for guidance.

The easiest way to run Docker is to use the [Docker Toolbox](http://docs.docker.com/mac/step_one/).

**2. Run the gnatsd Docker image.**

```
docker run nats
```

**3. Verify that the NATS server is running.**

You should see the following:

```
Unable to find image 'apcera/gnatsd:latest' locally
latest: Pulling from apcera/gnatsd
4a5a854cef4c: Pull complete
f875c489604e: Pull complete
0c6ff92460a8: Pull complete
1778a851720d: Pull complete
77d6ce67d574: Pull complete
02ca8857c86d: Pull complete
Digest: sha256:a984331654d262616ca4df0c0414097898c487abaa8a3fdb22a78da3c74c7801
Status: Downloaded newer image for apcera/gnatsd:latest
```

Followed by this, indicating that the NATS server is running:

```
[1] 2015/09/04 20:26:46.344254 [INF] Starting gnatsd version 0.6.6
[1] 2015/09/04 20:26:46.344297 [INF] Starting http monitor on port 8222
[1] 2015/09/04 20:26:46.344378 [INF] Listening for route connections on :6222
[1] 2015/09/04 20:26:46.344402 [INF] Listening for client connections on 0.0.0.0:4222
[1] 2015/09/04 20:26:46.344414 [INF] gnatsd is ready
```

Notice how quickly the NATS server Docker image downloads. It is a mere 3 MB in size.

**4. Run the NATS ping client app.**

```
cd /nats-docs/tutorials/examples/
```

```
go run nats-ping.go
```
