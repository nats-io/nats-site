+++
date = "2015-09-27"
title = "Server Logging"
description = ""
category = "server"
[menu.main]
  name = "Server Logging"
  weight = 4
  identifier = "server-gnatsd-logging"
  parent = "server"
+++

# NATS Server Logging

The NATS server provides various logging options.

## Logging options

The following logging operations are supported:

    -l, --log FILE                   File to redirect log output.
    -T, --logtime                    Timestamp log entries (default is true).
    -s, --syslog                     Enable syslog as log method.
    -r, --remote_syslog              Syslog server address.
    -D, --debug                      Enable debugging output.
    -V, --trace                      Trace the raw protocol.
    -DV                              Debug and Trace.

## Debug and trace

The `-DV` flag enables trace and debug for the server.

```
gnatsd -DV -m 8222 -user foo -pass bar
```

## Log file redirect

```
gnatsd -DV -m 8222 -l nats.log
```

## Timestamp

If `-T false` then log entries are not timestamped. Default is true.

## Syslog

```
gnatsd -s udp://localhost:514
```

```
gnatsd -r syslog://<hostname>:<port>
```

For example:

```
syslog://logs.papertrailapp.com:26900
```

## Config file example

```
# logging options
debug:   false
trace:   true
logtime: false
log_file: "/tmp/gnatsd.log"
```
