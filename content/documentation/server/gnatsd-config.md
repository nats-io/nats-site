+++
date = "2015-09-27"
title = "Server Configuration"
description = ""
category = "server"
[menu.main]
  name = "Server Configuration"
  weight = 5
  identifier = "server-gnatsd-config"
  parent = "Server"
+++

# NATS Server Configuration

You use a server configuration file to configure the NATS server, including:

- Client listening port
- HTTP monitoring port
- Client auth
- Cluster definitions
- Cluster routes
- Logging
- Max client connections
- Max payload
- Slow consumer threshold

## Config file syntax

The server configuration file format is a flexible format that combines the best of traditional configuration formats and newer styles such as JSON and YAML.

The config file format supports the following syntax:

- Mixed Arrays: `[...]`
- Nested Maps: `{...}`
- Multiple comment types: `#` and `//`
- Key value assigments using:
    - Equals sign (`foo = 2`)
    - Colon (`foo: 2`)
    - Whitespace (`foo 2`)
- Maps can be assigned with no key separator
- Semicolons as value terminators in key/value assignments are optional

## Sample server config file

The following demonstrates an examples NATS server config file:

```
port: 4242      # port to listen for client connections
net: apcera.me  # net interface to listen

http_port: 8222 # HTTP monitoring port

# Authorization for client connections
authorization {
  user:     derek
  password: T0pS3cr3t
  timeout:  1
}

# Cluster definition
cluster {

  host: '127.0.0.1'  # host/net interface
  port: 4244         # port for inbound route connections

  # Authorization for route connections
  authorization {
    user: route_user
    password: T0pS3cr3tT00!
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
log_file: "/tmp/gnatsd.log"

# pid file
pid_file: "/tmp/gnatsd.pid"

# Some system overides

# max_connections
max_connections: 100

# maximum protocol control line
max_control_line: 512

# maximum payload
max_payload: 65536

# slow consumer threshold
max_pending_size: 10000000
```
