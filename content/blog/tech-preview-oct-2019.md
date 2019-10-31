+++
categories = ["Community", "Newsletter"]
date = "2019-10-30"
tags = ["nats", "microservices", "technical", "features", "jetstream", "security", "service mesh", "monitoring"]
title = "Tech Review"
author = "Derek Collison"
+++

Our team is always working to bring you features to improve your NATS experience. Take a look at the following features in the latest releases of NATS Server and a sneak peek into JetStream!

<img src="/img/roadmap.png" alt="NATS Roadmap Image" height="400" width="600">

### Response Only Permissions

*NATS Server v2.0.4*

For services, the authorization for responding to requests usually included wildcards for _INBOX.> and possibly $GR.> with a supercluster for sending responses. What we really wanted was the ability to allow a service responder to only respond to the reply subject it was sent. We have now implemented this and it's in the current release. See PR - [https://github.com/nats-io/nats-server/pull/1081](https://github.com/nats-io/nats-server/pull/1081)

### Response Types

*NATS Server v2.0.4*

Exported Services were originally tied to a single response. We added the type for the service response and now support singletons (default), streams and chunked. Stream responses represent multiple response messages, chunked represents a single response that may have to be broken up into multiple messages.

### Service Latency Tracking

*NATS Server v2.1.0*

As services and service mesh functionality has become prominent, we have been looking at ways to make running scalable services on NATS.io a great experience. One area we have been looking at is observability. With publish/subscribe systems, everything is inherently observable, however we realized it was not as simple as it could be. We wanted the ability to transparently add service latency tracking to any given service with no changes to the application. We also realized that global systems, such as those NATS.io can support, needed something more than a single metric. The solution was to allow any sampling rate to be attached to an exported service, with a delivery subject for all collected metrics. We collect metrics that show the requestor's view of latency, the responder's view of latency and the NATS subsystem itself, even when requestor and responder are in different parts of the world and connected to different servers in a NATS supercluster.

### Queue Permissions

*Coming Soon*

Queue Permissions will allow you to express authorization for queue groups. As queue groups are integral to implementing horizontally scalable microservices, control of who is allowed to join a specific queue group is important to the overall security model. See PR - [https://github.com/nats-io/nats-server/pull/1143](https://github.com/nats-io/nats-server/pull/1143)

###  JetStream

Our next generation technology for doing Streaming, Work Queues and traditional Message Queues is coming in November 2019. JetStream is native to the NATS server and allows direct storage of messages with a defined global order, and the ability to consume the messages via push or pull based models. JetStream will be simple to use and operate, and will seamlessly scale horizontally by just adding more servers, and hence more memory and disk resources. These resources will be pooled and used for accounts that have JetStream enabled. We also added the ability to NAK messages and to directly and securely delete individual messages from a message set.

Learn more about JetStream with the following design docs and join us on [Slack](https://slack.nats.io) in the [#jetstream](https://natsio.slack.com/messages/CM3T6T7JQ) channel.


 * [Requirements](https://docs.google.com/document/d/1U2CFHeXlugdnfNCQtCtsFQvPhU6pZQvuL4lS3jO1idU/edit?ts=5d4c2ebf)
 * [Publishing](https://docs.google.com/document/d/1S1rTOr0eFl4NCOxu6miGR5ewSh3xiQ2oaT6-e_DFlWw/edit)
 * [Subscribing](https://docs.google.com/document/d/1LY9su-PbMhPcYz9vjCUZIoWtcfGayM5DwUT1S3n75fE/edit)
 * [Code Spike](https://docs.google.com/document/d/1X9Q9cjZzxA-LcxvgpKRn6owLDqbPrVSpmQNx9U8dNXA/edit)
 