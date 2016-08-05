+++
date = "2016-08-01T10:08:07Z"
draft = false
title = "How Ariane is moving from monolith to microservices with NATS"
categories = ["Engineering"]
tags = ["nats","ariane","community","microservice","nanoservice","transactions","RabbitMQ"]
author = "Mathilde Ffrench"
+++

## Some words about the Ariane project: 

While the DevOps trend is reducing application delivery time with automation on any step of the deployment, we still need to reduce the time to understand complex distributed applications: 

* we still rely on hand-written technical documentations and diagrams;
* these documentations and diagrams are dispatched across teams (silo effect); 
* the documentations and diagrams are also often not up to date (technical debt effect).

Knowledge management is a key factor in reducing silo effect and improving the integration of new team members. And it finally impacts your production KPIs like TTR (Time To Resolution). But : 

* when done correctly, it costs a lot of time to produce and maintain the knowledge persistence. 
* when not done or done partially, it costs a lot of time to understand your technical environment through reverse-engineering.

The [Ariane project](http://ariane.echinopsii.net) is focused on reducing the knowledge production time through real-time diagram automation. 

Basically, the Ariane project is a framework : it allows you to develop plugins which will automate the data mining from your runtime and the transformion of this mined data into a [bi-graph](https://en.wikipedia.org/wiki/Bigraph) stored in a graph database ([Neo4J](http://neo4j.com)). 

Then the user will request the Ariane web server to get the map - or the technical diagram - between some technical points or around a technical point (a technical point could be a server or a process inside a server, for example).

Currently, three open source plugins has been written as proof of concept : 

* the [RabbitMQ plugin](https://github.com/echinopsii/net.echinopsii.ariane.community.plugin.rabbitmq) which allows you to map RabbitMQ clusters, resources and connected applications
* the [ProcOS plugin](https://github.com/echinopsii/net.echinopsii.ariane.community.plugin.procos) which allows you to map the process running inside your operating system and their connections
* the [Docker plugin](https://github.com/echinopsii/net.echinopsii.ariane.community.plugin.docker) which allows you to map the Docker containers running inside your operating system and their connections

Below the result map of the Ariane application mapping ([full picture](https://t.co/LlP9zJOKNy)) :

<div class="tweet-embed-con">
      <blockquote class="twitter-tweet" data-lang="fr"><p lang="en" dir="ltr">Ariane real time auto <a href="https://twitter.com/hashtag/mapping?src=hash">#mapping</a> :) <a href="https://twitter.com/hashtag/DataViz?src=hash">#DataViz</a> for the <a href="https://twitter.com/hashtag/DevOps?src=hash">#DevOps</a> / <a href="https://twitter.com/hashtag/Automation?src=hash">#Automation</a> / <a href="https://twitter.com/hashtag/transparency?src=hash">#transparency</a> <a href="https://t.co/LlP9zJOKNy">https://t.co/LlP9zJOKNy</a> <a href="https://t.co/P8niFL03Kn">pic.twitter.com/P8niFL03Kn</a></p>&mdash; echinopsii (@echinopsii) <a href="https://twitter.com/echinopsii/status/748516141174300674">30 juin 2016</a></blockquote>
      <script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>
</div>

The system view is a concatenation of the data coming from ProcOS and Docker plugins. The RabbitMQ view has been done with the RabbitMQ plugin. 

You can see the Ariane server (process: [29143] java), the ProcOS and Docker plugins (processes: [30432] python3 and [30491] python3) running in the system view. RabbitMQ plugin is running inside the Ariane server.

## Scale the monolith: from nanoservices to microservices

The previous Ariane versions have been done as a big Java monolith which is not really sexy with all the last cloud trends but this was a cost saver for the little startup [echinopsii](http://echinopsii.net): 

* it allowed us to focus on the Ariane APIs and functionalities instead of deployment problems.
* it allowed us to quickly show demonstrations to some prospects and at some meetup.

Anyway, monolith doesn't mean it's poorly architectured : we followed separation of concern everywhere and Ariane is a combination of many OSGi nanoservices **(NOTE: ten years back, the OSGi alliance has coined µservice, but today, I prefer to call them nanoservices to provide a clear distinction with the current containerized and network oriented microservice definition)**.

So, all these nanoservices are speaking together in the same Java process through memory and clean interfaces. Ariane also provides REST implementation of these services, which allowed us to develop first Ariane Python3 client used by ProcOS and Docker plugins. 

But while HTTP and REST APIs are great for human interface, we believe machine to machine communications deserve more efficient network transport: 

* we want to reduce transport latency and cost as much as possible. HTTP is slow and more expensive compared to MoM.
* we may need routing accross datacenters and firewalls while installing ProcOS and Docker plugins as local agents on the operating systems to map. The majority of MoM provide easy solutions for that. 

Since Ariane 0.8.0 we're providing a messaging implementation for the Ariane mapping service and since then ProcOS and Docker plugins are able to push the data to the mapping service through messaging bus.

Below a quick diagram describing Ariane 0.8.0 monolith architecture: 

<img src="/img/blog/ariane-mapping-microservice-with-nats/ariane_monolith.png">

As you can see, the Ariane monolith is embedding lot of stuff from a Tomcat server to a Neo4J database server. To improve the Ariane scalability, we are currently splitting the monolith as described below : 

<img src="/img/blog/ariane-mapping-microservice-with-nats/ariane_3tier.png">

This architecture migration has been done with minimal cost on the plugins side, as they are using the Ariane APIs the same way as before: we just need some changes in the configuration to define which implementation to use (REST or Messaging // Memory or Messaging).

Based on this new architecture:

* we will provide cloud ready docker images and orchestration script templates;
* we will scale the back mapping database with Neo4J enterprise separately to the front web server.

Now, this is how this migration looks like from a system point of view: 

**before**
<img src="/img/blog/ariane-mapping-microservice-with-nats/ariane_mono_rbq.png">
([full picture](https://slack-files.com/T04JMETB8-F1X4BG6SJ-d091f7ff9f))

**after**
<img src="/img/blog/ariane-mapping-microservice-with-nats/ariane_mms.png">
([full picture](https://slack-files.com/T04JMETB8-F1X4LJQJK-423434f150))

If you look closely the Ariane maps provided, you'll notice that : 

* a new java process appears: this is the Ariane mapping microservice which embeds the Neo4J community distribution
* we were already using RabbitMQ and we decided to add NATS implementation on our messaging libraries (java and python)

Finally and to resume the reasons why we are using NATS now: 

* as we're migrating data flows from memory to the messaging bus, we have deep concern on the messaging bus latency and throughput : the NATS benchmark scores are [*impressive*](http://bravenewgeek.com/dissecting-message-queues/);
* we don't need messaging persistence/transaction in the MoM server: persistence and transactions are managed in the Ariane endpoints;
* we like simplicity: NATS is simple.

## Conclusion

Carefull readers have noticed some hand made diagrams in this blog post. This is tipically the kind of work we love to automate. 

As you may understand, the Ariane project is a big trip which makes fun and profit from new graph database technology and which needs an efficient messaging bus to push, as much as possible and as quickly as possible, the data coming from your runtime to a big and unified mapping database. 

Ariane is also an open source and inclusive project because there are lots of plugins to write : every day, we're developing new applications which will raise new problems tomorrow and which will need a fast and deep understanding from OPS and DEVS.

From our point of view, this human understanding of tech is a key point in providing the next step of our evolution : efficient and trusted IA.

<div class="tweet-embed-con">
<blockquote class="twitter-tweet" data-lang="fr"><p lang="en" dir="ltr">&quot;<a href="https://twitter.com/hashtag/Ubiquitous?src=hash">#Ubiquitous</a> <a href="https://twitter.com/hashtag/computing?src=hash">#computing</a> will empower us, if we understand it.&quot; Robin Milner<a href="https://t.co/G1R98yRogF">https://t.co/G1R98yRogF</a> <a href="https://t.co/aDWOy5Fvl2">pic.twitter.com/aDWOy5Fvl2</a></p>&mdash; echinopsii (@echinopsii) <a href="https://twitter.com/echinopsii/status/706270281925582849">6 mars 2016</a></blockquote>
<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>
</div>

Next Ariane delivery (0.8.1) is scheduled for this end of August 2016. Meanwhile I'll be happy to read your [feedbacks](mailto:mathilde.ffrench@echinopsii.net) ! 
