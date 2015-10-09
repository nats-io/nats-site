+++
date = "2015-09-27"
title = "Server Authorization"
description = ""
category = "server"
[menu.main]
  name = "Server Authorization"
  weight = 3
  identifier = "server-gnatsd-auth"
  parent = "server"
+++

# NATS Server Authorization

You can enable authentication on the NATS server so that a client must authentication when connecting.

## Options

The following server authorization options are supported:

		--user user 				User required for connections

		--pass password             Password required for connections

## Authorization examples

You can start the server with authentication required by passing in the required credentials with the server start command. Alternatively, you can enable authentication and set the credentials in the server configuration file.

### Command line

For example, using the command line:

```
gnatsd -DV -m 8222 --user foo --pass bar
```

### Config file

Authorization for client connections:

```
authorization {
  user:     derek
  password: T0pS3cr3t
  timeout:  1
}
```

Authorization for route connections:

```
cluster {
  authorization {
    user: route_user
    password: T0pS3cr3tT00!
    timeout: 0.5
  }
}
```

### Client connection string

For example:

```
nats://foo:bar@localhost:4222
```

## Tutorial

See the [Writing Go Clients for NATS](/documentation/tutorials/nats-client-dev/) for an example server authorization implementation.
