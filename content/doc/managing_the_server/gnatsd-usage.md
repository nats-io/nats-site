+++
date = "2015-09-27"
title = "Server Usage"
description = ""
category = "server"
[menu.main]
  name = "Server Usage"
  weight = 2
  identifier = "server-gnatsd-usage-1"
  parent = "Managing the Server"
+++

# NATS Server Usage

Out-of-the-box you can run the NATS server without any custom settings.

To configure the NATS server, you can include one or more command line arguments as described below, or you can use a [configuration file](/documentation/server/gnatsd-config).

## Installation

To install the NATS server:

```
go get github.com/nats-io/gnatsd
```

Refer to the [NATS installation tutorial](/documentation/tutorials/gnatsd-install/) for more detailed instructions.

## Start up

Run the following command to invoke the `gnatsd` binary, with no options and no configuration file, to start a server with acceptable standalone defaults (no authentication, no clustering).

```
gnatsd
```

## Server options

    -a, --addr HOST                  Bind to HOST address (default is `0.0.0.0`).
    -p, --port PORT                  PORT for client connections (default is `4222`).
    -P, --pid FILE                   File path to store PID.
    -m, --http_port PORT             HTTP PORT for monitoring (use `-m 8222` to enable).
    -ms,--https_port PORT            Use HTTPS PORT for monitoring
    -c, --config FILE                File path to server configuration.

See [Configuration](/documentation/server/gnatsd-config).

## Logging options

    -l, --log FILE                   File to redirect log output
    -T, --logtime                    Timestamp log entries (default: true)
    -s, --syslog                     Enable syslog as log method.
    -r, --remote_syslog              Syslog server addr (udp://localhost:514).
    -D, --debug                      Enable debugging output
    -V, --trace                      Trace the raw protocol
    -DV                              Debug and Trace

See [Logging](/documentation/server/gnatsd-logging).

## Authorization options

        --user user                  User required for connections
        --pass password              Password required for connections

See [Authorization](/documentation/server/gnatsd-authorization).

## TLS Options

        --tls                        Enable TLS, do not verify clients (default: false)
        --tlscert FILE               Server certificate file
        --tlskey FILE                Private key for server certificate
        --tlsverify                  Enable TLS, verify client certificates
        --tlscacert FILE             Client certificate CA for verification

## Cluster Options

        --routes [rurl-1, rurl-2]    Routes to solicit and connect
        --cluster [cluster url]      Cluster URL for solicited routes

See [Clustering](/documentation/server/gnatsd-cluster).

Common Options:

    -h, --help                       Show this message
    -v, --version                    Show version    
        --help_tls                   TLS help


## API documentation

For the Go server, you can use the built-in Golang documentation tool [Godoc](https://godoc.org/golang.org/x/tools/cmd/godoc) to generate API documentation. To do this:

- Clone the Go server repository: `git clone git@github.com:nats-io/gnatsd.git`
- CD to the local directory: `$GOPATH/src/github.com/nats-io/gnatsd`
- Run the Godoc tool: `godoc -http=:6060`
- Browse to the documentation: `http://localhost:6060/pkg/github.com/nats-io/gnatsd/server/`
