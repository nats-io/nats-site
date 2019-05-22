# authentication

+++ date = "2015-09-27" title = "NATS Server Authentication" description = "" category = "server" \[menu.main\] name = "Authentication" weight = 3 identifier = "doc-server-authentication" parent = "Managing the Server" +++

You can enable authentication on the NATS server so that a client must authenticate its identity when connecting. The NATS server supports single user authentication via the command line or using a configuration file, and multi-user authentication via a configuration file. Single user authentication is truly single user. The server will accept one set of credentials and no other.

## Command Line Options

You can start the NATS server with single-user authentication enabled by passing in the required credentials on the command line. The following server authentication options are supported on the command line:

```text
--user user         User required for connections
--pass password     Password required for connections
--auth token        Authorization token required for connections
```

Token is mutually exclusive from user and password, so only use one of those.

For example:

```bash
nats-server -DV --user foo --pass bar
```

will allow the user `foo` to log in with the password `bar`, but no other users to access the server.

Using the command line with an authorization token:

```bash
nats-server -DV -auth 'S3Cr3T0k3n!'
```

will allow clients with that token to connect, and no others.

## Single User Configuration Options

Single-user authentication can be configured in the configuration file:

```text
authorization {
  user:     derek
  password: T0pS3cr3t
  timeout:  1
}
```

If the server is part of a cluster, you can set up single-user authentication for route connections as well:

```text
cluster {
  authorization {
    user: route_user
    password: T0pS3cr3tT00!
    timeout: 0.5
  }
}
```

Both of these configurations set a user and password as well as a connect timeout. The `auth` option can also be set to use tokens _instead of_ user/password.

## Multi-User Authentication

Multi-user Authentication can only be set up in the configuration file. Users are defined in a list with user/password pairs.

For example, to define two users `alice` and `bob`:

```text
authorization {
  users = [
    {user: alice, password: foo}
    {user: bob,   password: bar}
  ]
}
```

You can also use [variables](https://github.com/nats-io/nats-site/tree/c42c46a7c6b8669e66e28419887d2f8dd29aa502/documentation/managing_the_server/configuration/README.md) to set user and password values. For example, here a password is declared as a variable named PASS and assigned to Joe.

```text
authorization {
  PASS: abcdefghijklmnopqrstuvwxyz0123456789
  users = [
    {user: alice, password: foo}
    {user: bob,   password: bar}
    {user: joe,   password: $PASS}
  ]
}
```

The nats-server source code includes a tool that can be used to bcrypt passwords for the config file:

```bash
> go run mkpasswd.go -p
> password: password
> bcrypt hash: $2a$11$1oJy/wZYNTxr9jNwMNwS3eUGhBpHT3On8CL9o7ey89mpgo88VG6ba
```

This allows you to store hashed passwords instead of plain text ones.

## Client connection string

To connect to the server as an authenticated client, you can pass in the credentials in the connection string.

For example, user 'foo' with password 'bar':

```bash
nats://foo:bar@localhost:4222
```

Using token 'S3Cr3T0k3n!'

```bash
nats://S3Cr3T0k3n!@localhost:4222
```

The server also supports TLS mutual authentication documented in the [Security/Encryption section](https://github.com/nats-io/nats-site/tree/c42c46a7c6b8669e66e28419887d2f8dd29aa502/documentation/managing_the_server/security/README.md). Other methods are also discussed in the [developer doc](https://github.com/nats-io/nats-site/tree/c42c46a7c6b8669e66e28419887d2f8dd29aa502/documentation/writing_applications/secure_connection/README.md).

