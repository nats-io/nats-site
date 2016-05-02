+++
date = "2016-05-03T09:00:56+10:00"
draft = true
title = "Scaling NATS for Education"
categories = ["Community"]
author = "Matt Farmer"
+++

Our NATS-powered Validation Services in Action

![drawing](/img/blog/nias-nats-screenshot.png)


I'd like to focus for this blog on what NATS has helped us to achieve. There are a whole set of other great entries on this site looking at various aspects of technical implementations, and the NATS community as a whole is incredibly responsive and helpful; so if you have questions about how to do something just have a read around here, and you can always ask a question in the NATS Slack channel for pretty much immediate gratification.

For this post, though, I want to look at what using NATS has eanbled us to do, which wasn't really possible before - I'm hoping our example might make it clearer quite why you would choose to use NATS in the heart of your product if you face business needs in any way like ours.

First a bit of background on who we are. I work for a small government unit here in Australia called [NSIP](http://www.nsip.edu.au); The National Schools Interoperabiltiy Program, you can tell we're a government unit from the catchy name.
We're funded by both the federal government and the states and territories to try and ensure that technology in education can achieve the best outcomes for students by allowing data from the multitude of possible sources - web applications, assessment programs, classroom apps, student administration systems - to work together to give a coherent view of the learner.

A lot of our work is in the policy and architecture space [Learning Services Architecture](http://slides.com/nsip/lsa-nov-2015), and a key part of our success is that we work hard with the ed-tech community of solution vendors here in Australia to get agreement on how to make this happen - we don't just invent ideas in a vacuum, and every initiative is road-tested with the ppeople who have to actually do the real work to ensure that we all move forwards in a collaborative and effective way.

So where does the technology come in? Well, first of all we're not a product house. We don't create things that you can buy, or provide services that you can run.

Where we intersect in the technology space is to identify those structural gaps that need tools to fill them, to create those tools as open source components, and then make them available to all our stakeholders to use in solving problems; especially problems in the integration space. Integration problems are some of the hardest to address structurally since it can often be the case that it's not clear in a classic market relationship quite who has responsibility for solving them - vendors rightly will concetrate on putting new features into their product sets, but who creates the links to other packages or data sources, and what's the incentive to do so.

We can't provide any direct incentives, but what we can do is create open source tools to solve those problems and then make them available to everyone to embed or use as easily as possible.

Our latest toolset is a suite of services that provide a whole bunch of useful integration tools. In the popular language of today you could call it a micro-services architecture. My only hesitation in actually calling it that is that I feel increasingly like the Will Munny character in 'Unforgiven' - "I've sent messages across every protocol that walks or crawled at one time or another" - I fell in love with message-based architectures a long time ago, have always felt them to be inherently helpful in dealing with complex problems, and here we all are in the wondeful world of reactive systems. 

I'm truly glad that the rest of the world has caught up with us queue-junkies, but sometimes with a little bit of that feeling when the obscure band you loved suddenly gets famous and everybody else loves them too. Okay, enough with grizzled neck-beard nostalgia - if everyone loves messaging that's all to the good with me.

Our toolset is known as NIAS (NSIP Integration as A Service), and I want to talk about one particular subset of those services and how NATS has helped us.

Each component of NIAS is a standalone utility that does something useful, and all of the services communicate over a messaging backbone; NATS and soon STAN as well.

There's a whole bunch of these services; Privacy Filtering, a small 'graph' datastore that links entities from different inbound data models, lightweight analytics, and the set I want to focus on here that specialise in data validation.

So here's our validation scenario. Schools and school authorities need to register students for online national assessment. For that to work well, there's a whole set of business conditions that need to be tested. Are students in the right year groups for the  tests based on their birthdates, are there duplicate records for students, are they enrolled in more than one school, does the suplied data match the required schema for structure and content etc. etc.

Modelling and implementing each of these as a discete validation service makes them nice and easy to reason about. By running them all against a messaging backbone and using queue groups in NATS it becomes easy to run all of the validations in parallel, and on top of the raw NATS performance the end result for the user is a very quick validation cycle.

So far, so good, we've covered two of the great features of NATS; it makes micro-services easy to construct, and it's performance means that most people don't even know they are using a message-driven stack.

But here's the aspect I really wanted to highlight from our experience, the ability to deploy at ALL scales without changing anything in our architecture.

As we don't run services, our tools need to be able to run in every possible user configuration.

This means that the package of services and gnatsd are just a single set of binaries. For many of our users they take that group of binaries and with the magic of a batch/shell script, they simply run it as a standalone desktop application.

An operation such as schema validation can be resource intensive. Want to give it some more processor power; just start more instances of the schema validator service. Queue groups mean instant parallel processing.

Want to really spread the load, just start each of the services on different machines.

Want to run enough services for a full state-level implementation, just put groups of services on the hardware that you want, literally just start them up where you want them to be.

Want to have dedicated process clusters on behalf of states or jurisdictions, such as specialised handling for all schools in the Catholic sector, just start a bunch of the services and give them approriate names.

The beauty of all this. No-one has to know anything about the system configuraiton in order to do this.

For us one of the greatest strengths of NATS is not just the performance and the stability, it's the overarching philosophy of providing really helpul, pragmatic real world behaviour out of the box.

I love messaging patterns, they really help especially in the integraiton space. The thought that in order to get that benefit for a standalone user would mean providing install instructions for a typical enterprise messaging backbone would make such an approach just untenable in terms of support for a small team like ours.

Yet here we are, one simple codebase (yay Golang), that is ready to deploy on any target system; Windows, Mac, Linux, and yet can be configured for every possible topology required from single user desktop application, all the way through to massively distributed and horizontally scaled. And thanks to NATS no-one has to know how to do anything other than start up the services they want.

You could rightly point out that some of the benefit comes from choosing the right architectural model, micro-services, reactive patterns etc., and that would be true. The great thing about NATS is that it makes those choices something that can be operationalised and repeated at ALL scales with the very minimum of effort.

That makes a huge difference when you are a small team trying to solve difficult problems so that others can benefit. The raw engineering of NATS is truly impressive and we love the performance, but its the fact that we can scale our tools to meet any possible usage scenario from single-user to cloud-scale without having to rethink our architecture or deployment that makes NATS a crucial differentiator for us.

You can find all of our stuff (rough and ready though it may be) on our Github account [NSIP Github](https://github.com/nsip/), and we are always keen to share and help especially those of you out there also in the ed-tech domain.
       

























