+++
date = "2015-09-27"
title = "NATS Clients"
category = "clients"
[menu.documentation]
  name = "NATS Clients"
  weight = 0
  identifier = "clients-nats-clients"
  parent = "clients"
+++

# NATS Clients

There are several open source client libraries for NATS from which you can choose, including supported and community.

## Supported clients

[Apcera](https://www.apcera.com/) actively maintains and supports the following NATS clients:

### NATS

- [Go client](https://github.com/nats-io/nats) (see below for API documentation)
- [Node.js client](https://github.com/nats-io/node-nats)
- [Ruby client](https://github.com/nats-io/ruby-nats)
- [Java client](https://github.com/nats-io/jnats) ([API doc](http://nats-io.github.io/jnats/))
- [C client](https://github.com/nats-io/cnats) ([API doc](http://nats-io.github.io/cnats/))
- [C# client](https://github.com/nats-io/csnats) ([API doc](http://nats-io.github.io/csnats/))
- [NGINX C client](https://github.com/nats-io/nginx-nats)

### NATS Streaming
- [Go client](https://github.com/nats-io/go-nats-streaming) 
- [Java client](https://github.com/nats-io/java-nats-streaming) ([API documentation](http://nats-io.github.io/jnats/))

## API documentation for Go

For the Go NATS and NATS Streaming client, use the built-in Golang documentation tool [Godoc](https://godoc.org/golang.org/x/tools/cmd/godoc) to generate API documentation. To do this:

- Clone the Go NATS client repository: `git clone git@github.com:nats-io/nats.git` (or `git clone git@github.com:nats-io/go-nats-streaming.git`)
- CD to the local directory: `$GOPATH/src/github.com/nats-io/nats` (or `$GOPATH/src/github.com/nats-io/go-nats-streaming`)
- Run the Godoc tool: `godoc -http=:6060`
- Browse to the documentation: `http://localhost:6060/pkg/github.com/nats-io/nats/` (or `http://localhost:6060/pkg/github.com/nats-io/go-nats-streaming/`

## Community clients

The following NATS clients are provided by the community:

- [Spring](https://github.com/cloudfoundry-community/java-nats)
- [Lua](https://github.com/DawnAngel/lua-nats)
- [PHP](https://github.com/repejota/phpnats)
- [Python](https://github.com/mcuadros/pynats)
- [Scala](https://github.com/tyagihas/scala_nats/)
- [Haskell](https://github.com/ondrap/nats-queue)
- [C# MyNatsClient](https://github.com/danielwertheim/mynatsclient)
