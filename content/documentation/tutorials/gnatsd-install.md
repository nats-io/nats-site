+++
date = "2015-09-27"
title = "Install NATS Server"
description = ""
category = "tutorials"
[menu.main]
  name = "Install NATS Server"
  weight = 2
  identifier = "tutorial-gnatsd-install"
  parent = "Server"
+++

# Install and Run NATS Server

In this tutorial you install and run the NATS server (`gnatsd`). You can follow this same procedure anytime you want to run the NATS server.

### Install the NATS server

There are numerous ways to install the NATS server.

#### Go

Make sure [your Go environment is set up](/documentation/tutorials/go-install/)

```
go get github.com/nats-io/gnatsd
```

#### GitHub releases

Pre-built release binaries are always available on the [GitHub releases page](https://github.com/nats-io/gnatsd/releases). 
The following platforms are available:

 * Linux (x86, x86_64, ARM)
 * Windows (x86, x86_64)
 * macOS


#### Docker Hub

The latest [official Docker image](https://hub.docker.com/_/nats/) is always available on Docker Hub.


#### Windows

On Windows, the NATS server can also be installed via [Chocolatey](https://chocolatey.org/packages/gnatsd):

```
choco install gnatsd
```

#### macOS

On macOS, the NATS server can alo be installed via [Homebrew](http://brewformulas.org/Gnatsd):

```
brew install gnatsd
```

Note that this method may not install the latest released version.

### Start the NATS server

You can invoke the NATS server binary, with no options and no configuration file, to start a server with acceptable standalone defaults (no authentication, no clustering).

```
gnatsd
```

When the server starts successfully, you will see that the NATS server listens for client connections on TCP Port 4222:

```
[35483] 2016/05/09 22:00:56.966499 [INF] Starting nats-server version 0.8.0
[35483] 2016/05/09 22:00:56.966658 [INF] Listening for client connections on 0.0.0.0:4222
[35483] 2016/05/09 22:00:56.968883 [INF] Server is ready
```

### Starting the NATS server with monitoring enabled (optional)

The NATS server exposes a monitoring interface on port 8222.

```
gnatsd -m 8222
```

If you run the NATS server with monitoring enabled, you see the following messages:

```
[35490] 2016/05/09 22:13:35.523638 [INF] Starting nats-server version 0.8.0
[35490] 2016/05/09 22:13:35.523738 [INF] Starting http monitor on 0.0.0.0:8222
[35490] 2016/05/09 22:13:35.523823 [INF] Listening for client connections on 0.0.0.0:4222
[35490] 2016/05/09 22:13:35.523849 [INF] Server is ready
```

### Starting the NATS server with routes enabled (optional)

If routing is enabled, route (server) connections listen on port 6222.

```
[35490] 2016/05/09 22:13:35.523638 [INF] Starting nats-server version 0.8.0
[35490] 2016/05/09 22:13:35.523738 [INF] Starting http monitor on 0.0.0.0:8222
[35490] 2015/08/12 15:18:22.301707 [INF] Listening for route connections on 0.0.0.0:6222
[35490] 2016/05/09 22:13:35.523823 [INF] Listening for client connections on 0.0.0.0:4222
[35490] 2016/05/09 22:13:35.523849 [INF] Server is ready
```
