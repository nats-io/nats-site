+++
title = "Running the NATS Server"
description = ""
category = "server"
[menu.main]
  name = "Running the Server"
  weight = 2
  identifier = "doc-running-gnatsd"
  parent = "Managing the Server"
+++

Out-of-the-box you can run the NATS server without any custom settings.

```sh
gnatsd
```

### Starting the NATS server with monitoring enabled (optional)

The NATS server exposes a monitoring interface on port 8222.

```
gnatsd -m 8222
```

If you run the NATS server with monitoring enabled, you see the following messages:

```
[18159] 2016/10/31 13:14:03.055572 [INF] Starting nats-server version 0.9.4
[18159] 2016/10/31 13:14:03.055692 [INF] Starting http monitor on 0.0.0.0:8222
[18159] 2016/10/31 13:14:03.055762 [INF] Listening for client connections on 0.0.0.0:4222
[18159] 2016/10/31 13:14:03.055796 [INF] Server is ready
```

## Command Line Options

There are two ways to configure the server. You can include one or more command line arguments as described below, or you can use a [configuration file](/doc/managing_the_server/configuration).

### Common Options

    -h, --help                       Show this message
    -v, --version                    Show version

### Server Options

    -a, --addr HOST                  Bind to HOST address (default is `0.0.0.0`).
    -p, --port PORT                  PORT for client connections (default is `4222`).
    -P, --pid FILE                   File path to store PID.
    -m, --http_port PORT             HTTP PORT for monitoring (use `-m 8222` to enable).
    -ms,--https_port PORT            Use HTTPS PORT for monitoring
    -c, --config FILE                File path to server configuration.
    -client_advertise HOST:PORT      Configure the HOST and PORT returned in the INFO message

See [Configuration](/doc/managing_the_server/configuration).

### Logging options

    -l, --log FILE                   File to redirect log output
    -T, --logtime                    Timestamp log entries (default: true)
    -s, --syslog                     Enable syslog as log method.
    -r, --remote_syslog              Syslog server addr (udp://localhost:514).
    -D, --debug                      Enable debugging output
    -V, --trace                      Trace the raw protocol
    -DV                              Debug and Trace

See [Logging](/doc/managing_the_server/logging).

### Single User Authentication options

    --user user                  User required for connections
    --pass password              Password required for connections
    --auth token                 Token required for connections

See [Authentication](/doc/managing_the_server/authentication).

### TLS Options

    --help_tls                   TLS help
    --tls                        Enable TLS, do not verify clients (default: false)
    --tlscert FILE               Server certificate file
    --tlskey FILE                Private key for server certificate
    --tlsverify                  Enable TLS, verify client certificates
    --tlscacert FILE             Client certificate CA for verification

### Cluster Options

    --routes [rurl-1, rurl-2]    Routes to solicit and connect
    --cluster [cluster url]      Cluster URL for solicited routes

See [Clustering](/doc/managing_the_server/clustering).

If routing is enabled, route (server) connections listen on port 6222.

```
[18159] 2016/10/31 13:14:03.055572 [INF] Starting nats-server version 0.9.4
[18159] 2016/10/31 13:14:03.055692 [INF] Starting http monitor on 0.0.0.0:8222
[18159] 2016/10/31 13:14:03.055707 [INF] Listening for route connections on 0.0.0.0:6222
[18159] 2016/10/31 13:14:03.055762 [INF] Listening for client connections on 0.0.0.0:4222
[18159] 2016/10/31 13:14:03.055796 [INF] Server is ready
```
