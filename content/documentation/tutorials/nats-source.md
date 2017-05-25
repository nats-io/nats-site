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

**1. Verify your Go environment.**

Run the following command to verify that you are using at least Go 1.5.

```
go version
```

**2. Create and change into $GOPATH/src/github.com/nats-io directory.**
```
cd $GOPATH/src

mkdir -p github\.com/nats-io && cd github.com/nats-io
```

**3. Clone the NATS server repository.**

```
git clone git@github.com:nats-io/gnatsd.git
```

**4. Change to the `gnatsd` directory you cloned.**

```
cd $GOPATH/src/github.com/nats-io/gnatsd
```

**5. View the NATS server source code.**

View the **main.go** file.

```
cat main.go
```

**6. Build the server from source.**

Run `go build` from inside the `gnatsd` directory.

```
cd gnatsd

go build
```

**7. Start nats-server.**

```
./gnatsd
```

<!-- **6. Run the unit regression tests.**

Optionally you can run the unit regression tests:

```
go test ./...
``` -->

**A successful build run produces no messages and creates an executable called `gnatsd` in this directory.**

**You can invoke this binary, with no options and no configuration file for local testing. To start a server with acceptable production defaults please read our (README.md)[https://github.com/nats-io/gnatsd#command-line-arguments].**
