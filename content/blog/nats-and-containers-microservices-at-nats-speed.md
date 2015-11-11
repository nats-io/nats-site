+++
categories = ["Engineering"]
date = "2015-11-06T11:39:53-08:00"
tags = ["microservices", "containers", "nats", "docker"]
title = "NATS and Containers: Microservices at NATS Speed"

+++

NATS is all about simplicity and speed. In that regard, NATS is extremely well suited for microservices architectures, acting as a transport between services. Many NATS users I speak to in my role as community manager are using NATS for this purpose due to it’s lightweight PubSub characteristics. A large portion of these same NATS users are also using Docker for their containerized services. As services become increasingly distributed and modularized, an always-on, fast, PubSub communication layer becomes very important.

NATS has integrated with Docker for some time. The original gnatsd Docker image was downloaded nearly a quarter-of-a-million times. Earlier this year, when Docker launched their Official Image program, and re-launched Docker Hub, the NATS team at Apcera updated the [NATS Docker Image](https://hub.docker.com/_/nats/), and were approved for Docker Official Image Status.

In staying true to roots of NATS, the NATS Docker image is very lightweight and simple. This was well illustrated in a tweet recently from David Williams:
<div class="tweet-embed-con">
  <blockquote class="twitter-tweet" data-conversation="none" lang="en"><p lang="en" dir="ltr"><a href="https://twitter.com/jdsboston">@jdsboston</a> <a href="https://twitter.com/brianflannery">@brianflannery</a> Layers how simple NATS image is: a Go binary, config file, and Docker params: <a href="https://t.co/lHBVSraTJb">https://t.co/lHBVSraTJb</a></p>&mdash; David Williams (@DavWilliams) <a href="https://twitter.com/DavWilliams/status/653754289123266560">October 13, 2015</a></blockquote>
  <script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>
</div>

If you’re not familiar with David, he gave an excellent talk on NATS at the meetup in August in San Francisco: Powered by NATS: Integration Patterns for Microservices Architectures.

Another recent update in the NATS container space is related to Red Hat. NATS was recently certified by Red Hat as a Technical Partner.  Thanks to the official NATS docker image lightweight design, it is straightforward to run it within a Docker container which [starts](https://github.com/wallyqs/nats-docker/blob/rhel/Dockerfile) `FROM rhel`.

<img class="img-responsive" alt="NATS Docker on redhat" src="/img/blog/nats-docker-on-redhat.png">

We’re excited to be partnering with the leading Open Source company - Red Hat - to provide the ability to run NATS together with RHEL and Docker.
