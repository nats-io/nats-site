+++
categories = ["Engineering", "Community"]
date = "2016-07-26"
tags = ["nats", "microservices", "ansible"]
title = "Guest Post: NATS at Netlify - New Possibilities for Ultra-fast Web Content Publishing"
author = "Ryan Neal"
+++

[Netlify](http://www.netlify.com) is the leading platform for deploying high performance websites and applications. The traditional way of making websites is being disrupted by technologies like static site generators, build automation, and CDN hosting. Netlify is building the modern day platform that developers and companies use to manage and publish their content online. Launched in March 2015, Netlify already serves close to a billion page views per month for thousands of developers and clients such as WeWork, Wikia, Sequoia Capital, Uber, and Vice Media.

At Netlify I am the Head of Infrastructure. That sounds like a devops job (and some days it is), but it means that I build out the backend platform that powers our 70,000+ sites. Our platform spans most of the cloud providers - Rackspace, AWS, Google Cloud Platform, Digital Ocean, and our own anycast network. We do this to leverage each provider's strength and nimbly move between them when we face problems such as provider outages or DDoS. We use Go, Ruby, C/C++, RabbitMQ, ATS, Ansible ([playbook here](https://github.com/rybit/nats_ansible)), MongoDB, and - of course - [NATS](http://www.nats.io).


Our data plane is designed to be where our services dump data such as metrics and log messages. Other interested parties can hook up and consume the data stream. We have been debating between using RabbitMQ and NATS for the message bus. We already use RabbitMQ for our command and control plane, but have experienced some administration headaches, and cumbersome client code. In addition, we were concerned about the throughput and didn’t need the enterprise messaging features (e.g. topic durability, guaranteed delivery) that RabbitMQ provided (and NATS now has via [NATS Streaming](http://www.nats.io/documentation/streaming/nats-streaming-intro/)). The decision to use NATS was based on the performance, easy setup, and clean client code.

<img class="img-responsive center-block" alt="Netlify NATS Architecture" src="/img/blog/netlify-nats-architecture.png">

For a concrete example, let’s look at how we built our logging framework. We have two types of services, ones that we wrote and ones we use (e.g. ATS). For the ones we wrote we have standardized to log with [logrus](https://github.com/Sirupsen/logrus) with a [nats hook](https://github.com/netlify/messaging/blob/master/nats_logrus_hook.go). For services where we can’t edit the code we use a [log tailer](https://github.com/netlify/streamer) to dump those logs to NATS. Now that the data is flowing through NATS we have a handful of services that act on that data. One such service is [elastinats](https://github.com/netlify/elastinats); it listens to different channels and then pushes them to Elasticsearch. Now we have a searchable, unified view of our platform. This has been immensely helpful in detecting and diagnosing problems that come up when running a large distributed system.

When building out this system I uncovered a [little bug](https://github.com/nats-io/nats/issues/193). After confirming that it was indeed not my code - which had a non-zero chance of being the culprit -I reached out to the community over the mailing list, was quickly added to Slack (you can request an invite [here](http://www.nats.io/community/)), and now I am part of the community. Community engineers and the NATS team jumped on the issue and hammered out [a solution](https://github.com/nats-io/nats/pull/194) in a few days. This quick turnaround between bug discovery to fix confirmed that I had chosen the right messaging system for our next iteration of our architecture.

Getting access to our own data via NATS was the first step, and now it is a question of what we can dream up. At Netlify we are very excited about all the ideas we’ve had and new features this is going to enable. We are also very [passionate about open-source](https://github.com/netlify), we look forward to giving back to the NATS community.

If you have any questions or would like to know more, feel free to find me in NATS Slack, or on [Twitter](https://twitter.com/ry_boflavin)!
