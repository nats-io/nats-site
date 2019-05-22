# nats-secure-scalable-control-pane-for-microservices

+++ categories = \["Community", "Engineering"\] date = "2017-01-24" tags = \["nats", "microservices", "scalable", "guest post", "go", "aws", "microsoft", "microsoft sql server"\] title = "Guest Post - NATS as a Secure and Scalable control plane for Go, AWS, and Microsoft SQL Server based Microservices" author = "Mark Songhurst" +++

[Equine Register](http://www.equineregister.co.uk/) provides the government, industry and members of the public with bespoke digital tools and services that increase equine welfare and combat criminal activity. We are actively replacing legacy paper-based systems with smartphone and web delivered solutions which provide unequivocal information regarding the identity, history, health and ownership of an equine from it’s birth onwards.

I am responsible for the design and implementation of the architecture providing our RESTful API, which needs to serve an array of different Clients and be capable of supporting new functionality with minimal delay and impact. With an ever-increasing customer base, our system’s performance metrics are estimates at best, requiring the API to be highly performant and stable.

I designed the systems providing the API from scratch, using a microsystems approach with all components being written in [Go](https://golang.org/) and hosted on CentOS 7 instances running in auto-scaling groups \(ASG\) on [Amazon Web Services](https://aws.amazon.com/).

Each component in our microsystem is named after a horse breed, with the two primary components being Percheron \(our public facing HTTPS interface\) and Taishuh \(the API endpoint request processor, which concurrently executes stored procedure calls against [Microsoft SQL Server](https://www.microsoft.com/en-us/sql-server/)\).

## How do we use NATS?

NATS provides the messaging layer between Percheron and Taishuh.

![architecture diagram](https://github.com/nats-io/nats-site/tree/c42c46a7c6b8669e66e28419887d2f8dd29aa502/img/blog/nats-secure-scalable-control-pane-for-microservices/architecture-diagram.png)

I use NATS Message Queuing as the communication method, with each Taishuh instance declaring support for one or more Queues, each Queue mapping to an API endpoint. In Taishuh a Queue handler is declared through a Go interface, which enables me to develop new Queue handlers very quickly. I can enable Queue support within Taishuh though JSON configuration files, so we can configure certain Taishuh instances running on Large AWS EC2 instances to handle \(for example\) API calls that perform CPU heavy tasks, whilst lightweight API calls can go to Micro EC2 instances.

NATS then provides routing for me by determining for me which Queue Group in the pool of Taishuh instances a message will be sent to. Each Taishuh in the Queue Group has limit of how many messages it will concurrently process. Once that limit is met, it will ignore further messages to the Queue Group until it has available capacity. OK, so I could do this using an AWS Application Load Balancer, but because of the flexibility of NATS i’m not bound to any particular Cloud service provider and we could \(potentially\) modify our architecture as future requirements dictate relatively easily.

A further gain is error handling - when NATS times-out on a message I can pick this up in Percheron and handle the error gracefully by either returning a 5xx series HTTPS status to the client, or by re-submitting the NATS message and have Percheron extend the session with the Client.

Security is paramount to our architecture and the relatively recent addition of TLS support in NATS allows use to now employ TLS connections all the way from Client to SQL Server, and back again.

For redundancy we use the NATS cluster mode, placing the Seed Servers into an AWS ASG.

We’re using the Glide dependency system for Go and because NATS Go Client declares Github release version numbers, our CI system can make both reproducible and predictable builds.

In addition to these benefits we get by using NATS, it has also allowed us to quickly adapt a modern microservices architecture;Initial management concerns about the inherent latency in such an architecture were quashed when the performance of NATS shone through.

## Where are we going next?

We’re looking to gain better insight into the throughput of the API infrastructure, ironing out any bottlenecks and dynamically increasing capacity when required. To this end we’ll be looking closely at the monitoring support offered by NATS.

