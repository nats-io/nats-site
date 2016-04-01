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

- [Go client](https://github.com/nats-io/nats)
- [Node.js client](https://github.com/nats-io/node-nats)
- [Ruby client](https://github.com/nats-io/ruby-nats)
- [Java client](https://github.com/nats-io/jnats)
- [C client](https://github.com/nats-io/cnats)
- [C# client](https://github.com/nats-io/csnats)
- [Nginx C client](https://github.com/nats-io/nginx-nats)

## API documentation for supported clients

- [C client API documentation](http://nats-io.github.io/cnats/)
- [C# client API documentation](http://nats-io.github.io/csnats/)
- [Java client API documentation](http://nats-io.github.io/jnats)
- Go client API documentation (see instructions below)

For the Go NATS client, use the built-in Golang documentation tool [Godoc](https://godoc.org/golang.org/x/tools/cmd/godoc) to generate API documentation. To do this:

- Clone the Go NATS client repository: `git clone git@github.com:nats-io/nats.git`
- CD to the local directory: `$GOPATH/src/github.com/nats-io/nats`
- Run the Godoc tool: `godoc -http=:6060`
- Browse to the documentation: `http://localhost:6060/pkg/github.com/nats-io/nats/`

## Community clients

The following NATS clients are provided by the community:

- [Spring](https://github.com/cloudfoundry-community/java-nats)
- [Lua](https://github.com/DawnAngel/lua-nats)
- [PHP](https://github.com/repejota/phpnats)
- [Python](https://github.com/mcuadros/pynats)
- [Scala](https://github.com/tyagihas/scala_nats/)
- [Haskell](https://github.com/ondrap/nats-queue)
