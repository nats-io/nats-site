# nats-source

+++ title = "Build the NATS Server from Source" description = "" category = "tutorials" \[menu.main\] name = "Build NATS Server From Source" weight = 2 identifier = "doc-nats-source" parent = "Additional Documentation" +++

The NATS server code is available as open source software under the Apache-2.0 license. You can build the source to run the NATS server on any platform supported by Go. The NATS server code requires at least version 1.4 of Go. You are encouraged to run the latest stable release of Go.

## Prerequisite

* [Set up your Go environment](https://github.com/nats-io/nats-site/tree/c42c46a7c6b8669e66e28419887d2f8dd29aa502/documentation/tutorials/go-install/README.md)

## 1. Verify your Go environment

Run the following command to verify that you are using at least Go 1.5.

```bash
% go version
```

## 2. Create and change into $GOPATH/src/github.com/nats-io directory

```bash
%cd $GOPATH/src

% mkdir -p github\.com/nats-io && cd github.com/nats-io
```

## 3. Clone the NATS server repository

```bash
% git clone git@github.com:nats-io/nats-server.git
```

## 4. Change to the `nats-server` directory you cloned

```bash
%cd $GOPATH/src/github.com/nats-io/nats-server
```

## 5. View the NATS server source code

View the `main.go` file.

```bash
% cat main.go
```

## 6. Build the server from source

Run `go build` from inside the `nats-server` directory.

```bash
% cd nats-server

% go build
```

A successful build run produces no messages and creates an executable called `nats-server` in this directory.

You can invoke this binary, with no options and no configuration file for local testing. To start a server with acceptable production defaults please read our [README.md](https://github.com/nats-io/nats-server#command-line-arguments)

## 7. Start nats-server

```bash
% ./nats-server
```

