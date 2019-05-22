# nats-for-the-marionette-collective

+++ categories = \["Community", "Engineering"\] date = "2017-03-23" tags = \["nats", "guest post", "ruby", "puppet", "scalable", "orchestration"\] title = "Guest Post: NATS for The Marionette Collective" author = "R.I. Pienaar" +++

My name is R.I. Pienaar, I'm a freelance DevOps architect. I designed and wrote a tool called The Marionette Collective, now owned by Puppet Inc. I maintain a blog at [devco.net](https://www.devco.net/) and you can follow me on twitter at [@ripienaar](https://twitter.com/ripienaar).

I'd like to thank NATS team for reaching out and giving me the opportunity to talk about our use of [NATS](http://www.nats.io/) in a new project called [Choria](http://choria.io/) that upgrades The Marionette Collective for a more modern environment.

## Quick Intro to The Marionette Collective

The Marionette Collective - more commonly known as MCollective - is now quite an old orchestration system that exists in the world of ad hoc systems administration frameworks and compliments Puppet.

Its main strength is in creating an API that is addressable in parallel across thousands of machines. It wraps traditional Unix commands and APIs and makes them accessible.

MCollective has a very strong focus on security, featuring a full Authentication, Authorization and Auditing framework. It runs on RedHat, CentOS, Oracle Linux, SUSE, Ubuntu, Debian, Solaris, Windows, OS X and AIX via the Puppet provided puppet-agent package.

As an example use case, let’s say we wish to restart httpd on all machines in the UK belonging to a particular customer. This might look like:

```text
$ mco service restart httpd -W country=uk -W customer=acme

 * [ ============================================================> ] 15 / 15


Summary of Service Status:

   running = 15


Finished processing 15 / 15 hosts in 8352.48 ms
```

Here the filters `country=uk` and `customer=acme` are facts known to Puppet, and requests are done in parallel across a middleware rather than the more common SSH based approach.

We communicate with a service agent with actions stop, start, restart and status in a similar manner to other RPC systems. As there is a RPC framework underneath, the same CLI command can be run in Ruby using something like the code below, subject to the same AAA as the CLI:

```ruby
client = rpcclient("service")
client.fact_filter("country", "uk")
client.fact_filter("customer", "acme")
client.restart(:service => "httpd")
```

## The Choria Project

MCollective has been a bit neglected by its owners but as it's an open source framework and extremely pluggable, I set out to address the very significant getting started hurdles with a new project called [Choria](http://choria.io/).

Choria is a set of plugins that creates some high level features but also replaces the Security and Connectivity layers. The Connectivity part is where NATS comes in and what I'll focus on in this article.

Using Choria people can be up and running with MCollective from nothing to a fully secure, fully clustered collective in less than half an hour -- quite an improvement over the previous status of many many days to achieve the same!

## Connectivity in MCollective

MCollective has traditionally been used with ActiveMQ and RabbitMQ, but has also been known to work over SQS, SSH, 0MQ and crazy things like SMTP, via its very versatile plugin system.

The choice of Middleware has historically been a major barrier to adoption. These tools tend to be very heavy and complex with high administration overhead.

Many MCollective users ultimately stopped using it due to the middleware pains. In designing the Choria project, I knew that if I really wanted to address the usability issue, I'd need to find a new middleware of choice.

My criteria therefore were:

* Easy to deploy and configure
* High quality operability features such as monitoring insight
* Good documentation and responsive community
* Low overhead and low dependencies. It makes no sense to require Zookeeper or similar to achieve clustering
* Client libraries in many languages but requiring solid Ruby libraries as a primary concern
* Supports common 1:1 and 1:n patterns of message delivery
* Websockets if possible

## Choosing NATS

As it's been almost a decade since my previous de facto choice was made, I evaluated a number of options and [NATS](http://www.nats.io/) came out tops in all cases.

It's really easy to deploy and configure being a single binary. The only thing that may have made things any easier for us is the fact that NATS is not distributed in common Linux package formats \(i.e. .deb, rpm\). But, this is something being [worked on](https://github.com/nats-io/gnatsd/issues/404) by the NATS team. In today’s container driven world this is generally not a problem, but MCollective has an enterprise target audience and this kind of thing matters to them.

From an operability perspective, NATS is a dream. It's very easy to configure, with an easy to read config file. You do not even need a configuration file to configure entire clusters--it's that easy. It provides simple HTTP based endpoints to extract lots of monitoring information and it's easy to plug into tools like `collectd`.

Documentation is generally very good. I'd say I've seen better, but I have also seen significantly worse - in the Open Source world the NATS Documentation stands out in my mind as a really good example.

MCollective users have reported comfortably managing more than 2,000 servers using a single NATS server and of course NATS is easy to cluster for availability. While serving 2,000 nodes, it was reported to only use 300MB RAM-quite an improvement over our previous usage patterns!

The NATS team maintain a number of their own client libraries and provide architecture hints on how to write more, and there are quite a few community provided clients. There tends to be a high level of implementation parity between the client libraries, making switching languages easy. For Ruby there was just an EM client but now there's a [Pure Ruby](http://nats.io/download/nats-io/pure-ruby-nats/) one that's maturing nicely thanks to the responsive authors.

While NATS provides no built-in WebSocket interface, of the options I considered it was by far the best for my needs, and presumably some bridge can be created in the long run \(as illustrated by a community member [here](https://www.npmjs.com/package/websocket-nats)\).

## Future Needs

By default MCollective operates in a fire and forget mode. This is a very good match with NATS Server’s stateless, best effort \(non-guaranteed\) delivery model, therefore, the two combine well.

MCollective does have another mode, one suitable to REST servers where you'd like to build a more resilient mode of communication, one that is long running on the client side and resilient to network interruptions and upgrades on the middleware. NATS on its own is not suited to this scenario.

The NATS team built a new product called NATS Streaming that adds a persistence layer atop NATS. This tool is perfect for the needs of MCollective in this REST compatible mode. The team gave me early access to the GitHub repository to evaluate it, and having this early access really helped me cement my choice in NATS.

[NATS Streaming](https://github.com/nats-io/nats-site/tree/c42c46a7c6b8669e66e28419887d2f8dd29aa502/documentation/streaming/nats-streaming-intro/README.md) is quite young. Once it supports clustering Choria will for sure adopt it as an option.

## Conclusion

So far I've been very happy with the choice to move to NATS and it has met all my requirements. More important for the Choria community, every user I've spoken with has been happy with this choice and it has really helped me drive adoption.

NATS is light, fast, well documented and easy to use. You should consider it for your projects too.

