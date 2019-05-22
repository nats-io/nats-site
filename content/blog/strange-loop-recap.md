# strange-loop-recap

+++ categories = \["Engineering", "community"\] date = "2016-10-02" tags = \["strangeloop", "nats", "events", "microservices"\] title = "The Zen of High Performance Messaging With NATS - My StrangeLoop 2016 Recap" author = "Wally Quevedo" +++

StrangeLoop began in 2009, as an event focused on distributed systems, security, emerging programming languages, and the like. This year nearly 1300 attendees came to StrangeLoop, and tickets were gone in less than 30 minutes after going on sale.

Needless to say, StrangeLoop is one of the highlights of the calendar for anyone writing modern software systems. The focus is on interesting, original, and technical presentations, as the organizers explain:

"Tech, not process. Talks are in general code-heavy, not process-oriented \(agile, testing, etc\)... Interesting stuff happens when you get people from different areas in the same room. Strange Loop has a broad range of topics from academia, industry, and a touch of weirdness.”' I enjoyed the conference a lot when I first attended in 2013 so I've been wanting to attend again since, and was thrilled I got the notification that my CFP was accepted to speak about the origin, design, and implementation specifics of NATS.

The talk I gave covers a wide variety of aspects of NATS, but some of the more nuanced ones which are interesting include:

* NATS has no deployment dependencies being just a 7MB binary with an equally lightweight Docker image .
* NATS has an increasingly broad list of client libraries, connectors, and utilities.
* NATS payloads are opaque to the server; they are just bytes which could be JSON, Msgpack, Protocol buffers etc...

Mentioned also about usage of the NATS NGINX client library used in the Apcera Platform; to almost instantly reconfigure where to send traffic to apps within the platform.

NATS Server is resilient and tries to be always available, doing things like pruning the interest graph of slow consumers.

You can view the recording of my talk via StrangeLoop’s YouTube Channel:

## The Zen of High Performance Messaging with NATS

The talk includes the following segments:

* 0:00 - 2:30 :: General overview of NATS
* 2:30 - 3:58 :: NATS Performance
* 3:58 - 8:46 :: NATS Protocol
* 8:47 - 11:50 :: NATS Request-Reply
* 11:50 - 15:57 :: NATS Client Libraries Overview \(including nats-top demo starting at 14:52\)
* 15:57 - 20:18 :: Additional NATS Features \(Subject Routing, Distributing Queues, Clustering for HA, Auto-Discover, TLS, Monitoring\)
* 21:00 - 30:00 :: NATS Integration Scenario and near-zero Latency
* 30:00 - end :: Recap and QnA.

Slides are available on Slideshare:

[The Zen of High Performance Messaging with NATS \(Strange Loop 2016\)](http://www.slideshare.net/wallyqs/the-zen-of-high-performance-messaging-with-nats-strange-loop-2016)

You can also view my talk as a Reveal.js presentation GitHub pages \(you’ll need the latter to watch any animated gifs with performance monitoring\).

Here are some of my photos from StrangeLoop 2016. It was a lot of fun and I am looking forward to next year’s event \(that is if I can get a ticket...\)

Good bye St. Louis. [\#strangeloop](https://twitter.com/hashtag/strangeloop?src=hash) [\#pwlconf](https://twitter.com/hashtag/pwlconf?src=hash) [\#racketcon](https://twitter.com/hashtag/racketcon?src=hash) were all excellent [pic.twitter.com/Ia4l7YIlzx](https://t.co/Ia4l7YIlzx)— Waldemar Quevedo \(@wallyqs\) [September 18, 2016](https://twitter.com/wallyqs/status/777621622043779072)

Also many thanks to the Workiva team for taking me out to have BBQ which I enjoyed a lot...

Closing out [\#strangeloop](https://twitter.com/hashtag/strangeloop?src=hash) with this crew [@rinnanstimpy](https://twitter.com/rinnanstimpy) [@charliestrawn](https://twitter.com/charliestrawn) [@wallyqs](https://twitter.com/wallyqs) [@carlosgaldino](https://twitter.com/carlosgaldino) [pic.twitter.com/PvZ4HRZkJH](https://t.co/PvZ4HRZkJH)— Tyler Treat \(@tyler\_treat\) [September 17, 2016](https://twitter.com/tyler_treat/status/777294960261378048)

If you have any questions or feedback on my talk, feel free to reach out directly:

[Twitter](https://twitter.com/wallyqs) / [Github](https://github.com/wallyqs)

I look forward to hearing from you!

