+++
categories = ["Engineering"]
date = "2016-12-01"
tags = ["nats", "streaming", "microservices"]
title = "Using NATS with NATS Streaming"
author = "Larry McQueary (NATS Product Manager)"
+++

Since we release [NATS Streaming](http://nats.io/documentation/streaming/nats-streaming-intro/) earlier this year, one of the most common inquiries we get is *"why doesn't NATS Streaming have a request-reply API like NATS?"*

It's a fair question. On the surface, NATS Streaming looks just like NATS, but with message acknowledgements and replay added in. 
I can connect, publish messages, subscribe to subjects (with or without replay), and process messages asynchronously.    


## Why *doesn't* NATS Streaming Have a Request-Reply API? 
