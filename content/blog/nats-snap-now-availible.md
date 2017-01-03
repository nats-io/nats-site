+++
categories = ["Engineering", "Community"]
date = "2017-01-02"
tags = ["nats", "webinar"]
title = "Combining the Simplicity of NATS with the Simplicity of Snapcraft.io - NATS Snap now available"
author = "Wally Quevedo"
+++

The [Snap](http://snapcraft.io/) initiative spearheaded by Canonical, Dell, Samsung, Intel, The Linux Foundation and others, enables a single binary to run securely on any Linux system (desktop, mobile, cloud, IoT - you name it) -- a standard approach providing flexibility, simplicity, and security. Moreover, all of the various Snap-enabled applications need to communicate with a multitude of devices and systems.

NATS is a messaging system all about simplicity, security, and performance. It’s a single binary with no external dependencies, and just a few MB in size. It’s lightweight footprint, security, and scalability made it a great fit for the Snap initiative, and we’re happy to share that a Snap for NATS Server is now available via the command line (```
sudo snap install nats-server
```), or via [UAppExplorer](https://uappexplorer.com/app/nats-server.nats-io).

What is interesting about snaps as a technology offering, is how they have decided to make policy a first class citizen from the start.

For example, let's take a look at its YAML definition for the latest release of the server (which is available at [https://github.com/wallyqs/nats-snapcraft/blob/master/snapcraft.yaml](https://github.com/wallyqs/nats-snapcraft/blob/master/snapcraft.yaml))

```yaml
name: nats-server
version: "0.9.4"
summary: "High-Performance server for NATS"
description: "High-Performance server for NATS, the cloud native messaging system"
confinement: strict

apps:
  nats-server:
    command: gnatsd-v0.9.4-linux-amd64/gnatsd
    plugs: [network-bind]

parts:
  gnatsd:
    plugin: dump
    source: https://github.com/nats-io/gnatsd/releases/download/v0.9.4/gnatsd-v0.9.4-linux-amd64.zip
```

We can notice an entry `plugs: [network-bind]` entry being explicitly declared and for a reason: the NATS server requires being able to listen on a port.  

If we take out that declaration for example...

```yaml
apps:
  nats-server:
    command: gnatsd-v0.9.4-linux-amd64/gnatsd
#    plugs: [network-bind]
```

...and try to start the server again we'll be getting the following:

```
/snap/bin/nats-server

[1707] 2016/12/13 08:30:48.319522 [INF] Starting nats-server version 0.9.4
[1707] 2016/12/13 08:30:48.319576 [INF] Listening for client connections on 0.0.0.0:4222
[1707] 2016/12/13 08:30:48.320145 [FTL] Error listening on port: 0.0.0.0:4222, "listen tcp 0.0.0.0:4222: socket: permission denied"
```

If we uncomment again on the other hand, the server will be able to start and we connect to it without issues:

```
/snap/bin/nats-server &
[1] 1753

[1753] 2016/12/13 08:37:45.072217 [INF] Starting nats-server version 0.9.4
[1753] 2016/12/13 08:37:45.072263 [INF] Listening for client connections on 0.0.0.0:4222
[1753] 2016/12/13 08:37:45.072545 [INF] Server is ready

telnet 127.0.0.1 4222
Trying 127.0.0.1...
Connected to 127.0.0.1.
Escape character is '^]'.
INFO {"server_id":"KIWGx86ug3TDKpDNVCCBDj","version":"0.9.4","go":"go1.6.3","host":"0.0.0.0","port":4222,"auth_required":false,"ssl_required":false,"tls_required":false,"tls_verify":false,"max_payload":1048576}
```

You can find the official NATS snap by running:

```
snap install nats-server
```
