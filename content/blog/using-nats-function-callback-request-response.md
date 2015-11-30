+++
categories = ["Engineering"]
date = "2015-11-11T11:22:41-08:00"
tags = ["nats"]
title = "Using NATS: Function, Callback, Request, Response"
author = "Brian Flannery"
+++

Bill Chute of [Acadiant Limited](http://www.acadiant.com/) has been using NATS for some time, and has given us some great feedback along the way. As Bill has stated in the past

>"We considered a number of modern messaging platforms. NATS was the clear choice because it’s the highest-performance message broker we could find, and it solidly supports all the languages in our stack. Because of its clean design, it was easy for us to get up to speed with NATS and it gives us the scalability and responsiveness we need."

Bill’s talk delved into how NATS communicates with all the languages and layers of the Acadient stack nicely, and he expanded on the performance aspects. One of the things I really liked about Bill’s talk was the way it started out fairly general and concept oriented, but wrapped up with some concrete examples with code. It was a pretty witty/humorous presentation, and the group seemed to enjoy listening to Bill’s overview of NATS!

Another interesting aspect of Bill’s talk was his tie-in between NATS and the UNIX philosophy. With microservices an increasingly talked about and implemented system design philosophy, Bill reminds us that everything old is new again. In particular, what he had to say about writing programs to handle text streams, as this is a universal interface. As many readers may be aware, one of the interesting things about NATS is that it is a text-based protocol.

Bill’s presentation is available [here (PDF)](http://acadiant.com/NATSLondon2015.pdf).
