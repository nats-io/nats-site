+++
date = "2017-09-07"
title = "Using NATS with Docker Swarm"
description = ""
category = "tutorials"
[menu.main]
  name = "Using NATS with Docker Swarm"
  weight = 4
  identifier = "tutorial-nats-docker-swarm"
  parent = "Tutorials"
+++

# Using NATS with Docker Swarm

# Step 1:
Create and overlay network for the cluster (in this example, `nats-cluster-example`), and instantiate an initial NATS server.

First create an overlay network:
```
docker network create --driver overlay nats-cluster-example
```

Next instantiate an initial "seed" server for a NATS cluster:
```
docker service create --network nats-cluster-example --name nats-cluster-node-1 nats:1.0 -DV
```

# Step 2:
The 2nd step is to create another service which connects to the NATS server within the overlay network.  Note that we have an initial IP for connecting to the server:

```
docker service create --name ruby-nats --network nats-cluster-example wallyqs/ruby-nats:ruby-2.3.1-nats-v1.0 -e '
  NATS.on_error do |e|
    puts "ERROR: #{e}"
  end
  NATS.start(:servers => ["nats://nats-A:4222"]) do |nc|
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
  end'
```

# Step 3:
Now you can add more nodes to the Swarm cluster via more docker services:

```
docker service create --network nats-cluster-example --name nats-cluster-node-2 nats:1.0 -DV -cluster nats://0.0.0.0:6222 -routes nats-A
```

In this case, `nats-A` is seeding the rest of the cluster so that it has autodiscovery.

Add in more replicas of the subscriber:

`docker service scale ruby-nats=3`

Then confirm the distribution on the Docker Swarm cluster:

```
docker service ps ruby-nats
ID                         NAME         IMAGE                                     NODE    DESIRED STATE  CURRENT STATE          ERROR
25skxso8honyhuznu15e4989m  ruby-nats.1  wallyqs/ruby-nats:ruby-2.3.1-nats-v0.8.0  node-1  Running        Running 2 minutes ago  
0017lut0u3wj153yvp0uxr8yo  ruby-nats.2  wallyqs/ruby-nats:ruby-2.3.1-nats-v0.8.0  node-1  Running        Running 2 minutes ago  
2sxl8rw6vm99x622efbdmkb96  ruby-nats.3  wallyqs/ruby-nats:ruby-2.3.1-nats-v0.8.0  node-2  Running        Running 2 minutes ago
```

The sample output after adding more NATS server nodes to the cluster, is below - and notice that the client is *dynamically* aware of more nodes being part of the cluster via auto discovery!:

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
