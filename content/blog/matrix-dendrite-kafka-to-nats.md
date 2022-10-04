+++
date = "2022-10-04"
title = "Matrix & Dendrite Projects move from Kafka to NATS"
author = "Neil Alexander "
categories = ["Engineering","JetStream","Kafka"]
tags = ["NATS"]
+++

## Matrix & Dendrite

[Matrix](https://matrix.org/) is a federated protocol for real-time communications built on top of distributed data structures and Dendrite is an implementation of a Matrix homeserver built following a microservice architecture. It was originally intended to help us to overcome some load issues that were present in earlier monolithic implementations at the time. As a result, flexibility, performance, and scalability have been three critical areas of focus in our development.

## In the Beginning with Kafka

  
When we first started the Dendrite project, we were using Kafka as a means to distribute events and asynchronous tasks between microservice components. In addition to being able to scale up and down as needed, we also needed durability in the message queue to ensure that if parts of the service were restarted, no tasks or events were lost. Given our need for deployment flexibility, it’s equally important for all of the microservices to run under a single process as it is to be able to split them out and run them under separate processes - or even on different machines. We wanted to be able to target embedded and small platforms, as well as the datacentre.  
  
While Kafka allowed us to get earlier versions of Dendrite working quickly, we eventually found it to be relatively heavy when used in a full polylith microservice deployment and didn’t scale down as well as we had hoped for smaller deployments. To successfully run under a single process without a standalone server handling the events and tasks, we were also forced to mock up our own lightweight Kafka-ish queue implementation, which carried with it additional maintenance burden. We weren't satisfied with the performance of either mode of operation and found that data retention was especially difficult to manage.

## Why NATS is a Better Fit for Dendrite

  
We evaluated a number of different alternatives and eventually landed on NATS JetStream, which in effect gave us everything we used Kafka for but had a number of additional benefits. For a start, it was considerably easier to get running. The NATS Server consumed far less system resources. Being written in Go, we were able to embed NATS into our own monolith-style binaries so we didn't even need a separate server instance in those smaller deployments. We contributed some patches to make it possible to communicate with the NATS Server in-process without using external sockets; this made it possible to both easily target mobile devices, and venture into the web browser under WebAssembly too.

### NATS Benefits vs. Kafka:

 * **Consumes less system resources** -- Less infrastructure spend than Kafka
 * **Written in Go** -- Easy to embed, no need for separate server instances like in Kafka
 * **Simpler data retention** -- Using JetStream, easier to manage and configure retention than Kafka
 * **Reduced management overhead** -- Easier for developers to manage and maintain than Kafka
 * **Reduced codebase complexity** -- simpler code stack due to elimination of complicated persistent storage requirements
  
For us, switching to JetStream was transformational. Performance is excellent overall. We make heavy use of the interest-based retention policies to ensure that work is cleaned up when it is complete. We take advantage of being able to manually acknowledge items to ensure they were processed successfully before cleaning up. We've been able to successfully manage pools of workers from NATS streams and considerably reduce the amount of complexity in our codebase in a number of places which no longer need their own persistent storage. We've even had it successfully running in application-embedded scenarios on iOS and Android as a part of our peer-to-peer demos.

In summary, our team is always on the lookout for the right tools and architectures for the performance and flexibility our users require. As part of our evolution we made the shift from Kafka to NATS, and have not looked back. Stay tuned to see what interesting updates lay ahead next year for Dendrite!

## About the Author

Neil Alexander is a software developer working on [Matrix (and Dendrite)](https://matrix.org) at [Element](https://element.io). He is interested in security, privacy, decentralised systems and computer networking. Neil also has experience in end-user compute and enterprise-scale systems architecture.