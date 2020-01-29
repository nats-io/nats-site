+++
categories = ["Engineering"]
date = "2016-09-14"
tags = ["AWS", "nats", "IoT"]
title = "Guest Post: Using NATS For Secure, Fast, Low-latency IoT Sensor Messaging"
author = "Danko Miocevic"
+++

I am in the process of launching a company I've founded in the IoT sensors space. I hope to be able to share more details very soon, but I wanted to share what I can in the meantime with the developer community about how we are using NATS in our IoT messaging initiatives and would be very interested in any feedback, suggestions or questions!

Our platform is based on an IoT network of distributed sensors. These sensors come in all varieties: standalone hardware, iOS apps and Android apps. Although the information received from the sensors is stored in a NoSQL database for future processing, it still needs to be ready for real-time use and analysis.

When we speak about real-time, how this is implemented varies depending on what is being measured. There are projects where we can accept delays of a second, but there are also projects that require database storage and real-time analysis. Having a real-time approach aligned with the 2nd one - i.e. data availability now is one of our main objectives with what we are designing.

There was a need to create another stream of data where the services that gathered all the information from the sensors could be able to communicate with the services that display that information without going through the database and using a cost effective solution.

It was clear that the solution for this requirement was to create a pub-sub queue that could distribute the messages through all the nodes to display this information to the end user.

![Blog Image](/img/blog/nats-iot-aws.png "Blog Image")

## What we tried

As our project mostly runs on AWS, the first option was to use the different tools that AWS provided. We started analysing SQS, SNS and Kinesis but there were two major drawbacks:

- Cost at scale.
- Processing times that did not meet our requirements.  

SQS was not the tool for us because, among other things, in order to publish the message to all the servers at once there was the need to implement a way to keep track of the messages (the distribution and the order). SNS was not designed for this task, it is great to distribute other kind of messages and other amounts of data.

Kinesis is very robust in terms of reliability and because it is a turnkey solution, but the latency requirements we have for this project are too much for Kinesis.

We started checking other queues and there were many solutions on the market like Kafka and RabbitMQ among others. After evaluating these and other options, we found that NATS was the best option for us. There were some extra capabilities on the other queue systems that added extra complexity and delays that were not the objective of our development.

The replication of the information, the persistence of the messages are things that our project did not need (although NATS now provides these via NATS Streaming). The benchmarks of throughput and latency we studied between NATS and other queues were definitive and made NATS the lightweight solution we needed.

Now, onto the fun stuff...

## How we switched to NATS

Implementing NATS on AWS was made through a CloudFormation template that can be found on [GitHub](https://github.com/dankomiocevic/aws-nats). It was necessary to create an elastic cloud to add and remove NATS nodes dynamically as we need them.

To inform about the existing nodes and the newly created ones to the rest of the cluster we used a Python script that writes the information to a DynamoDB table and maintains a watchdog to know the state of every node on the system. When the applications want to connect to the nodes, they read the DynamoDB table and get the list of active nodes.
Here is an example on how to use this tool from a Java application:

```java
// Creating a Regions object from the configuration string.
Regions r = Regions.fromName("us-west-2");

// Get the servers list from the Cluster Manager.
String[] servers = NATSClusterManager.getServers(table, accessKey, secretKey, r, username, password);

// If servers are null something went wrong.
if(servers == null){
    System.out.printf("There was a problem getting the servers.");
    return;
}

// Setup options to include all servers in the cluster
ConnectionFactory cf = new ConnectionFactory();
cf.setServers(servers);

// Optionally set ReconnectWait and MaxReconnect attempts.
// This example means 10 seconds total per backend.
cf.setMaxReconnect(5);
cf.setReconnectWait(2000);

// Keep randomize enabled to distribute the connected clients.
cf.setNoRandomize(false);

Connection nc = cf.createConnection();

// Setup callbacks to be notified on disconnects and reconnects
nc.setDisconnectedCallback(new DisconnectedCallback() {
    public void onDisconnect(ConnectionEvent event) {
        System.out.printf("Got disconnected!\n")
    }
});

// See who we are connected to on reconnect.
nc.setReconnectedCallback(new ReconnectedCallback() {
    public void onReconnect(ConnectionEvent event) {
        System.out.printf("Got reconnected to %s!\n", event.getConnectedUrl())
    }
});

// Setup a callback to be notified when the Connection is closed
nc.setClosedCallback(new ClosedCallback() {
    public void onClose(ConnectionEvent event) {
        System.out.printf("Connection closed from %s!\n", event.getConnectedUrl())
    }
});
```

## Conclusion

NATS has become a critical piece of our system architecture. We have been using it for more than 6 months in our field tests with real users showing very good results. The users feel that the feedback they are receiving from the real world match the information we display on the screen with great accuracy and in real-time. As we formally launch our service, we will continuously be improving aspects of our system during beta, but the NATS queue is here to stay.

If you would like to connect with me you can find me on Twitter: [@dankomiocevic](https://twitter.com/dankomiocevic)

Want to get involved in the NATS Community and learn more? We would be happy to hear from you, and answer any questions you may have!

Follow us on Twitter: [@nats_io](https://twitter.com/nats_io)
