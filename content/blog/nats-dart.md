+++
categories = ["Community","Engineering"]
date = "2019-01-02"
tags = ["client","dart","nats"]
title = "Guest Post: Dart Client for NATS"
author = "Chaitanya Munukutla"
+++

I think it was during early 2015 when I first heard the term *message broker*. I was pursuing my masters degree on P2P networking and had to simulate a steady throughput of incoming messages. I wasn't a geek then - so the workaround was to do an infinite `Thread.sleep()` loop. Don't groan - I was just 21.

RabbitMQ was my first tryst with the messaging systems lot. I was new to relationships and didn't have much to compare with, so RabbitMQ seemed just fine. But hosting it myself was a bit of a pain and I was also growing weary of Java. That was when I found PubNub - and God was it beautiful. I didn't need to handle anything; they had drivers lying around for virtually any environment you work with; and they had a free tier (this is when I disclose I'm from India and we hog free stuff better than anyone).

Disclaimer: I didn't want to find NATS - it was an accident.

There was this new foundation I read about - Cloud Native Computing Foundation, that seemed to be the new hip kid on the streets and just headed onto [cncf.io](https://cncf.io) to see if they have the stuff they boasted about. I then came across this new incubation project called NATS. They called it "messaging for microservices". Under the hood, it had the same message broker abstractions similar to the likes of RabbitMQ, ActiveMQ, Pubnub etc. So why should I switch? 

## Why NATS?

**Idiomatic approach**. So I was looking out for exciting new languages which seemed to like popping out of nowhere. I messed around with Golang, Swift, Kotlin, a bit of Python, C# and Erlang (yeah, I said it). The new languages seemed to bring their own idiomatic way of approaching programming. NATS seemed to bring a native approach with their simple and straightforward drivers. NATS has helped me learn Golang channels, RxJava, and the Erlang supervisor model.

**Powerhouse featues**. NATS is a workhorse. It elegantly handles pub-sub, request-response, queuing and streaming, even all at once!

**Piece of cake to deploy**. I can't overstate this - NATS is dead simple to deploy and manage. All it takes is to run `./gnatsd` on my terminal! Now beat that.

**Extremely power efficient**. I have benchmarked the crap out of NATS and it has never hogged more than 150MB of RAM to serve a 1 million payload inflow on a single host. FYI - a single Google Chrome browser hogs more.

**Bad ass performance**. If you haven't used NATS until now - stop reading and download the latest binary and give it a try. Flush the maximum load your PC can afford. NATS has got you covered. For all you NATS users, you know what I'm talking about.

## So why would I write a driver for NATS in Dart, of all languages?
tl;dr - Necessity is the mother of invention.

Simple; I was wriitng a Flutter app with some serverless triggers and NATS seemed to not have a Dart driver. So I wrote it!!

**Was it straight forward?** Yup it was. NATS has a freakishly  intuitive text-based protocol. So I all had to do was open a TCP socket and start sending byte streams :)

**What were the tricky parts?** Well, clustering. Though I've not browsed through the other drivers, porting over the subscriptions from one host to another when one host of a cluster goes down was a bit tricky. But Dart has the best streaming abstractions with the `Future` and `Stream` classes. So once you get the hang of it, it's a cake walk.

**Why Dart?** I personally think Dart is going to be the Superman of programming languages in the next 3-5 years. Google is betting heavily on Flutter; Dart can now be used to develop server, iOS, Android, MacOS, Linux and Windows apps from a shared codebase; the Flutter team is now bringing Flutter to the web with their **Hummingbird** project. So I guess Google won't let me down.

## Summary
You won't find anything this awesome in the messaging space like NATS anytime soon. The emphasis it lays on cloud native operation, clustering and lightning fast message delivery is nothing short of mind-blowing. So I recommend everyone to give it a try in the language of your choice.

And any Dart/Flutter devs out there, please checkout [nats-dart](https://github.com/munukutla/nats-dart) on Github and let me know if it's good to go. 

A big hug to my brother for testing the driver with the NATS protocol rigorously. Check out his profile on instagram [just_call_me_gowtham](https://www.instagram.com/just_call_me_gowtham/). He takes pictures better than he writes code.