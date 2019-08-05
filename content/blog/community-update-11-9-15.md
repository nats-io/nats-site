+++
categories = ["Community"]
date = "2015-11-09T10:27:09-08:00"
tags = ["london", "community update"]
title = "Community Update at The London NATS User Group Meetup"
author = "Brian Flannery"
+++

The audience at the London Meetup was great! We had many local companies represented, and some of the leaders of other meetups such as Alexandre González Rodríguez (one of the organizers of the [Go London](https://www.meetup.com/GO-London/)! Meetups), and Milos Gajdos (co-organizer of the [Kubernetes London](https://www.meetup.com/Kubernetes-London/) Meetups) present as well. I enjoyed meeting everyone, and getting your feedback after the talks.

My talk was focused primarily on:

- What is NATS? Some meetup members were new to NATS, so in a nutshell, NATS boils down to simplicity and mind-blowing speed. Raul Perez had a great anecdote in his talk about how fast NATS was, even on his Macbook Air, where NATS nearly “melted” his machine!
- Some performance characteristics of NATS, where I discussed some benchmarks from [Tyler Treat’s blog](https://bravenewgeek.com/) and also from CenturyLink’s [ImageLayers.io](https://imagelayers.io/) tool, which David Williams explained nicely in a recent tweet:
<div class="tweet-embed-con">
  <blockquote class="twitter-tweet" data-conversation="none" lang="en"><p lang="en" dir="ltr"><a href="https://twitter.com/jdsboston">@jdsboston</a> <a href="https://twitter.com/brianflannery">@brianflannery</a> Layers how simple NATS image is: a Go binary, config file, and Docker params: <a href="https://t.co/lHBVSraTJb">https://t.co/lHBVSraTJb</a></p>&mdash; David Williams (@DavWilliams) <a href="https://twitter.com/DavWilliams/status/653754289123266560">October 13, 2015</a></blockquote>
  <script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>
</div>

- Finally, we covered some recent updates in the NATS community:
  - Great monitoring tools such as [Natsboard](https://github.com/cmfatih/natsboard) and [Natsmon](https://github.com/repejota/nats-mon)
  - New clients from the community such as Rust and Lua, and supported ones like the [C Client](https://github.com/nats-io/cnats) by Apcera, as well as integrations with tools like [Symfony 2](https://github.com/octante/OctanteNatsBundle).
  - New [NATS.io website](https://github.com/nats-io/nats-site)! New [docs](https://nats.io/documentation/) section, new content across the site, and most importantly, it is all open source! If you’d like to update content, do so via GoHugo, and send us a PR we’re looking forward to reviewing those!

I’m looking forward to more of you diving into the NATS community, and we are here to help with any questions, comments, etc. -- don’t hesitate to contact us! The [NATS Community Page](https://nats.io/community/) has more info on the Google Group, which I recommend everyone joins!

Thanks again to [Maker’s Academy](https://www.makersacademy.com/) for hosting, and to all who were able to attend. For those who couldn’t make this one, we hope to see you at the next one!
