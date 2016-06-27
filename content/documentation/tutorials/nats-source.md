+++
date = "2015-09-27"
title = "Build NATS Server from Source"
description = ""
category = "tutorials"
[menu.main]
  name = "Build NATS Server from Source"
  weight = 3
  identifier = "tutorial-nats-source"
  parent = "Tutorials"
+++

# Build NATS Server from Source

The NATS server code is available as open source software under the MIT license. You can build the source to run the NATS server on any platform supported by Go. The NATS server code requires at least version 1.4 of Go. You are encouraged to run the latest stable release of Go.

## Prerequisite

- [Set up your Go environment](/documentation/tutorials/go-install/)

## Instructions

**1. Verify your Go environement.**

Run the following command to verify that you are using at least Go 1.4.

```
go version
```

**2. Clone the NATS server repository.**

```
git clone git@github.com:nats-io/gnatsd.git
```

**3. CD to the `gnatsd` directory you cloned.**

```
cd $GOPATH/src/github.com/nats-io/gnatsd
```

**4. View the NATS server source code.**

NATS is open source software.

Use command `ls` to list the **gnatsd.go** file.

Use command `cat gnatsd.go` to view the code.

**5. Build the server from source.**

Run `go build` from inside the `gnatsd` directory.

```
cd gnatsd

go build
```

**6. Run the unit regression tests.**

Optionally you can run the unit regression tests:

```
go test ./...
```

A successful build run produces no messages and creates an executable called `gnatsd` in this directory. You can invoke this binary, with no options and no configuration file, to start a server with acceptable standalone defaults (no authentication, no clustering).
