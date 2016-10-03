+++
categories = ["Engineering"]
date = "2016-06-20"
tags = ["docker", "nats", "microservices"]
title = "Docker Compose + NATS: Microservices Development Made Easy"
author = "Wally Quevedo"
+++

Buzzwords are everywhere in our industry. "Microservices", "Serverless computing", "Nanoservices", "Containerized" - you could fill a whole blog post just with these overused phrases. If you cut through the terminology flavor of the month, there are some very important common thread for application developers. One is simplicity. Regardless of what architectural approach you're using - and what you may or may not refer to it as - you want it just work. You don't want to spend days trying getting various pieces of your infrastructure up and running. Another important need is performance at scale. This requires both low latency and high throughput. Fast solutions are great - but they are not much good if they cannot scale up to meet demands of users. Low latency solutions are nice, but what good is low resource utilization without speed?

Simplicity and performance are even more important to keep in mind when your infrastructure runs Docker containers. The whole point of using containers in the first place is to have a decoupled, scalable, dependency free set of services that just work. Why use a messaging layer that isn't designed for cloud or containers? Enter NATS.

The [NATS Docker Image](https://hub.docker.com/_/nats/) is incredibly simple, and has a very lightweight footprint. Imagelayers.io is a great tool by Centurylink to scan various Docker Containers and report back on the various 'layers' (components within the Dockerfile, and size). See below for a comparison of NATS to a few other messaging systems:

<div class="tweet-embed-con">
  <blockquote class="twitter-tweet" data-conversation="none" data-lang="en"><p lang="en" dir="ltr"><a href="https://twitter.com/jdsboston">@jdsboston</a> <a href="https://twitter.com/brianflannery">@brianflannery</a> Layers how simple NATS image is: a Go binary, config file, and Docker params: <a href="https://t.co/lHBVSraTJb">https://t.co/lHBVSraTJb</a></p>— David Williams (@DavWilliams) <a href="https://twitter.com/DavWilliams/status/653754289123266560">October 13, 2015</a></blockquote>
  <script async="" src="//platform.twitter.com/widgets.js" charset="utf-8">
</script>
</div>

At just a few MB, and handful of layers, you can keep your Docker environment lean and scalable; you won't even notice NATS is running on your container. As NATS has no external dependencies, and is simple plain-text messaging protocol - regardless of what your current or future infrastructure may look like NATS just works.

The simplicity of containers is perfectly aligned with the simplicity of NATS, but what about scale? If you're looking to have a bunch of decoupled services functioning in real-time NATS is a great option. Various 3rd party benchmarks have shown a single NATS Server capable of sending 11-12 million messages.

Now, onto the fun stuff!

# Docker Compose + NATS

Full example: <https://gist.github.com/wallyqs/7f72efdc3fd6371364f8b28cbe32c5ee>

In this basic example we will have a simple NATS based microservice setup, consisting of:

- An HTTP API external users of the service can make requests against
- A worker which processes the tasks being dispatched by the API server

The frontend HTTP API exposes a '/createTask' to which we can send a requests and receive a response. Internally, the server will send a NATS request to the "tasks" subject and wait for a response from a worker which is subscribed to that subject to reply back once it has finished processing the request (or timeout, in case the response does not come back after 5 seconds).

For this example the server looks like:

```javascript
package main

import (
  "fmt"
  "log"
  "net/http"
  "os"
  "time"

  "github.com/nats-io/nats"
)

type server struct {
  nc *nats.Conn
}

func (s server) baseRoot(w http.ResponseWriter, r *http.Request) {
  fmt.Fprintln(w, "Basic NATS based microservice example v0.0.1")
}

func (s server) createTask(w http.ResponseWriter, r *http.Request) {
  requestAt := time.Now()
  response, err := s.nc.Request("tasks", []byte("help please"), 5*time.Second)
  if err != nil {
    log.Println("Error making NATS request:", err)
  }
  duration := time.Since(requestAt)

  fmt.Fprintf(w, "Task scheduled in %+v\nResponse: %v\n", duration, string(response.Data))
}

func (s server) healthz(w http.ResponseWriter, r *http.Request) {
  fmt.Fprintln(w, "OK")
}

func main() {
  var s server
  var err error
  uri := os.Getenv("NATS_URI")

  for i := 0; i < 5; i++ {
    nc, err := nats.Connect(uri)
    if err == nil {
      s.nc = nc
      break
    }

    fmt.Println("Waiting before connecting to NATS at:", uri)
    time.Sleep(1 * time.Second)
  }
  if err != nil {
    log.Fatal("Error establishing connection to NATS:", err)
  }

  fmt.Println("Connected to NATS at:", s.nc.ConnectedUrl())
  http.HandleFunc("/", s.baseRoot)
  http.HandleFunc("/createTask", s.createTask)
  http.HandleFunc("/healthz", s.healthz)

  fmt.Println("Server listening on port 8080...")
  if err := http.ListenAndServe(":8080", nil); err != nil {
    log.Fatal(err)
  }
}
```

And the worker processing subscribed to NATS which will be processing the requests looks like:

```go
package main

import (
  "fmt"
  "log"
  "net/http"
  "os"
  "time"

  "github.com/nats-io/nats"
)

func healthz(w http.ResponseWriter, r *http.Request) {
  fmt.Println(w, "OK")
}

func main() {
  uri := os.Getenv("NATS_URI")
  var err error
  var nc *nats.Conn

  for i := 0; i < 5; i++ {
    nc, err = nats.Connect(uri)
    if err == nil {
      break
    }

    fmt.Println("Waiting before connecting to NATS at:", uri)
    time.Sleep(1 * time.Second)
  }
  if err != nil {
    log.Fatal("Error establishing connection to NATS:", err)
  }
  fmt.Println("Connected to NATS at:", nc.ConnectedUrl())
  nc.Subscribe("tasks", func(m *nats.Msg) {
    fmt.Println("Got task request on:", m.Subject)
    nc.Publish(m.Reply, []byte("Done!"))
  })

  fmt.Println("Worker subscribed to 'tasks' for processing requests...")
  fmt.Println("Server listening on port 8181...")

  http.HandleFunc("/healthz", healthz)
  if err := http.ListenAndServe(":8181", nil); err != nil {
    log.Fatal(err)
  }
}

```

Let’s say that both of these workloads have their own set of dependencies, so our directory structure may look like something like the below. The only dependency then is the NATS client itself.

Code examples for api-server.go and worker.go are here: [https://gist.github.com/wallyqs/7f72efdc3fd6371364f8b28cbe32c5ee](https://gist.github.com/wallyqs/7f72efdc3fd6371364f8b28cbe32c5ee)

![Blog Image](/img/blog/docker-compose-plus-nats/work-and-server-examples.png "Blog Image")

**First**, in our Docker Compose file (build.yml), we will declare how to build our dev setup and have it run as containers managed by the Docker engine:

```yaml
version: "2"

services:
  nats:
    image: 'nats:0.8.0'
    entrypoint: "/gnatsd -DV"
    expose:
      - "4222"
    ports:
      - "8222:8222"
    hostname: nats-server
  api:
    build:
      context: "./api"
    entrypoint: /go/api-server
    links:
      - nats
    environment:
      - "NATS_URI=nats://nats:4222"
    depends_on:
      - nats
    ports:
      - "8080:8080"
  worker:
    build:
      context: "./worker"
    entrypoint: /go/worker
    links:
      - nats
    environment:
      - "NATS_URI=nats://nats:4222"
    depends_on:
      - nats
    ports:
      - "8181:8181"
```

**Next**, we use `docker-compose -f build.ym build` to first create our containers:

[![Blog Image](/img/blog/docker-compose-plus-nats/docker-compose-build.png "Blog Image")](/img/blog/docker-compose-plus-nats/docker-compose-build.png)

**Then**, we start our services with docker-compose up:

[![Blog Image](/img/blog/docker-compose-plus-nats/docker-compose-start-services.png "Blog Image")](/img/blog/docker-compose-plus-nats/docker-compose-start-services.png)

In this example, we have the API server expose a `/createTask` route, and doing a quick smoke test by sending a request with curl to confirm that requests are flowing through NATS:

[![Blog Image](/img/blog/docker-compose-plus-nats/api-route-create-task.png "Blog Image")](/img/blog/docker-compose-plus-nats/api-route-create-task.png)

**And** since we are using -DV in order to activate trace and debugging in the NATS server we can also confirm the traffic.

**NOTE**: This is ok for a dev/test environment (and for the purposes of this example) but not recommended for production, as it impacts performance.

[![Blog Image](/img/blog/docker-compose-plus-nats/comfirm-traffic.png "Blog Image")](/img/blog/docker-compose-plus-nats/comfirm-traffic.png)

So! There you have it. A quick example showing how simple NATS is. NATS - much like containers themselves - is all about simplicity and scalability.

NATS and Docker - a perfect match.

Want to get involved in the NATS Community and learn more? We would be happy to hear from you, and answer any questions you may have!

Follow us on Twitter: [@nats_io](https://twitter.com/nats_io)
