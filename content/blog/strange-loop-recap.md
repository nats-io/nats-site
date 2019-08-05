+++
categories = ["Engineering", "community"]
date = "2016-10-02"
tags = ["strangeloop", "nats", "events", "microservices"]
title = "The Zen of High Performance Messaging With NATS - My StrangeLoop 2016 Recap"
author = "Wally Quevedo"
+++

StrangeLoop began in 2009, as an event focused on distributed systems, security, emerging programming languages, and the like. This year nearly 1300 attendees came to StrangeLoop, and tickets were gone in less than 30 minutes after going on sale.

Needless to say, StrangeLoop is one of the highlights of the calendar for anyone writing modern software systems. The focus is on interesting, original, and technical presentations, as the organizers explain:

"Tech, not process. Talks are in general code-heavy, not process-oriented (agile, testing, etc)... Interesting stuff happens when you get people from different areas in the same room. Strange Loop has a broad range of topics from academia, industry, and a touch of weirdness.”'
I enjoyed the conference a lot when I first attended in 2013 so I've been wanting to attend again since, and was thrilled I got the notification that my CFP was accepted to speak about the origin, design, and implementation specifics of NATS.

The talk I gave covers a wide variety of aspects of NATS, but some of the more nuanced ones which are interesting include:

  - NATS has no deployment dependencies being just a 7MB binary with an equally lightweight Docker image .
  - NATS has an increasingly broad list of client libraries, connectors, and utilities.
  - NATS payloads are opaque to the server; they are just bytes which could be JSON, Msgpack, Protocol buffers etc...

Mentioned also about usage of the NATS NGINX client library used in the Apcera Platform; to almost instantly reconfigure where to send traffic to apps within the platform.

NATS Server is resilient and tries to be always available, doing things like pruning the interest graph of slow consumers.

You can view the recording of my talk via StrangeLoop’s YouTube Channel:


<div class="embed-responsive embed-responsive-16by9">
  <iframe class="center-block" width="560" height="315" src="https://www.youtube.com/embed/dYrYCt2dTkw" frameborder="0" allowfullscreen></iframe>
</div>

### The Zen of High Performance Messaging with NATS

The talk includes the following segments:
<ul class="list-unstyled">
  <li>0:00 - 2:30 :: General overview of NATS</li>
  <li>2:30 - 3:58 :: NATS Performance</li>
  <li>3:58 - 8:46 :: NATS Protocol</li>
  <li>8:47 - 11:50 :: NATS Request-Reply</li>
  <li>11:50 - 15:57 :: NATS Client Libraries Overview (including nats-top demo starting at 14:52)</li>
  <li>15:57 - 20:18 :: Additional NATS Features (Subject Routing, Distributing Queues, Clustering for HA, Auto-Discover, TLS, Monitoring)</li>
  <li>21:00 - 30:00 :: NATS Integration Scenario and near-zero Latency</li>
  <li>30:00 - end :: Recap and QnA.</li>
</ul>

Slides are available on Slideshare:

<iframe src="//www.slideshare.net/slideshow/embed_code/key/KAE6b6Tjx5OYek" width="595" height="485" frameborder="0" marginwidth="0" marginheight="0" scrolling="no" style="border:1px solid #CCC; border-width:1px; margin-bottom:5px; max-width: 100%;" allowfullscreen></iframe>

[The Zen of High Performance Messaging with NATS (Strange Loop 2016)](https://www.slideshare.net/wallyqs/the-zen-of-high-performance-messaging-with-nats-strange-loop-2016)

You can also view my talk as a Reveal.js presentation GitHub pages (you’ll need the latter to watch any animated gifs with performance monitoring).

Here are some of my photos from StrangeLoop 2016. It was a lot of fun and I am looking forward to next year’s event (that is if I can get a ticket...)

<blockquote class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr">Good bye St. Louis. <a href="https://twitter.com/hashtag/strangeloop?src=hash">#strangeloop</a> <a href="https://twitter.com/hashtag/pwlconf?src=hash">#pwlconf</a> <a href="https://twitter.com/hashtag/racketcon?src=hash">#racketcon</a> were all excellent <a href="https://t.co/Ia4l7YIlzx">pic.twitter.com/Ia4l7YIlzx</a></p>&mdash; Waldemar Quevedo (@wallyqs) <a href="https://twitter.com/wallyqs/status/777621622043779072">September 18, 2016</a></blockquote>
<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>

Also many thanks to the Workiva team for taking me out to have BBQ which I enjoyed a lot...

<blockquote class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr">Closing out <a href="https://twitter.com/hashtag/strangeloop?src=hash">#strangeloop</a> with this crew <a href="https://twitter.com/rinnanstimpy">@rinnanstimpy</a> <a href="https://twitter.com/charliestrawn">@charliestrawn</a> <a href="https://twitter.com/wallyqs">@wallyqs</a> <a href="https://twitter.com/carlosgaldino">@carlosgaldino</a> <a href="https://t.co/PvZ4HRZkJH">pic.twitter.com/PvZ4HRZkJH</a></p>&mdash; Tyler Treat (@tyler_treat) <a href="https://twitter.com/tyler_treat/status/777294960261378048">September 17, 2016</a></blockquote>
<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>

If you have any questions or feedback on my talk, feel free to reach out directly:

[Twitter](https://twitter.com/wallyqs) / [Github](https://github.com/wallyqs)

I look forward to hearing from you!
