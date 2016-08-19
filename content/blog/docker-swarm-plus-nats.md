+++
categories = ["Engineering"]
date = "2016-08-22"
tags = ["docker", "nats", "microservices"]
title = "Building a Microservices Control Plane using NATS and Docker Engine v1.12"
author = "Wally Quevedo"
+++

For those of you who might have read the previous post I did on [Docker + NATS for Microservices](http://nats.io/blog/docker-compose-plus-nats/), you’ll recall we took an in-depth look at using Docker Compose with NATS.

That blog post was done a few days prior to DockerCon, and as expected Docker made many interesting announcements at DockerCon. One of the main things announced [that week](https://blog.docker.com/2016/06/dockercon-2016-just-wow/) was Docker 1.12.

1.12 includes [Swarm mode](https://docs.docker.com/engine/swarm/) which can be used for assembling a cluster of Docker Engines and running workloads on them.

In this blog post, we share a basic example of how showing some of these new features available in Docker 1.12 to bring up a NATS cluster that our clients running can then connect against.

- Requirements
  + Docker Engine 1.12
  + Docker Swarm cluster prepared with a manager and at least a couple of workers https://docs.docker.com/engine/swarm/
  + Latest release of the NATS Server, which supports cluster auto-discovery for clients. This way, if we add more nodes to the cluster the clients become aware of the full topology dynamically. Awesome stuff!

### Step 1

  We will first need to create an overlay network for the cluster, here named `nats-cluster-example`, along with an initial NATS server using latest Docker:

  ```
  docker network create --driver overlay nats-cluster-example

  docker service create --network nats-cluster-example \
                             --name nats-cluster-node-1 nats:0.9.4 -DV
  ```

### Step 2

  Next, we confirm which node of the Docker Swarm NATS Server ended up running on, and confirm its IP:

```
  docker service ps nats-cluster-node-1
  ID                         NAME                   IMAGE       NODE    DESIRED STATE  CURRENT STATE           ERROR
  b81qv4ljs7g7b52vmnlojktug  nats-cluster-node-1.1  nats:0.9.4  node-2  Running        Running 32 seconds ago

  docker network inspect nats-cluster-example
```

```json
  [
      {
          "Name": "nats-cluster-example",
          "Id": "944z42rg2hjwgsv9xubmomvi5",
          "Scope": "swarm",
          "Driver": "overlay",
          "EnableIPv6": false,
          "IPAM": {
              "Driver": "default",
              "Options": null,
              "Config": [
                  {
                      "Subnet": "10.0.1.0/24",
                      "Gateway": "10.0.1.1"
                  }
              ]
          },
          "Internal": false,
          "Containers": {
              "e0d105ed7703aa5de939861f75087671c96128fbe799bf6ba38cd15c55aaef07": {
                  "Name": "nats-cluster-node-1.1.0j0wde7hbqn735eqgpslkxowf",
                  "EndpointID": "e798782eaac9bbd36decf3c6e5defd56faa88a3c7a09df608ffd1f2ce1969ed8",
                  "MacAddress": "02:42:0a:00:01:03",
                  "IPv4Address": "10.0.1.3/24",
                  "IPv6Address": ""
              }
          },
          "Options": {
              "com.docker.network.driver.overlay.vxlanid_list": "258"
          },
          "Labels": {}
      }
  ]
```

  On node-2 of the Docker Swarm, notice that the NATS server is now running:

  ```
  docker logs e0b4d7b2f7f3
  [1] 2016/08/15 11:31:41.680139 [INF] Starting nats-server version 0.9.4
  [1] 2016/08/15 11:31:41.680217 [DBG] Go build version go1.6.3
  [1] 2016/08/15 11:31:41.680259 [INF] Starting http monitor on 0.0.0.0:8222
  [1] 2016/08/15 11:31:41.680348 [INF] Listening for client connections on 0.0.0.0:4222
  [1] 2016/08/15 11:31:41.680377 [DBG] Server id is JngwpOevXl1rhAovFO8Su6
  [1] 2016/08/15 11:31:41.680386 [INF] Server is ready
  [1] 2016/08/15 11:31:41.680731 [INF] Listening for route connections on 0.0.0.0:6222
```

  ### Step 3

  Next, we will create another service which connects to this server within the overlay network; note that we have an initial IP for connecting to the server:

  ```ruby
  docker service create --name ruby-nats --network nats-cluster-example wallyqs/ruby-nats:ruby-2.3.1-nats-v0.8.0 -e '
    NATS.on_error do |e|
      puts "ERROR: #{e}"
    end
    NATS.start(:servers => ["nats://10.0.1.3:4222"]) do |nc|
      inbox = NATS.create_inbox
      puts "[#{Time.now}] Connected to NATS at #{nc.connected_server}, inbox: #{inbox}"

      nc.subscribe(inbox) do |msg, reply|
        puts "[#{Time.now}] Received reply - #{msg}"
      end

      nc.subscribe("hello") do |msg, reply|
        next if reply == inbox
        puts "[#{Time.now}] Received greeting - #{msg} - #{reply}"
        nc.publish(reply, "world")
      end

      EM.add_periodic_timer(1) do
        puts "[#{Time.now}] Saying hi (servers in pool: #{nc.server_pool}"
        nc.publish("hello", "hi", inbox)
      end
    end
  '
```
### Step 4

Now we are ready to add more nodes to the cluster via more `docker services`:

```
docker service create --network nats-cluster-example \
			   --name nats-cluster-node-2 nats:0.9.4 -DV -cluster nats://0.0.0.0:6222 -routes nats://10.0.1.3:6222
```

Add in more replicas of the subscriber:

```
docker service scale ruby-nats=3
```

Then confirm the distribution on our Docker Swarm cluster:

```
docker service ps ruby-nats
ID                         NAME         IMAGE                                     NODE    DESIRED STATE  CURRENT STATE          ERROR
25skxso8honyhuznu15e4989m  ruby-nats.1  wallyqs/ruby-nats:ruby-2.3.1-nats-v0.8.0  node-1  Running        Running 2 minutes ago  
0017lut0u3wj153yvp0uxr8yo  ruby-nats.2  wallyqs/ruby-nats:ruby-2.3.1-nats-v0.8.0  node-1  Running        Running 2 minutes ago  
2sxl8rw6vm99x622efbdmkb96  ruby-nats.3  wallyqs/ruby-nats:ruby-2.3.1-nats-v0.8.0  node-2  Running        Running 2 minutes ago  
```

The sample output after adding more NATS server nodes to the cluster, is below - and notice that the client is dynamically aware of more nodes being part of the cluster via auto discovery!:

```
[2016-08-15 12:51:52 +0000] Saying hi (servers in pool: [{:uri=>#<URI::Generic nats://10.0.1.3:4222>, :was_connected=>true, :reconnect_attempts=>0}]
[2016-08-15 12:51:53 +0000] Saying hi (servers in pool: [{:uri=>#<URI::Generic nats://10.0.1.3:4222>, :was_connected=>true, :reconnect_attempts=>0}]
[2016-08-15 12:51:54 +0000] Saying hi (servers in pool: [{:uri=>#<URI::Generic nats://10.0.1.3:4222>, :was_connected=>true, :reconnect_attempts=>0}]
[2016-08-15 12:51:55 +0000] Saying hi (servers in pool: [{:uri=>#<URI::Generic nats://10.0.1.3:4222>, :was_connected=>true, :reconnect_attempts=>0}, {:uri=>#<URI::Generic nats://10.0.1.7:4222>, :reconnect_attempts=>0}, {:uri=>#<URI::Generic nats://10.0.1.6:4222>, :reconnect_attempts=>0}]
```

Sample output after adding more workers which can reply back (since ignoring own responses):

```
[2016-08-15 16:06:26 +0000] Received reply - world
[2016-08-15 16:06:26 +0000] Received reply - world
[2016-08-15 16:06:27 +0000] Received greeting - hi - _INBOX.b8d8c01753d78e562e4dc561f1
[2016-08-15 16:06:27 +0000] Received greeting - hi - _INBOX.4c35d18701979f8c8ed7e5f6ea
```

## Conclusion


Built-in Docker Swarm mode in Docker Engine can be very handy for deploying a distributed system where NATS is being used for handling the internal communication among components via an overlay network, and external communication is being exposed through a load balancer. This in combination with the cluster discovery features from latest NATS releases make microservices operations a breeze, and incredibly flexible and scalable.

Want to get involved in the NATS Community and learn more? We would be happy to hear from you, and answer any questions you may have!

Follow us on Twitter: [@nats_io](https://twitter.com/nats_io)
