+++
date = "2024-01-22"
draft = false
title = "Introducing the NATS Execution Engine"
author = "Kevin Hoffman"
categories = ["Engineering"]
tags = ["NATS", "functions", "nex", "JavaScript", "WebAssembly", "microservices"]
+++

As people continue to leverage their NATS infrastructure by increasing the number of apps and services that rely on NATS, we tend to see some common patterns emerge. People end up with two different views of their infrastructure: the NATS connectivity map and the cluster-style resource views that come from their workload scheduler(s).

With so many distributed applications, the infrastructure and connectivity is in place to support NATS and NATS-based applications, but is often underutilized. There's so much more that NATS can enable.

Wouldn't it be fantastic if we could leverage our existing investment in NATS to deploy and manage our applications as well? Rather than having many different perspectives and tools for the same environment, we can double-down on NATS to not only connect our applications, but to _run them_ as well.

We are incredibly excited to announce our newest experimental tech preview product, the **[NATS Execution Engine](https://github.com/connecteverything/nex)**, or just **Nex** for short.

Nex is designed and built with developer experience as the highest priority. All too often, systems that provide a convenient way to deploy applications come with a pile of mandatory dependencies or required SDKs and tooling. With Nex, we want you to be able to deploy your existing NATS-based services with little or no change, and be able to deploy functions directly to your NATS environments.

You can deploy virtually any kind of workload with Nex, which generalizes into two categories:

* **Functions** - These are short-lived, on-demand units of compute that are triggered by some stimulus and return some value. You see this category everywhere, including CloudFlare Workers, AWS Lambda, Azure Functions, Google Cloud Functions, and more.
* **Services** - Long-running units of compute that start, provide some service, and don't stop until explicitly told to stop via a control plane. Common types of services are applications deployed directly to virtual machines or containers that run in Kubernetes or other runtimes.

With Nex, you can deploy _zero dependency_ **JavaScript** and **WebAssembly** functions as well as native, 64-bit Linux statically compiled services. All of these deployments can be monitored, interrogated, and controlled through the same unified interface. We're even exploring initial support for OCI containers.

If you're at all curious about Nex, check out our [announcement and live demo](https://www.youtube.com/watch?v=EfxtiKMnoyQ&list=PLgqCaaYodvKZfOFK3MMk5YnSO0cNj-QuQ&index=9) from Rethink Conn 2024 to see it in action. Next, check out our **[Getting Started](https://docs.nats.io/using-nats/nex)** guide. While it's far from complete and has the rough edges you might expect of a tech preview, we can't wait to start the feedback loop and get it into the hands of real NATS users and see the amazing things people build with it.

You can find the Nex creators in the NATS `#nex` [Slack](https://slack.nats.io/) channel, on videos and podcasts, through blogs, and on GitHub.

Happy executing!

## About the Author
Kevin Hoffman is the Cloud Services Engineering Director at [Synadia Communications](https://synadia.com). He has devoted most of his career to building distributed systems and making it easier for developers to do the same.