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

## Example

The following example demonstrates how to run a cluster of 3 servers on the same host. We will start with the seed server and use the `-D` command line parameter to produce debug information.

```
gnatsd -p 4222 -cluster nats://localhost:4248 -D
```

Alternatively, you could use a configuration file, let's call it `seed.conf`, with a content similar to this:

```
# Cluster Seed Node

listen: 127.0.0.1:4222
http: 8222

cluster {
  listen: 127.0.0.1:4248
}
```

And start the server like this:

```
gnatsd -config ./seed.conf -D
```

This will produce an output similar to:

```
[75653] 2016/04/26 15:14:47.339321 [INF] Listening for route connections on 127.0.0.1:4248
[75653] 2016/04/26 15:14:47.340787 [INF] Listening for client connections on 127.0.0.1:4222
[75653] 2016/04/26 15:14:47.340822 [DBG] server id is xZfu3u7usAPWkuThomoGzM
[75653] 2016/04/26 15:14:47.340825 [INF] server is ready
```

It is also possible to specify the hostname and port independently. At least the port is required. If you leave the hostname off it will bind to all the interfaces ('0.0.0.0').

```
cluster {
  host: 127.0.0.1
  port: 4248
}
```

Now let's start two more servers, each one connecting to the seed server.

```
gnatsd -p 5222 -cluster nats://localhost:5248 -routes nats://localhost:4248 -D
```

When running on the same host, we need to pick different ports for the client connections `-p`, and for the port used to accept other routes `-cluster`. Note that `-routes` points to the `-cluster` address of the seed server (`localhost:4248`).

Here is the log produced. See how it connects and registers a route to the seed server (`...GzM`).

```
[75665] 2016/04/26 15:14:59.970014 [INF] Listening for route connections on localhost:5248
[75665] 2016/04/26 15:14:59.971150 [INF] Listening for client connections on 0.0.0.0:5222
[75665] 2016/04/26 15:14:59.971176 [DBG] server id is 53Yi78q96t52QdyyWLKIyE
[75665] 2016/04/26 15:14:59.971179 [INF] server is ready
[75665] 2016/04/26 15:14:59.971199 [DBG] Trying to connect to route on localhost:4248
[75665] 2016/04/26 15:14:59.971551 [DBG] 127.0.0.1:4248 - rid:1 - Route connection created
[75665] 2016/04/26 15:14:59.971559 [DBG] 127.0.0.1:4248 - rid:1 - Route connect msg sent
[75665] 2016/04/26 15:14:59.971720 [DBG] 127.0.0.1:4248 - rid:1 - Registering remote route "xZfu3u7usAPWkuThomoGzM"
[75665] 2016/04/26 15:14:59.971731 [DBG] 127.0.0.1:4248 - rid:1 - Route sent local subscriptions
```

From the seed's server log, we see that the route is indeed accepted:

```
[75653] 2016/04/26 15:14:59.971602 [DBG] 127.0.0.1:52679 - rid:1 - Route connection created
[75653] 2016/04/26 15:14:59.971733 [DBG] 127.0.0.1:52679 - rid:1 - Registering remote route "53Yi78q96t52QdyyWLKIyE"
[75653] 2016/04/26 15:14:59.971739 [DBG] 127.0.0.1:52679 - rid:1 - Route sent local subscriptions
```

Finally, let's start the third server:

```
gnatsd -p 6222 -cluster nats://localhost:6248 -routes nats://localhost:4248 -D
```

Again, notice that we use a different client port and cluster address, but still point to the same seed server at the address `nats://localhost:4248`:

```
[75764] 2016/04/26 15:19:11.528185 [INF] Listening for route connections on localhost:6248
[75764] 2016/04/26 15:19:11.529787 [INF] Listening for client connections on 0.0.0.0:6222
[75764] 2016/04/26 15:19:11.529829 [DBG] server id is IRepas80TBwJByULX1ulAp
[75764] 2016/04/26 15:19:11.529842 [INF] server is ready
[75764] 2016/04/26 15:19:11.529872 [DBG] Trying to connect to route on localhost:4248
[75764] 2016/04/26 15:19:11.530272 [DBG] 127.0.0.1:4248 - rid:1 - Route connection created
[75764] 2016/04/26 15:19:11.530281 [DBG] 127.0.0.1:4248 - rid:1 - Route connect msg sent
[75764] 2016/04/26 15:19:11.530408 [DBG] 127.0.0.1:4248 - rid:1 - Registering remote route "xZfu3u7usAPWkuThomoGzM"
[75764] 2016/04/26 15:19:11.530414 [DBG] 127.0.0.1:4248 - rid:1 - Route sent local subscriptions
[75764] 2016/04/26 15:19:11.530595 [DBG] 127.0.0.1:52727 - rid:2 - Route connection created
[75764] 2016/04/26 15:19:11.530659 [DBG] 127.0.0.1:52727 - rid:2 - Registering remote route "53Yi78q96t52QdyyWLKIyE"
[75764] 2016/04/26 15:19:11.530664 [DBG] 127.0.0.1:52727 - rid:2 - Route sent local subscriptions
```

First a route is created to the seed server (`...GzM`) and after that, a route from `...IyE` - which is the ID of the second server - is accepted.

The log from the seed server shows that it accepted the route from the third server:

```
[75653] 2016/04/26 15:19:11.530308 [DBG] 127.0.0.1:52726 - rid:2 - Route connection created
[75653] 2016/04/26 15:19:11.530384 [DBG] 127.0.0.1:52726 - rid:2 - Registering remote route "IRepas80TBwJByULX1ulAp"
[75653] 2016/04/26 15:19:11.530389 [DBG] 127.0.0.1:52726 - rid:2 - Route sent local subscriptions
```

And the log from the second server shows that it connected to the third.

```
[75665] 2016/04/26 15:19:11.530469 [DBG] Trying to connect to route on 127.0.0.1:6248
[75665] 2016/04/26 15:19:11.530565 [DBG] 127.0.0.1:6248 - rid:2 - Route connection created
[75665] 2016/04/26 15:19:11.530570 [DBG] 127.0.0.1:6248 - rid:2 - Route connect msg sent
[75665] 2016/04/26 15:19:11.530644 [DBG] 127.0.0.1:6248 - rid:2 - Registering remote route "IRepas80TBwJByULX1ulAp"
[75665] 2016/04/26 15:19:11.530650 [DBG] 127.0.0.1:6248 - rid:2 - Route sent local subscriptions
```

At this point, there is a full mesh cluster of NATS servers.

## Clustering examples using the NATS Server Docker image

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

### Example 2: Setting a gnatsd cluster one by one

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
