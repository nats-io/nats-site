+++
categories = ["Engineering", "Community"]
date = "2016-05-24T10:59:20-08:00"
tags = ["IoT", "nats", "mobile", "big data"]
title = "Guest Post: Saving lives using NATS for IoT Messaging"
author = "Farzad Azima"
+++

## NATS as the IoT mobile messaging system for an earthquake early warning network

I’m a programmer. I like to find difficult problems to solve, and work on effective solutions to these problems. We’ve all seen earthquakes covered in the news, sadly, , and earthquakes are on the rise globally. The average frequency and magnitude of earthquakes has increased recently, and more people than ever are living in urban areas which are dangerous during earthquakes.

Decreasing the number of people killed by earthquakes is a problem I want to help solve - approximately 10,000 people are killed each year by earthquakes, and tens of thousands are injured. For the last 2 years, I have been working on an Earthquake Early Warning System using smartphones through my non-profit, A Circular World. I’ve been designing a series of new algorithms for this, and two weeks ago in early April, eventually all of its modules get ready to be released except sending alert message to people in the crisis area. Our app is called Earling (Early Warning).

We needed a cost effective solution for providing always available connections to thousands of smartphones around the world. The more I learned about NATS, the more I realized it was a perfect fit for my project. NATS allows us to send emergency alarms with very small pieces of code, instantly, and is always available.

## How our System Uses NATS

### Client Side

<img class="img-responsive center-block" src="/img/blog/Earthquake_Client_side.png">

### Server Side

<img class="img-responsive center-block" src="/img/blog/Earthquake_Server_Side.png">

### Architecture

<img class="img-responsive center-block" src="/img/blog/Earthquake_Architecture.png">

## Why We Selected NATS

### High Availability

This project has vital operations. To reach its duty we needed a reliable persistence network connection between smartphones as client and servers. Our solution must be able to transmit millions of connections per seconds and except some rare expensive enterprise services, none of current solutions were able to handle this huge number of concurrent connections.

### Performance

Performance is critical in this use case, and can save lives - a second can be the difference between escaping a collapsing building or not. Based on our research between Amazon SQS, Kafka, ActiveMQ and RabbitMQ, NATS provided by far the best performance. Whereas none of them were able to handle more than 40,000 messages per second in our environment, NATS is able to transmit about 10 million messages per second. This made NATS a clear choice for performance.


### simplicity
It gets even more interesting when we talk about code required to handle this amount of messages - NATS required no more than 20 lines of code.

To send a message to millions of clients around the world just need to write:

```
publish("alarm", message.getBytes());

In other part to receive the sent message by server in client side (smartphones, PCs, Macs, IoTs) it is enough to say:
subscribe("alarm", onMessage()){
//What to do on message
}

Code example in Java to send and receive message by NATS:

ConnectionFactory cf = new ConnectionFactory(server);
nc = cf.createConnection();
//Send message
nc.publish("alarm", message.getBytes());

//Receive message
nc.subscribe("alarm", new MessageHandler() {			
	@Override
	public void onMessage(Message msg) {
		System.out.println("Message: " + new String(msg.getData()));
		}
});
}
```

### Cost Effectiveness

Compared to traditional enterprise messaging systems, and other options we considered, NATS was very appealing. It is open source and simple to use. Of course, some of the other options we considered are also open source, but the operational overhead with NATS is non existent, and we are able to scale to a high transaction load cost effectively. Management costs are something we had to factor in as a cost - even with open source software.


All of these factors made it clear to us that NATS was the obvious choice for our project. 

If you would like to learn more about the project, you can visit it [here](https://fb.com/acircularworld)
