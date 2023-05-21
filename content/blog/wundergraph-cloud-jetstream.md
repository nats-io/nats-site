+++
date = "2023-02-01"
draft = false
title = "WunderGraph Cloud and JetStream"
author = "Dustin Deus"
categories = ["Engineering","JetStream"]
tags = ["NATS"]
+++

## WunderGraph

At WunderGraph, we're building an infra-less cloud for developers, meaning that we free developers from dealing with infrastructure. We believe a developer doesn't need to be proficient in deploying and maintaining infrastructure to build a global SaaS.

WunderGraph is here to make our life easier (We use WunderGraph to build [WunderGraph Cloud](https://wundergraph.com/)). It allows you to integrate data sources of different types like REST, GraphQL, and Databases into a unified representation (the Virtual Graph) to make the work with your API dependencies a pleasant experience.

Due to this architecture, we can auto-generate optimized clients for different platforms and programming languages, and core features like authentication, authorization, and caching come out of the box. So focus on writing your business logic rather than plumbing.

Deploying a gateway in a scalable and reliable way and providing the tools to operate it is a complex task. We want to make this task as easy as possible for our customers. Therefore, we're building WunderGraph Cloud. It's a managed service that allows you to deploy, build and manage a fully customizable Serverless gateway worldwide in minutes. Serverless, in this regard, means that you're not paying for the service when you're not using it. WunderGraph is optimized for cold starts and high performance, allowing you to pay Serverless prices while getting a Serverfull experience.

## The DNS problem

<img class="img-responsive center-block" src="/img/blog/wundergraph-cloud-jetstream/before.png" title="before" alt="" height="400" width="600"> <figcaption>Fig.1 Before</figcaption>

Deploying WunderNodes across the globe sounds like a challenging problem if you need to solve it independently. Luckily, we rely on the right infrastructure partner to achieve this in a few HTTP calls.
From a high-level perspective, a WunderNode is a VM in an isolated network that is carefully exposed to the internet. Initially, we used Cloudflare Workers to route user requests to the correct public IPv4 address. All data was stored in the eventually consistent Cloudflare KV Store. With this approach, we constantly ran into DNS propagation issues because every new Ipv4 address must be allocated and distributed across the world. Additionally, the shortage of IPv4 addresses made us rethink our architecture.

## The solution: JetStream as a Global Distributed Key/Value Store

Say "Hi" to "Heimdall". It's our custom edge proxy deployed to all our point-of-presences (POPs). It's responsible for managing the host->IP routing and serving as the source of truth for our analytic warehouse. We also no longer rely on public IPv4 addresses. Instead, we use private IPv6 addresses within our [BGP Anycast](https://en.wikipedia.org/wiki/Anycast) network. Every app is isolated from the others and only Heimdall is exposed to the internet. This allows us to scale our network to an unlimited number of apps without running into any IP address limitations.

<img class="img-responsive center-block" src="/img/blog/wundergraph-cloud-jetstream/after.png" alt="" height="400" width="600"><figcaption>Fig.2 After with NATS JetStream</figcaption>

When a new app is provisioned on WunderGraph Cloud, we need a reliable way to store the host->IP mapping and propagate the change to all global Heimdall instances. After experimenting with different solutions, we used [NATS JetStream](https://docs.nats.io/nats-concepts/jetstream) as our distributed Key/Value store.

It's a perfect fit for our use case. The Key/value store is consistent, highly available, and horizontally scalable. In addition, JetStream allows us to watch changes, so a Heimdall instance can be notified about a change and update its routing table. After a restart, it will load the latest state from JetStream into its memory. In practice, we distribute updates in less than a second across the globe.

Besides the functionality, we also enjoy the quality of the NATS ecosystem. The Golang client is actively maintained, and the interface is [well-designed](https://twitter.com/dustindeus/status/1613203957857361920).

Therefore, JetStream is also an excellent fit for the rest of our architecture. We want to use JetStream for more than just storing the routing table. NATS & JetStream will be the backbone of a few other services we plan to offer.

In the future, WunderGraph Cloud will provide you type-safe APIs to enable the following use cases:

- Key/Value storage to persistent data across requests.
- Pub/Sub functionality between WunderGraph functions.
- A temporal like experience to implement workflows reliably.
- And so much more...

In summary, we're very excited about JetStream and its possibilities. As an early adopter, we're happy to share our experience and learnings with the community.
If you're interested in helping us solve some of the challenges ahead, feel free to reach out to us. [We're hiring!](https://wundergraph.com/jobs)

## About the Author

Dustin Deus is Co-Founder & Tech-Lead working at [WunderGraph](https://wundergraph.com/). He is passionate about web, distributed systems and infrastructure. He is also a Open Source enthusiast and loves to share his knowledge with the community. You can find him on [Twitter](https://twitter.com/dustindeus) or [GitHub](https://github.com/StarpTech).
