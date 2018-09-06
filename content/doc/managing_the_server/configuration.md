+++
title = "NATS Server Configuration"
description = ""
category = "server"
[menu.main]
  name = "Configuration"
  weight = 6
  identifier = "doc-configuration"
  parent = "Managing the Server"
+++

You can use a server configuration file to configure the NATS server, including:

- Client listening port
- HTTP monitoring port
- Client auth
- Cluster definitions
- Cluster routes
- Logging
- Max client connections
- Max payload

In addition, the server configuration language supports [block-scoped variables](#variables) for automation.

## Configuration file format

The server configuration file format is a flexible format that combines the best of traditional configuration formats and newer styles such as JSON and YAML.

The config file format supports the following syntax:

- Mixed Arrays: `[...]`
- Nested Maps: `{...}`
- Multiple comment types: `#` and `//`
- Key value assignments using:
  - Equals sign (`foo = 2`)
  - Colon (`foo: 2`)
  - Whitespace (`foo 2`)
- Maps can be assigned with no key separator
- Semicolons as value terminators in key/value assignments are optional

In general the configuration parameters are the same as the [command line arguments](/doc/managing_the_server/running). Note, however, the following differences:

- The listen option is host:port for connections, on the server command line it is -a and -p, no hostport is supported.
- http/https is only a port on the command line, on the config it is host:port (there’s no config flag for the interface for the monitoring)
- The -cluster flag is used for defining the host:port where routes can be solicited, on the config file this is called ‘listen’ as part property of a ‘cluster’ object.

## Sample server config file

The following demonstrates an example NATS server config file. See also the [NATS Server README](https://github.com/nats-io/gnatsd/blob/master/README.md#configuration-file)

```ascii
port: 4242      # port to listen for client connections
net: localhost # optional listen interface, default is 0.0.0.0 (all)

http_port: 8222 # HTTP monitoring port

# Authorization for client connections
authorization {
  user:     derek
  # ./util/mkpasswd -p T0pS3cr3t
    password: $2a$11$W2zko751KUvVy59mUTWmpOdWjpEm5qhcCZRd05GjI/sSOT.xtiHyG
  timeout:  1
}

# Cluster definition
cluster {

  listen: localhost:4244 # host/port for inbound route connections

  # Authorization for route connections
  authorization {
    user: route_user
    # ./util/mkpasswd -p T0pS3cr3tT00!
        password: $2a$11$xH8dkGrty1cBNtZjhPeWJewu/YPbSU.rXJWmS6SFilOBXzmZoMk9m
    timeout: 0.5
  }

  # Routes are actively solicited and connected to from this server.
  # Other servers can connect to us if they supply the correct credentials
  # in their routes definitions from above.
  routes = [
    nats-route://user1:pass1@127.0.0.1:4245
    nats-route://user2:pass2@127.0.0.1:4246
  ]
}

# logging options
debug:   false
trace:   true
logtime: false
log_file: "/tmp/nats-server.log"

# pid file
pid_file: "/tmp/nats-server.pid"

# Some system overides

# max_connections
max_connections: 100

# maximum protocol control line
max_control_line: 512

# maximum payload
max_payload: 65536

# Duration the server can block on a socket write to a client.  Exceeding the 
# deadline will designate a client as a slow consumer.
 write_deadline: "2s"
```

## Variables

The NATS server configuration file format supports the use of block-scoped variables which can be used for templating in the configuration file, and specifically to ease setting of group values for permission fields.

Variables can be referenced by the prefix `$`, e.g. `$PASSWORD`. Variables can be defined in the configuration file itself or *reference environment variables*.

For example:

```ascii
authorization {
  PASS: abcdefghijklmnopqrstuvwxyz0123456789
  users = [
    {user: alice, password: foo}
    {user: bob,   password: bar}
    {user: joe,   password: $PASS}
  ]
}
```
