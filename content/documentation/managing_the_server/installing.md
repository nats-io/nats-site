# installing

+++ title = "Installing the NATS Server" description = "" category = "server" \[menu.main\] name = "Installation" weight = 1 identifier = "doc-installing-nats-server" parent = "Managing the Server" +++

There are numerous ways to install the NATS server.

## Install From Binary

The latest official release binaries are always available on the [GitHub releases page](https://github.com/nats-io/nats-server/releases). The following platforms are available:

* Linux \(x86, x86\_64, ARM\)
* Windows \(x86, x86\_64\)
* macOS

## Alternative/Platform Specific Methods

> **The following methods may not all install the latest released version**

### Go

Make sure [your Go environment is set up](https://github.com/nats-io/nats-site/tree/c42c46a7c6b8669e66e28419887d2f8dd29aa502/documentation/additional_documentation/go-install/README.md), then install using `go get`.

```bash
go get github.com/nats-io/nats-server
```

### Docker Hub

The latest [official Docker image](https://hub.docker.com/_/nats/) is available on Docker Hub.

### Windows

On Windows, the NATS server can be installed via [Chocolatey](https://chocolatey.org/packages/nats-server):

```bash
choco install nats-server
```

### macOS

On macOS, the NATS server can be installed via [Homebrew](http://brewformulas.org/nats-server):

```bash
brew install nats-server
```

## Test Your Installation

To test your installation, you can invoke the NATS server binary, with no options and no configuration file \(no authentication, no clustering\).

```bash
nats-server
```

When the server starts successfully, you will see that the NATS server listens for client connections on TCP Port 4222:

```bash
[18141] 2016/10/31 13:13:40.732616 [INF] Starting nats-server version 0.9.4
[18141] 2016/10/31 13:13:40.732704 [INF] Listening for client connections on 0.0.0.0:4222
[18141] 2016/10/31 13:13:40.732967 [INF] Server is ready
```

