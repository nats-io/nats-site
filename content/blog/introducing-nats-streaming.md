# introducing-nats-streaming

+++ categories = \["Engineering"\] date = "2016-07-19" tags = \["nats", "streaming", "microservices"\] title = "Introducing NATS Streaming" author = "Larry McQueary \(NATS Product Manager\)" +++

Wow. It's been a busy summer so far, and it's only half over! As product manager for NATS, this is my first blog post, and fortunately it comes with some great news. In case you missed the announcement at GopherCon 2016 in Denver last week, we just released a major new addition to the NATS family: [NATS Streaming](https://github.com/nats-io/go-nats-streaming).

## Why NATS Streaming?

Since we formed our dedicated NATS team at Apcera in July of last year, the \#1 comment we've received from the user community is something like this: "Wow, we love how easy NATS is to set up and develop with. The performance is amazing. I would totally replace _\(insert name of hard-to-use messaging system\)_ with NATS if only it supported delivery guarantees and/or persistence."

It's a fair observation. NATS was never designed to do those things. Its creator, our founder and Apcera CEO, Derek Collison, conceived NATS as a central nervous system for the cloud control plane, with no requirement for higher QoS guarantees than TCP/IP provides for free. NATS provides distributed queueing and request-reply convenience APIs that enable the end user to easily build their own enhanced QoS and redelivery at the application layer.

Thanks to significant effort from our community manager, Brian Flannery, and the faith and enthusiasm of our user community, NATS usage has expanded well beyond the cloud control plane, into scores of other application types that can benefit from NATS simplicity and performance plus enhanced quality of service.

## What _is_ NATS Streaming?

We gathered the team in Denver 6 months or so ago to figure out how we can introduce enhanced qualities of service without compromising the core tenets of NATS: simplicity, performance, and ease of use. As we walked through the various use cases, we saw the need for the following:

* At-least-once message delivery
  * Message UUIDs with acknowledgements
  * In memory or filesystem-based storage
  * Message redelivery for unacknowledged messages
* Flow control \(rate matching/limiting\)
* Message replay by subject
  * All available messages
  * Last published value
  * All messages since specific sequence number
  * All messages since a specific date/time
* Durable subscribers

These form the core feature set of NATS Streaming. We have approached it as a layered service \(a client\) of NATS, for streaming data/events and any application requiring persistence and delivery guarantees. The NATS Streaming server is a client of NATS that can load an embedded NATS Server at runtime, or connect to an existing NATS server, via configuration or command line options.

![Blog Image](https://github.com/nats-io/nats-site/tree/c42c46a7c6b8669e66e28419887d2f8dd29aa502/img/blog/nats-streaming-architecture.png)

## Try it out!

We value your feedback and stories. Please download the server and client\(s\), and let us know what you think.

The NATS Streaming server and clients are available on our [download page](https://nats.io/download/) and via [GitHub](https://github.com/nats-io/nats-streaming-server).

Want to get involved in the [NATS Community](https://github.com/nats-io/nats-site/tree/c42c46a7c6b8669e66e28419887d2f8dd29aa502/community/README.md) and learn more? We would be happy to hear from you, and answer any questions you may have!

Follow us on Twitter: [@nats\_io](https://twitter.com/nats_io)

