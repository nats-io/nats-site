+++
date = "2015-09-27"
title = "Server Clustering"
description = ""
category = "server"
[menu.main]
  name = "Server Clustering"
  weight = 7
  identifier = "server-gnatsd-cluster"
  parent = "Server"
+++

# NATS Server Clustering

NATS supports running each server in clustered mode. You can cluster servers together for high volume messaging systems and resiliency and high availability. Clients are cluster-aware.

Note that NATS clustered servers have a forwarding limit of one hop. This means that each `gnatsd` instance will **only** forward messages that it has received **from a client** to the immediately adjacent `gnatsd` instances to which it has routes. Messages received **from** a route will only be distributed to local clients. Therefore a full mesh cluster, or complete graph, is recommended for NATS to function as intended and as described throughout the documentation. 

## Usage

The following cluster options are supported:

		--routes [rurl-1, rurl-2]		Routes to solicit and connect

Note that NATS server clustering is configured using the server config file.

## Cluster examples

Below is an example of how to setup gnatsd cluster using Docker.

We put 3 different configurations (one per gnatsd server) under a folder named conf as follows:

```
|-- conf
    |-- gnatsd-A.conf
    |-- gnatsd-B.conf
    |-- gnatsd-C.conf
```

Each one of those files have the following content below: (Here I am using ip 192.168.59.103 as an example, so just replace with the proper ip from your server)


### Example 1: Setting up a cluster on 3 different servers provisioned beforehand

**gnatsd-A**

```
# Cluster Server A

port: 7222

cluster {
  host: '0.0.0.0'
  port: 7244

  routes = [
    nats-route://192.168.59.103:7246
    nats-route://192.168.59.103:7248
  ]
}
```

**gnatsd-B**

```
# Cluster Server B

port: 8222

cluster {
  host: '0.0.0.0'
  port: 7246

  routes = [
    nats-route://192.168.59.103:7244
    nats-route://192.168.59.103:7248
  ]
}
```

**gnatsd-C**

```
# Cluster Server C

port: 9222

cluster {
  host: '0.0.0.0'
  port: 7248

  routes = [
    nats-route://192.168.59.103:7244
    nats-route://192.168.59.103:7246
  ]
}
```

Starting the containers

Then on each one of your servers, you should be able to start the gnatsd image as follows:

```
docker run -it -p 0.0.0.0:7222:7222 -p 0.0.0.0:7244:7244 --rm -v $(pwd)/conf/gnatsd-A.conf:/tmp/cluster.conf apcera/gnatsd -c /tmp/cluster.conf -p 7222 -D -V
```

```
docker run -it -p 0.0.0.0:8222:8222 -p 0.0.0.0:7246:7246 --rm -v $(pwd)/conf/gnatsd-B.conf:/tmp/cluster.conf apcera/gnatsd -c /tmp/cluster.conf -p 8222 -D -V
```

```
docker run -it -p 0.0.0.0:9222:9222 -p 0.0.0.0:7248:7248 --rm -v $(pwd)/conf/gnatsd-C.conf:/tmp/cluster.conf apcera/gnatsd -c /tmp/cluster.conf -p 9222 -D -V
```

### Example: Setting a gnatsd cluster one by one

In this scenario:

- We bring up A and get its ip (nats-route://192.168.59.103:7244)
- Then create B and then use address of A in its configuration.
- Get the address of B nats-route://192.168.59.104:7246 and create C and use the addresses of A and B.

First, we create the Node A and start up a gnatsd server with the following config:

```
# Cluster Server A

port: 4222

cluster {
  host: '0.0.0.0'
  port: 7244

}
```

```
docker run -it -p 0.0.0.0:4222:4222 -p 0.0.0.0:7244:7244 --rm -v $(pwd)/conf/gnatsd-A.conf:/tmp/cluster.conf apcera/gnatsd -c /tmp/cluster.conf -p 4222 -D -V
```

Then we proceed to create the next node. We realize that the first node has ip:port as `192.168.59.103:7244` so we add this to the routes configuration as follows:

```
# Cluster Server B

port: 4222

cluster {
  host: '0.0.0.0'
  port: 7244

  routes = [
    nats-route://192.168.59.103:7244
  ]
}
```

Then start server B:

```
docker run -it -p 0.0.0.0:4222:4222 -p 0.0.0.0:7244:7244 --rm -v $(pwd)/conf/gnatsd-B.conf:/tmp/cluster.conf apcera/gnatsd -c /tmp/cluster.conf -p 4222 -D -V
```

Finally, we create another Node C. We now know the routes of A and B so we can add it to its configuration:

```
# Cluster Server C

port: 4222

cluster {
  host: '0.0.0.0'
  port: 7244

  routes = [
    nats-route://192.168.59.103:7244
    nats-route://192.168.59.104:7244
  ]
}
```

Then start it:

```
docker run -it -p 0.0.0.0:4222:4222 -p 0.0.0.0:7244:7244 --rm -v $(pwd)/conf/gnatsd-C.conf:/tmp/cluster.conf apcera/gnatsd -c /tmp/cluster.conf -p 9222 -D -V
```

Now, the following should work: make a subscription to Node A then publish to Node C. You should be able to to receive the message without problems.

```
nats-sub -s "nats://192.168.59.103:7222" hello &

nats-pub -s "nats://192.168.59.105:7222" hello world

[#1] Received on [hello] : 'world'

# GNATSD on Node C logs:
[1] 2015/06/23 05:20:31.100032 [TRC] 192.168.59.103:7244 - rid:2 - <<- [MSG hello RSID:8:2 5]

# GNATSD on Node A logs:
[1] 2015/06/23 05:20:31.100600 [TRC] 10.0.2.2:51007 - cid:8 - <<- [MSG hello 2 5]
```
