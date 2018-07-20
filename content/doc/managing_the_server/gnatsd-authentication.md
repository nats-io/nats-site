+++
date = "2015-09-27"
title = "Server Authentication"
description = ""
category = "server"
[menu.main]
  name = "Server Authentication"
  weight = 3
  identifier = "server-gnatsd-authentication-1"
  parent = "Managing the Server"
+++

# NATS Server Authentication

You can enable authentication on the NATS server so that a client must authenticate its identity when connecting. 

The NATS server supports single user authentication via the command line or using a configuration file, and multi-user authentication via a configuration file. 

## Command line options for single-user authentication

You can start the NATS server with single-user authentication enabled by passing in the required credentials on the command line.

The following server authentication options are supported on the command line:

Username and password

    --user user         User required for connections

    --pass password     Password required for connections

Authorization token

    --auth token        Authorization token required for connections

For example:

```
gnatsd -DV --user foo --pass bar
```

Using the command line with an authorization token:

```
gnatsd -DV -auth 'S3Cr3T0k3n!'
```

## Configuration options for single-user authentication

Single-user authentication configured for client connections:

```
authorization {
  user:     derek
  password: T0pS3cr3t
  timeout:  1
}
```

Single-user authentication for route connections:

```
cluster {
  authorization {
    user: route_user
    password: T0pS3cr3tT00!
    timeout: 0.5
  }
}
```

## Multi-user authentication

The NATS server configuration language supports multi-user authentication using 

Usage:

```
users []  // array of 2 or more users
user      // User name, constant or variable
password  // User password, constant or variable
```

You enable multi-user authentication using a NATS Server configuration file that defines the user credentials.

For example:

```
authorization {
  users = [
    {user: alice, password: foo}
    {user: bob,   password: bar}
  ]
}
```

You can also use [variables](http://nats.io/documentation/server/gnatsd-config/) to set user and password values. For example, here a password is declared as a variable named PASS and assigned to Joe.

```
authorization {
  PASS: abcdefghijklmnopqrstuvwxyz0123456789
  users = [
    {user: alice, password: foo}
    {user: bob,   password: bar}
    {user: joe,   password: $PASS}
  ]
}
```

## Client connection string

To connect to the server as an authenticated client, you can pass in the credentials in the connection string.

For example, user 'foo' with password 'bar':

```
nats://foo:bar@localhost:4222
```

Using token 'S3Cr3T0k3n!'

```
nats://S3Cr3T0k3n!@localhost:4222
```

## Tutorial

See the [Writing Go Clients for NATS](/documentation/tutorials/nats-client-dev/) for an basic server authentication implementation.
