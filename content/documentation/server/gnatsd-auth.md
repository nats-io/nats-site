+++
date = "2015-09-27"
title = "Server Authorization"
description = ""
category = "server"
[menu.documentation]
  name = "Server Authorization"
  weight = 3
  identifier = "server-gnatsd-auth"
  parent = "server"
+++

# NATS Server Authorization

You can enable authentication on the NATS server so that a client must authenticate its identity when connecting.

## Options

The following server authorization options are supported:

Username and password

		--user user 				User required for connections

		--pass password             Password required for connections

Authorization token

		--auth token                Authorization token required for connections

## Authorization examples

You can start the server with authentication required by passing in the required credentials on the command line. Alternatively, you can enable authentication and set the credentials in the server configuration file.

### Command line

For example, using the command line with user name and password:

```
gnatsd -DV --user foo --pass bar
```

Using the command line with an authorization token:
```
gnatsd -DV -auth 'S3Cr3T0k3n!'
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

For example, user 'foo' with password 'bar':

```
nats://foo:bar@localhost:4222
```

Using token 'S3Cr3T0k3n!'

```
nats://S3Cr3T0k3n!@localhost:4222
```
### Using `bcrypt`

In addition to TLS functionality, the server now also supports hashing of passwords and authentication tokens using `bcrypt`. To take advantage of this, simply replace the plaintext password in the configuration with its `bcrypt` hash, and the server will automatically utilize `bcrypt` as needed.

A utility for creating `bcrypt` hashes is included with the gnatsd distribution (`util/mkpasswd.go`). Running it with no arguments will generate a new secure password along with the associated hash. This can be used for a password or a token in the configuration. 

```
~/go/src/github.com/nats-io/gnatsd/util> go build mkpasswd.go
~/go/src/github.com/nats-io/gnatsd/util> ./mkpasswd
pass: #IclkRPHUpsTmACWzmIGXr
bcrypt hash: $2a$11$3kIDaCxw.Glsl1.u5nKa6eUnNDLV5HV9tIuUp7EHhMt6Nm9myW1aS
```

If you already have a password selected, you can supply the `-p` flag on the command line, enter your desired password, and a `bcrypt` hash will be generated for it:
```
~/go/src/github.com/nats-io/gnatsd/util> ./mkpasswd -p
Enter Password: *******
Reenter Password: ******
bcrypt hash: $2a$11$3kIDaCxw.Glsl1.u5nKa6eUnNDLV5HV9tIuUp7EHhMt6Nm9myW1aS
```

Add the hash into the server configuration file's authorization section.

```
  authorization {
    user: derek
    password: $2a$11$3kIDaCxw.Glsl1.u5nKa6eUnNDLV5HV9tIuUp7EHhMt6Nm9myW1aS
  }
```

## Tutorial

See the [Writing Go Clients for NATS](/documentation/tutorials/nats-client-dev/) for an example server authorization implementation.
