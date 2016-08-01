+++
date = "2016-08-01T10:08:07Z"
draft = false
title = "How Ariane is moving to NATS"
categories = ["Engineering"]
tags = ["nats","ariane","community","microservice","nanoservice","transactions","JMS","0MQ","RabbitMQ"]
author = "Mathilde Ffrench"
+++

## Some words about the Ariane project

While DevOps movement is reducing application delivery time with automation on any step of the deployment, there is still a lot to do to reduce the necessary time to understand complex distributed application : 

* we still rely on hand written technical documentations and diagrams
* these documentations and diagrams are dispatched accross teams (silo effect)
* these documentations and diagrams are often not up to date (technical debt effect)

Knowledge management is a key factor to reduce silo effect and improve new team members integration. And it finally impact your production KPIs like TTR (Time To Resolution). But : 

* when done correctly, it cost a lot of time to produce and maintain the knowledge persistence.
* when not done or done partially, it cost a lot of time to understand your technical environment through reverse-engineering.

The Ariane project is focused on reducing the knowledge production time through diagram automation. 

Basically the Ariane project is a framework : it allows you to develop plugins which will automate technical reverse-engineering and transform the mined data into a bi-graph which will be stored in a graph database (Neo4J). 

Then the user will request the Ariane web server to get the map - or the technical diagram - between some technical points or around a technical point (a technical point could be a server or a process inside a server for example).

Currently three open source plugins has been written as proove of concept : 

* the RabbitMQ plugin which allow you to map RabbitMQ clusters, resources and connected applications
* the ProcOS plugin which allow you to map the process running inside your operating system and their connections
* the Docker plugin which allow you to map the Docker containers running inside your operating system and their connections

Bellow the result map of the Ariane application mapping (click on the slack link to get full picture) :

<div class="tweet-embed-con">
      <blockquote class="twitter-tweet" data-lang="fr"><p lang="en" dir="ltr">Ariane real time auto <a href="https://twitter.com/hashtag/mapping?src=hash">#mapping</a> :) <a href="https://twitter.com/hashtag/DataViz?src=hash">#DataViz</a> for the <a href="https://twitter.com/hashtag/DevOps?src=hash">#DevOps</a> / <a href="https://twitter.com/hashtag/Automation?src=hash">#Automation</a> / <a href="https://twitter.com/hashtag/transparency?src=hash">#transparency</a> <a href="https://t.co/LlP9zJOKNy">https://t.co/LlP9zJOKNy</a> <a href="https://t.co/P8niFL03Kn">pic.twitter.com/P8niFL03Kn</a></p>&mdash; echinopsii (@echinopsii) <a href="https://twitter.com/echinopsii/status/748516141174300674">30 juin 2016</a></blockquote>
      <script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>
</div>

The system view is a concatenation of data coming from ProcOS and Docker plugin. The RabbitMQ view has been done with the RabbitMQ plugin. You can see the Ariane server (process: [29143] java), the ProcOS and Docker plugins (processes: [30432] python3 and [30491] python3) running in the system view. RabbitMQ plugin is running inside the Ariane server.

## Scale the monolith : from nanoservices to microservices

First Ariane versions have been done as a big Java monolith which is not really sexy with all the last cloud trends but this was a cost saver for the little startup echinopsii and it helps to focus on the Ariane APIs and functionalities. 

Anyway monolith doesn't mean it's poorly architectured : we followed separation of concern everywhere and Ariane is a combination of many OSGi nanoservices **(NOTE: ten years back OSGi has coined µservice but today I prefer to call them nanoservices to provide a clear distinction with current deployable and network oriented microservice definition)**.

So all these nanoservices are speaking together in the same Java process through memory and clean interfaces. Ariane also provides REST implementation of these services which allowed us to develop first Ariane Python3 client which is used by ProcOS and Docker plugins. 

But while HTTP and REST APIs are great for human interface we believe machine to machine deserve more efficient network transport : 

* we want to reduce transport latency and cost as much as possible. HTTP is slow and comparatively to MoM.
* we may need routing accross datacenters and firewalls while installing ProcOS and Docker plugins as local agents on the operating systems to map. Many MoM provides easy solutions for that. 

Since Ariane 0.8.0 we're providing a messaging implementation for the Ariane mapping service and since then ProcOS and Docker plugins are able to push the data to the mapping service through RabbitMQ or NATS.

Bellow is a Ariane 0.8.0 quick diagram : 



### Why NATS over RabbitMQ or 0MQ ?



## Some implementation details

### Basic flow patterns

### Properties fields and body

### Transaction management



## Conclusion


