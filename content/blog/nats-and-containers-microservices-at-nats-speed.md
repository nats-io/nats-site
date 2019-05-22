# nats-and-containers-microservices-at-nats-speed

+++ categories = \["Engineering","Community"\] date = "2015-12-11T11:39:53-08:00" tags = \["microservices", "containers", "nats", "docker"\] title = "NATS and Containers: Microservices at NATS Speed" author = "Brian Flannery" +++

NATS is all about simplicity and speed. In that regard, NATS is extremely well suited for microservices architectures, acting as a transport between services. Many NATS users I speak to in my role as community manager are using NATS for this purpose due to it’s lightweight PubSub characteristics. As services become increasingly distributed and modularized, an always-on, fast, PubSub communication layer becomes very important. NATS allows many distributed services and applications to function in real-time as a single entity. A large portion of these same NATS users are also using Docker for their containerized services.

NATS has integrated with Docker for some time—the original gnatsd Docker image was downloaded nearly a quarter-of-a-million times. Earlier this year, when Docker launched their Official Image program, and re-launched Docker Hub, the NATS team at Synadia updated the [NATS Docker Image](https://hub.docker.com/_/nats/), and were approved for Docker Official Image Status.

In staying true to the NATS design philosophy, the NATS Docker image is very lightweight and simple. This was well illustrated in a tweet recently from David Williams:

> [@jdsboston](https://twitter.com/jdsboston) [@brianflannery](https://twitter.com/brianflannery) Layers how simple NATS image is: a Go binary, config file, and Docker params: [https://t.co/lHBVSraTJb](https://t.co/lHBVSraTJb)— David Williams \(@DavWilliams\) [October 13, 2015](https://twitter.com/DavWilliams/status/653754289123266560)

If you’re not familiar with David, he gave an excellent talk on NATS at the meetup in August in San Francisco: Powered by NATS: Integration Patterns for Microservices Architectures.

Another recent update in the NATS container space is around Red Hat. Apcera, the corporate steward of NATS, was recently certified by Red Hat as a Technical Partner in their Container Zone, because NATS can run on RHEL. Here is an example of NATS running within a Docker container which [starts](https://github.com/wallyqs/nats-docker/blob/rhel/Dockerfile) `FROM rhel`.

![NATS Docker on redhat](https://github.com/nats-io/nats-site/tree/c42c46a7c6b8669e66e28419887d2f8dd29aa502/img/blog/nats-docker-on-redhat.png)

We’re excited to be partnering with leading open source companies like Red Hat and Docker to maintain the simplicity of using NATS in many different scenarios.

There’s some exciting updates to gnatsd which were recently [made available](https://github.com/nats-io/gnatsd) on GitHub, and the team also recently added TLS support to a variety of clients inclduing\(eg. Go, Ruby, Node.js, C\). We’re constantly tuning NATS together with leaders in the open source community to provide a fast, simple, and secure way for you to scale your microservices architecture.

Give NATS a try, and let us know what you think in our Google Group or Slack Community, which you can find on our [Community](http://nats.io/community/) Page!

