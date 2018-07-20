+++
date = "2015-09-27"
title = "Server Logging"
description = ""
category = "server"
[menu.main]
  name = "Server Logging"
  weight = 4
  identifier = "server-gnatsd-logging-1"
  parent = "Managing the Server"
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

## Log rotation with logrotate

NATS server does not provide tools to manage log files, but it does include mechanisms that make log rotation simple. We can use this mechanism with [logrotate](https://github.com/logrotate/logrotate); a simple standard Linux utility to rotate logs available on most distributions like Debian, Ubuntu, RedHat (CentOS), etc.

Simple custom logrotate script is below:

```
/path/to/gnatsd.log {
    daily
    rotate 30
    compress
    missingok
    notifempty
    postrotate
        kill -SIGUSR1 `cat /var/run/gnatsd.pid`   
    endscript
}
```

The first line specifies the location that the subsequent lines will apply to.

The rest of the file specifies that the logs will rotate daily ("daily" option) and that 30 older copies will be preserved ("rotate" option). Other options are described in [logrorate documentation](https://linux.die.net/man/8/logrotate).

The "postrotate" section tells NATS server to reload the log files once the rotation is complete. The command ```kill -SIGUSR1 `cat /var/run/gnatsd.pid` ``` does not kill the NATS server process, but instead sends it a signal causing it to reload its log files. This will cause new requests to be logged to the refreshed log file.

The `/var/run/gnatsd.pid` file is where NATS server stores the master process's pid.
