+++
categories = ["Community"]
date = "2017-07-21"
tags = ["events", "golang", "gophercon"]
title = "GopherCon 2017 Recap - How does GopherCon keep getting even better each year?"
author = "Brian Flannery"
+++

GopherCon 2017 Recap - How does GopherCon keep getting even better each year?

Now that everyone has had time to catch their breath a bit, we wanted to recap what our team was up to at GopherCon! It remains one of our favorite events, and Apcera has sponsored every year, with NATS having a room on Community Day last year and again this year, too.

Just as our team were getting into Denver to prepare to kick off GopherCon, we also released 1.0 of NATS Server. You can find the latest version [here](http://nats.io/download/nats-io/gnatsd/). The 1.0 release has a bunch of goodness in there, with the main item being hot configuration reload. You’ll note if you parse the release notes this release had a nice community dimension behind to it - so, we’d like to again thank everyone who took part!

At GopherCon the team enjoyed networking with everyone at Wynkoopf Brewery, and at the CoreOS party at Pizza Republic. Thank you to the CoreOS crew for sponsoring that and making it such a convenient trek (over a few dozen paces) over.

There were a few NATS items at GopherCon this year: On Friday, Wally Quevedo on our team gave a talk on Writing Networking Clients in Go, using his experience with the NATS Go Client as an example. The recording of the talk will be out at a later date, but in the meantime the slides are available [here](https://www.slideshare.net/nats_io/writing-networking-clients-in-go-gophercon-2017-talk). If you have any questions or feedback, just let Wally know - he is easy to find on twitter ([@wallyqs](https://twitter.com/wallyqs)).

On Saturday - which is Community Day - we had a room from 10 - 1. It was packed full of a variety of speakers and we wanted to extend a huge thanks to Ashley McNamara, Dave Cheney, and others who came to talk about contributing to Go. As they emphasized - contributions come in all sorts; not only code. The open and engaging nature of the Go Community make it a great place to get involved whether that is via filing GH issues, commenting on open items, sharing blog posts, helping new Gophers with their questions, writing code, speaking at a meetup - you name it; there are all sorts of ways to get involved depending what you enjoy doing.

<div class="tweet-embed-con">
  <blockquote class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr">Panel with <a href="https://twitter.com/davecheney">@davecheney</a>, <a href="https://twitter.com/ashleymcnamara">@ashleymcnamara</a> and co. on contributing to Go at <a href="https://twitter.com/GopherCon">@GopherCon</a> Community Day. It&#39;s not just about code contributions. <a href="https://t.co/O7tARLCdAL">pic.twitter.com/O7tARLCdAL</a></p>&mdash; Tyler Treat (@tyler_treat) <a href="https://twitter.com/tyler_treat/status/886260296347566080">July 15, 2017</a></blockquote>
  <script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>
</div>

We also were fortunate to have a really in-depth demo by Gabe Monroy on the Deis team at Microsoft. He showcased NATS and Minio running on Kubernetes and shared a Helm Chart for NATS he’s been working on. You can find the sample app on Github [here](https://github.com/gabrtv/gophercon-demo).

<div class="tweet-embed-con">
  <blockquote class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr"><a href="https://twitter.com/gabrtv">@gabrtv</a> on running <a href="https://twitter.com/nats_io">@nats_io</a> and <a href="https://twitter.com/Minio">@Minio</a> with <a href="https://twitter.com/helm">@helm</a> on <a href="https://twitter.com/hashtag/kubernetes?src=hash">#kubernetes</a> <a href="https://twitter.com/hashtag/gophercon?src=hash">#gophercon</a> <a href="https://t.co/r2HnfcRXrL">pic.twitter.com/r2HnfcRXrL</a></p>&mdash; Nitish (@tiwari_nitish) <a href="https://twitter.com/tiwari_nitish/status/886268822939852800">July 15, 2017</a></blockquote>
  <script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>
</div>

We also were joined by Minio - who gave a deep dive on Minio and the design inspirations the product has drawn on, and how it solves various data problems in a simple and straightforward manner. There was a nice deep dive on Erasure Encoding and Blake 2 Assembly, and especially the recently added Minio Gateway. The Minio team have been doing some excellent work in the broader Go Community, so if you have any questions for them feel free to reach out to them on Twitter: ([@Minio](https://twitter.com/Minio))

<div class="row">
  <div class="col-md-8 col-md-offset-2">
    <div class="thumbnail">
      <img class="img-responsive center-block" alt="Architecture Diagram" src="/img/blog/gophercon-2017/02.png">
    </div>
  </div>
</div>

Wally Quevedo closed out Community Day with a deep dive on the NATS protocol, and some examples of monitoring NATS. If you want to check out the set up he discussed, that is available as VM with all the items pre-baked, [here](https://github.com/wallyqs/nats-gophercon-community-day).

<div class="tweet-embed-con">
  <blockquote class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr"><a href="https://twitter.com/wallyqs">@wallyqs</a> demonstrating <a href="https://twitter.com/nats_io">@nats_io</a> client setup <a href="https://twitter.com/hashtag/gophercon?src=hash">#gophercon</a> <a href="https://t.co/GrGlazeChl">pic.twitter.com/GrGlazeChl</a></p>&mdash; Nitish (@tiwari_nitish) <a href="https://twitter.com/tiwari_nitish/status/886289697072267264">July 15, 2017</a></blockquote>
  <script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>
</div>

As always, the GopherCon talks will be up on YouTube we are sure - but it is a huge amount of work to review, edit, and publish those so in the meantime if you wanted to find a particular talk you can check the Github repo [here](https://github.com/gophercon/2017-talks).

There were way too many talks that were excellent to have a ‘favorite’, and our team was impressed with all the talks we made it to. Some that stuck with us were the talk Liz Rice gave on Syscalls in Go which is available [here](https://github.com/gophercon/2017-talks/tree/master/LizRice-GoProgrammersGuideToSyscalls) and the talk by Kavya Joshi on Channels. At the time of drafting this, Kavya’s talk wasn’t available on the GH repo, but I think you’ll find her talk from Strangeloop on the Go race detector equally informative. It’s available [here](https://youtu.be/5erqWdlhQLA).

We’d like to again thank all of you who gave us feedback on NATS, asked questions, or simply came up to say hi - it was great to meet you all. And, to the organizers Brian Ketelsen and Erik St. Martin, as well as all the volunteers involved THANK YOU for all your hard work. It was another fantastic GopherCon. See you in 2018!

The NATS team

<div class="row">
  <div class="col-md-8 col-md-offset-2">
    <div class="thumbnail">
      <img class="img-responsive center-block" alt="Architecture Diagram" src="/img/blog/gophercon-2017/01.png">
      <div class="caption">
        <p><em>Wally Quevedo with the giant blue bear at the Colorado Convention Center</em></p>
      </div>
    </div>
  </div>
</div>

<br>
