+++
date = "2024-03-26"
draft = false
title = "Nothin' but NATS - Building Natster"
author = "Kevin Hoffman"
categories = ["Engineering"]
tags = ["nothin-but-nats", "natster", "nex", "demo", "reference"]
+++

This is the first post in a new series where we explore patterns, practices, and samples of applications built using nothing but features available from NATS. We take a critical look at dependencies and frameworks and ask, _"Do we really need the extra complexity?"_. If we're already using NATS, then what would it be like to use nothing but our NATS infrastructure for application development?

## Introducing Natster
[Natster](https://docs.natster.io) is an open source reference application that illustrates how to build a secure media sharing platform that leverages core NATS primitives for things we might otherwise get from third party applications, platforms, or libraries.

There are plenty of media sharing applications out there, but one feature we really wanted was the ability to keep our files on our own devices (e.g. "on-prem"). We wanted to make sure that we could _securely_ share media with our friends without uploading files into a cloud.

Natster users are [Synadia Cloud](https://cloud.synadia.com) users. When you sign up for a free Synadia Cloud account, you can download the `natster` CLI and start playing with it.

To get started, developers run `natster init` by supplying their Synadia Cloud personal access token, and then they can run `natster login` to be able to use the [Natster](https://natster.io) website.

Sharing (and un-sharing) is done via the CLI and user media catalogs are only ever available when they're running `natster catalog serve`. The catalogs aren't cached and the file contents are all encrypted, so the moment a user stops their catalog server, no one has access to their media.

Natster even supports media streaming from the website, which decrypts media streams in real time.

## Natster Design

<img class="img-responsive center-block" alt="Natster UI" src="/img/blog/nbn-building-natster/natster-01.png">

In this section we'll cover the base Natster design. For the full details make sure you check out the [official Natster docs](https://docs.natster.io). At every stage of design, we asked ourselves if we needed some other product or service or if we could use _"nothin' but NATS"_.

### Decentralized Security
Every time we sit down to build a new application, chances are we need to figure out how we're going to manage users. This inevitably sends us spiraling down into the rabbit hole of building or buying yet another user management system, dealing with both authentication and authorization, and ensuring that the proper security boundaries exist between user data and messaging traffic. Just thinking about having to build that from scratch (again) gives me a headache.

But since we're already using NATS, we can leverage its [account security](https://docs.nats.io/running-a-nats-service/configuration/securing_nats/auth_intro/jwt) system. When we use accounts as security boundaries, we get an enormous amount of powerful functionality for free.

In the case of Natster, each user corresponds to a single NATS account managed by Synadia Cloud. The `natster` CLI performs all of its actions simply by logging into the global Synadia Cloud (`connect.ngs.global`) NATS system as a user within that account. Developers are free to choose whatever restrictions or abilities they want for their CLI user, including setting an expiration for the user.

### Leveraging Imports and Exports
Natster is a secure media sharing platform. Whenever I think about securely sharing data between two parties, my mind is immediately drawn to the NATS import and export system. Rather than having to build our own authorization system on secure data sharing from scratch, we simply built the Natster sharing on top of imports and exports.

When a Natster user is created, a wildcard export for their media catalogs is created in the account. Sharing their catalog with another user is done by supplying the target user's account's public key. The host of the NATS cluster (in this case Synadia) doesn't need to be involved at all.

When a Natster user wants to import a catalog (there's even an `inbox` that shows pending share invites!) this creates an [import](https://docs.nats.io/running-a-nats-service/nats_admin/security/jwt#connecting-accounts) in their account. 

The catalog server is a request/reply service that can be used over service-type imports while the media streaming functionality is exposed through a stream-type import.

Quite possibly one of the coolest features of imports is the notion of _subject mapping_ combined with the _account token position_ option. This can be used to force importers to use their account public key on the subject used by the exporter. When the token position setting is enforced, NATS _guarantees_ that the account key used on the subject is the one doing the import.

Put another way, NATS automatically prevents a whole type of attack vector where one account tries to pretend to be another in order to exfiltrate data.

### Single-Use Xkeys for Encryption
Even though we already have great core security by leveraging NATS, one of the other requirements for Natster was that no media would ever be transmitted without encryption. This would guarantee that not even administrators from Synadia would be able to see a shared file's contents.

NATS already makes use of **Xkeys**, a special type of **Nkey** that is used for targeted, one-way encryption. By leveraging the xkey system, it was remarkably easy to encrypt the media streams in transit with single-use disposable keys that could _only_ be used by the intended recipient.

### Supplying a Global Service
While Natster is peer-to-peer, we wanted the ability to keep track of anonymous statistics as well as provide a few pieces of functionality to Natster's web UI. We didn't need to _publicly_ expose or even host a service anywhere. In traditional apps, we'd have to figure out how to deploy this service and then how to ensure that clients had access to it globally without breaking security.

None of this was a concern with NATS. The global service is just another service that is exposed via export in a completely unprivileged account on Synadia Cloud. The idea that any Synadia Cloud user can share services and streams with any other Synadia Cloud user is both powerful and underrated. The possibilities for new application types that use this feature are endless.

No firewall ports needed to be opened, no complicated ingress controllers or load balancers needed to be used. Any Synadia Cloud account can import the global service and make use of it.

### Event Sourcing with NATS
Event sourcing is the notion that an application's state is derived from an ordered sequence of immutable events. In addition to knowing the current state, event sourcing lets you know _how_ that state came about and lets you change how you build state without changing your source of truth.

Every time someone shares or unshares a catalog, binds their CLI to their web login, or takes any other action that effects state, the Natster global service writes to an event stream, which is nothing more than a persistent JetStream stream.

Each service (or function) that produces derived state has its own JetStream consumer on this stream, allowing them all to process at different speeds and fail/recover independently of each other. This design also makes it easy to change the state generation logic and then replay a consumer to rebuild the state.

Dozens of videos and blogs (or even books) could be written on the subject of event sourcing and how NATS and JetStream supports it.

## Building Natster
Building Natster took 3 developers 3 weeks of part-time coding, followed by a week of shakedown after code and feature freeze. While we don't have an exact figure, we can say for certain that had we needed to go in search of separate things to deal with authentication, authorization, messaging, secure sharing, centralized service hosting, event sourcing, data storage, and everything else we got from NATS, it would've taken many times as long to build the service and would've been significantly more frustrating.

Our original plan for the demo/reference application was to support simple downloads only. However, we gained so much extra time from leveraging NATS that we were able to build in dynamic media streaming and create a compelling web UI without sacrificing quality.

## Wrapping Up
We encourage you to take a look at the [Natster](https://github.com/synadia-labs/natster) Github repository as well as read the [documentation](https://docs.natster.io) and to stay tuned to our various channels for more related content.

We intend to keep the application available going forward and continue to refine it. Our conclusion from this experiment was that using _nothin' but NATS_ made our development faster, easier, simpler, and even more enjoyable.

None of us want to build applications any other way from now on.

## About the Author
Kevin Hoffman is an Engineering Director at [Synadia Communications](https://synadia.com). He has devoted most of his career to building distributed systems and making it easier and _fun_ for developers to do the same.