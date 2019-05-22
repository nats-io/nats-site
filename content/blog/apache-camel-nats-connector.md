# apache-camel-nats-connector

+++ categories = \["Engineering"\] date = "2016-11-03" tags = \["apache camel", "nats", "cloud", "apcera"\] title = "Apache Camel NATS Connector for the Apcera Platform" author = "Igor Fomenko" +++

## Introduction - Camel, NATS and Apcera

Recently at [Logimethods](http://logimethods.com/) we’ve developed a new [Camel-Nats](http://camel.apache.org/nats.html) component that can deploy on premise \(non-cloud\), and through the Apcera platform. In this blog, we’ll introduce this new component and explain why we believe that it was a critical missing link for organizations trying to develop an integration platform based on open source tools and cloud infrastructure.

If you are not familiar with Apache Camel, a “Component” is another term for an adapter built using Camel framework. So let’s examine how the [NATS](http://www.nats.io), [CAMEL](http://camel.apache.org/), and [Apcera](http://www.apcera.com) technologies complement each other and see how all three can integrate as core components of a modern IT architecture.

Consider, for example, the typical integration architecture requirements for a company collecting real-time data from mobile devices utilised for automated asset tracking and control. The functional requirements are as follows:

* Data collection from multiple mobile devices used for asset tracking.
* Send data collected from devices to enterprise systems in real-time, and share it with partners using a variety of communication protocols and industry-standard data formats such as REST, SOAP, AMQP, etc.
* Most devices are constrained regarding memory, CPU, power usage or networking and therefore are not open to extending them with the new software to standardize on messaging protocols. As a consequence devices should continue to communicate with existing proprietary and industry standard protocols such as TCP and UDP socket protocols, HTTP, etc.

In addition, some of the non-functional requirements are:

* The Integration platform should handle literally millions of devices with message intervals from each device measured in seconds.
* The Integration Platform should scale easily in the future.

So how can all these devices efficiently communicate with each other and with the enterprise, given that there are many different protocols and message formats in use? Here is where Apache Camel comes in as an important component of integration architecture by utilizing Camel as a mediator and router for the data controlling message flow between the enterprise systems and field devices. Camel routes messages to their destination using a large variety of available enterprise integration patterns, while simultaneously translating messages through message mapping and protocol switching.

We also know that messages will be processed through various services at different rates depending on the complexity of the business logic. Therefore, to avoid bottlenecks in the message flow, we must introduce a message broker with message queuing capabilities. NATS is ideally suited for this purpose for its simplicity, performance, flexibility, and security. NATS’ footprint allows deployment in any environment or device.

The diagram below shows a simplified logical view of message flow from field devices to enterprise systems through using Camel and NATS technologies as its core components.

![Message Flow](https://github.com/nats-io/nats-site/tree/c42c46a7c6b8669e66e28419887d2f8dd29aa502/img/blog/apache-camel-nats-connector/message-flow.png)

Only a single IoT business use case is considered so far in our analysis above; a similar pattern can be implemented for other use cases. For example, a similar integration pattern can be applied to handle control and configuration messages flowing back from enterprise systems to field devices.

It is now evident how all systems can communicate with each other using normalized messaging by Camel and delivered through NATS to various message channels.

Camel and NATS provide the foundation for a highly scalable integration platform. However, infrastructure architecture still needs to address the issue of distributing platform services on available hardware to balance the load of messages handled by the platform. In fact, this is probably one of the biggest challenges of IoT integration today.

Scaling out our integration platform horizontally with a secure cloud platform that can balance the load is why we believe Apcera is a solid made to purpose option for our integration platform requirement. As an added benefit Apcera also includes NATS natively as a cloud service so we can use it “Out-Of-The-Box” without having to purchase and configure infrastructure.

## Camel-Nats component for Cloud Platform is the missing piece.

The benefit of Apache Camel is the capability to connect easily to a wide range of various technologies and applications through existing components. The Apache Camel project even released a new [Camel-Nats](http://camel.apache.org/nats.html) component a few months ago however it was not “Cloud Ready” and could not leverage Apcera as is. Let’s examine what is missing in the existing [Camel-Nats](http://camel.apache.org/nats.html) component.

All existing Apache Camel components are based on the common framework using a component endpoint configuration in the form of URI to specify target system connection parameters. For example Camel-HTTP component needs to be configured with a URI that looks like this: **“http:hostname\[:port\]\[/resourceUri\]\[?options\]”**. An existing [Camel-Nats](http://camel.apache.org/nats.html) component needs endpoint configured with URI as follows: **“nats://hostname\[:port\]?options”**. However, this endpoint configuration, with an explicit hostname and port number, is not ideal when the Camel application and the NATS services are deployed on the same Apcera platform \(or on any other cloud platform for that matter\).

A more efficient way of specifying Camel-Nats connector endpoints on the Apcera platform is by using its native “Job Link” facility. In a nutshell, job link provides connectivity information to the service and can dynamically be obtained through Apcera environment variables. For more information about job links, please see the [Apcera documentation](https://docs.apcera.com/). When the application deployed on Apcera is using job link to connect to another application, it can benefit from some of the built-in platform “service orchestration” capabilities such as load balancing, high availability, scaling, policy controls, dynamic routing.

Given this capability, Apcera Job Link is used by the new Logimethods Camel-Nats component to get connection information between the Camel route and NATS service. At design time, the Camel component endpoint URI is specified as “nats:APCERA:JOBLINKNAME\[?options\]”, where “APCERA” indicates that component is deployed on the APCERA platform, and “JOBLINKNAME” is the name of job link that is created at deployment time.

The Camel-Nats component developed by Logimethods automatically acquires all required connection information from an Apcera job link at start-up, and during instances when connection information potentially changes. The “OnDisconnect” event raised by NATS client library is such an instance.

In addition to using job link for connections, the New [Camel-Nats](https://github.com/Logimethods/camel-nats) component also has improved multithreading capabilities with number of parallel threads for message processing, controlled by configuration parameters.

If you are interested in [Camel-Nats](https://github.com/Logimethods/camel-nats) component, it is made available as free download from [Logimethods Git Repository](https://github.com/Logimethods/camel-nats). You can also download the [Sample Apache Camel](https://github.com/Logimethods/apcera/tree/master/apcera-demos/camel-nats-demo) project that uses this component to send messages from the TCP socket to the NATS server and from the NATS server to the logging console.

The diagram below shows the simplified logical view of of a Sample Camel application with Camel-Nats component for deployed application on the Apcera platform.

![Sample Camel Application](https://github.com/nats-io/nats-site/tree/c42c46a7c6b8669e66e28419887d2f8dd29aa502/img/blog/apache-camel-nats-connector/sample-camel-app.png)

This project compiles as a Spring application deployable on Apcera. I am planning to add more details soon on how to do this.

Please note that the application can also be run as a standalone Spring application on any computer. To do so, the Camel-Nats component needs to be configured in traditional way with the following URI: **“nats://myhost:4222?options”**.

### About the Author

[Igor Fomenko](mailto:Igor.fomenko@logimethods.com) is a Senior Consultant at Logimethods with a strong expertise in integration architecture and application development.

[Logimethods](http://logimethods.com/) is a highly specialized consulting firm providing Enterprise Architecture, Enterprise Integration and Business Intelligence services to help organizations:

* Align, simplify and integrate their IT environment for greater efficiency and asset reuse, and
* Achieve higher levels of process performance.

Logimethods is headquartered in Montreal, with offices in Toronto, Calgary, and Chicago.

