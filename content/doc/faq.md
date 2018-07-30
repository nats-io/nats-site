+++
title = "NATS Frequently Asked Questions"
category = "concepts"
[menu.main]
  name = "FAQ"
  weight = 3
  identifier = "doc-faq"
  parent = "Getting Started With NATS"
+++

### General

* [What is NATS?] (#NATS)
* [What language is NATS written in?] (#gnatsdlang)
* [Who maintains NATS?] (#maintainer)
* [What clients does NATS support?] (#clients)

### Technical Questions

* [What is the difference between Request() and Publish()?] (#reqvspub)
* [Can multiple subscribers receive a Request?] (#multresponse)
* [How can I monitor my NATS cluster?] (#monitor)
* [Does NATS do queuing? Does NATS do load balancing?] (#queuegroups)
* [Can I list the subjects that exist in my NATS cluster?] (#listsubj)
* [Does NATS support subject wildcards?] (#wildcards)
* [What do ‘verbose’ and ‘pedantic’ mean when using CONNECT?] (#verbose)
* [Does NATS offer any guarantee of message ordering?] (#ordering)
* [Is there a message size limitation in NATS?] (#msgsize)
* [Does NATS impose any limits on the # of subjects?] (#numsubj)
* [Does NATS guarantee message delivery?] (#gmd)
* [Does NATS support replay/redelivery of historical data?] (#historical)
* [How do I gracefully shut down an asynchronous subscriber?] (#unsubscribe)
* [How do I create subjects?] (#createsubjects)

## General

### <a name="NATS"></a>What is NATS?
NATS is an open source, lightweight, high-performance cloud native infrastructure messaging system. It implements a highly scalable and elegant publish-subscribe (pub/sub) distribution model. The performant nature of NATS make it an ideal base for building modern, reliable, scalable cloud native distributed systems.

NATS is offered in two interoperable modules: the core NATS platform (referred to simply as "NATS" throughout this site), and [NATS Streaming](/doc/streaming/nats-streaming-intro/), an event streaming service that can be employed to add event streaming, delivery guarantees, and historical data replay to NATS.

NATS was created by Derek Collison, who has over 20 years designing, building, and using publish-subscribe messaging systems. NATS is maintained by an amazing OpenSource Ecosystem, find more at  [GitHub](https://www.github.com/nats-io).

__What does the NATS acronym stand for?__

Ask a NATS maintainer at one of the many meetups and conferences we attend to discover the mystery and lore behind the NATS acronym.

### <a name="gnatsdlang"></a>What language is NATS written in?

The NATS server (`gnatsd`) is written in Go. There is client support for a wide variety of languages. Please see the [Download](/download/) page for more info.

### <a name="maintainer"></a>Who maintains NATS?

NATS is sponsored and supported by Synadia, a company founded by Derek Collison. The Synadia team maintain the NATS server, as well as the Go, Ruby, Node.js, C, C#, Java and several other client libraries. Our very active user community also contributes client libraries for several other implementation languages. Please see the [download](/download/) page for the complete list, and links to the relevant source repositories and documentation.

### <a name="clients"></a>What client support exists for NATS?

Please see the [Download](/download/) page for the latest list of Synadia- and community-sponsored NATS clients.

## Technical Questions

### <a name="reqvspub"></a>What is the difference between Request() and Publish()?

Publish() sends a message to `gnatsd` with a subject as its address, and `gnatsd` delivers the message to any interested/eligible subscriber of that subject. Optionally, you may also send along a reply subject with your message, which provides a way for subscribers who have received your message(s) to send messages back to you.

Request() is simply a convenience API that does this for you in a pseudo-synchronous fashion, using a timeout supplied by you. It creates an INBOX (a type of subject that is unique to the requestor), subscribes to it, then publishes your request message with the reply address set to the inbox subject. It will then wait for a response, or the timeout period to elapse, whichever comes first.

### <a name="multresponse"></a>Can multiple subscribers receive a Request?

Yes. NATS is a publish and subscribe system that also has distributed queueing functionality on a per subscriber basis. When you publish a message, for instance at the beginning of a request, every subscriber will receive the message. If subscribers form a queue group, only one subscriber will be picked at random to receive the message. However, note that the requestor does not know or control this information. What the requestor does control is that it only wants one answer to the request, and NATS handles this very well by actively pruning the interest graph.

### <a name="monitor"></a> How can I monitor my NATS cluster?

There are several options available, thanks to the active NATS community:

* [nats-top](https://github.com/nats-io/nats-top) is a top-like monitoring tool developed by Wally Quevedo of Synadia.

* [natsboard](https://github.com/cmfatih/natsboard) is a monitoring tool developed by Fatih Cetinkaya.

* [nats-mon](https://github.com/repejota/nats-mon) is a monitoring tool developed by Raül Pérez and Adrià Cidre.

A more detailed overview of monitoring is available under [Server Monitoring](/doc/managing_the_server/monitoring/).

### <a name="queuegroups"></a>Does NATS do queuing? Does NATS do load balancing?

The term 'queueing' implies different things in different contexts, so we must be careful with its use. NATS implements non-persistent distributed queuing via subscriber queue groups. Subscriber queue groups offer a form of message-distribution load balancing. Subject subscriptions in NATS may be either 'individual' subscriptions or queue group subscriptions. The choice to join a queue group is made when the subscription is created, by supplying an optional queue group name. For individual subject subscribers, `gnatsd` will attempt to deliver a copy of *every* message published to that subject to *every* eligible subscriber of that subject. For subscribers in a queue group, `gnatsd` will attempt to deliver each successive message to exactly *one* subscriber in the group, chosen at random.

This form of distributed queueing is done in real time, and messages are not persisted to secondary storage. Further, the distribution is based on interest graphs (subscriptions), so it is not a publisher operation, but instead is controlled entirely by `gnatsd`.

### <a name="listsubj"></a>Can I list the subjects that exist in my NATS cluster?

NATS maintains and constantly updates the interest graph (subjects and their subscribers) in real time. Do not think of it as a "directory" that is aggregated over time. The interest graph dynamic, and will change constantly as publishers and subscribers come and go.

If you are determined to gather this information, it can be indirectly derived at any instant in time by polling the monitoring endpoint for /connz and /routez. See [Server Monitoring](/doc/managing_the_server/monitoring/) for more information.

### <a name="wildcards"></a>Does NATS support subject wildcards?

Yes. The valid wildcards are as follows:

The dot character `'.'` is the token separator.

The asterisk character `'*'` is a token wildcard match.

 	e.g foo.* matches foo.bar, foo.baz, but not foo.bar.baz.
The greater-than symbol `'>'` is a full wildcard match.

	e.g. foo.> matches foo.bar, foo.baz, foo.bar.baz, foo.bar.1, etc.

### <a name="verbose"></a>What do ‘verbose’ and ‘pedantic’ mean when using CONNECT?

‘Verbose’ means all protocol commands will be acked with a +OK or -ERR. If verbose is off, you don't get the +OK for each command.
Pedantic means the server does lots of extra checking, mostly around properly formed subjects, etc. Verbose mode is ON by default for new connections; most client implementations disable verbose mode by default in their INFO handshake during connection.

### <a name="ordering"></a>Does NATS offer any guarantee of message ordering?

NATS implements source ordered delivery per publisher. That is to say, messages from a given single publisher will be delivered to all eligible subscribers in the order in which they were originally published. There are no guarantees of message delivery order amongst multiple publishers.

### <a name="msgsize"></a>Is there a message size limitation in NATS?

NATS does have a message size limitation that is enforced by the server and communicated to the client during connection setup. Currently, the limit is 1MB.

### <a name="numsubj"></a>Does NATS impose any limits on the # of subjects?

No. As of `gnatsd` v0.8.0, there is no hard limit on the maximum number of subjects.

### <a name="gmd"></a>Does NATS guarantee message delivery?

NATS is offered as two components: the basic platform (referred to simply as "NATS") and [NATS Streaming](/doc/streaming/nats-streaming-intro/), which is a data streaming service based on NATS.

- **NATS** implements what is commonly referred to as "at-most-once" delivery. This means that messages are guaranteed to arrive intact, in order from a given publisher, but not across different publishers. NATS does everything required to remain on and provide a dial-tone. However, if a subscriber is problematic or goes offline it will not receive messages, as the basic NATS platform is a simple pub-sub transport system that offers only TCP reliability.

- **[NATS Streaming](/doc/streaming/nats-streaming-intro/)** offers _at-least-once_ delivery guarantees by implementing publish and delivery acknowledgements, and persisting messages to memory or a secondary store until messages have been successfully delivered, or until resource limits or other administrator-defined limits have been reached.

### <a name="historical"></a>Does NATS support replay/redelivery of historical data?

Yes, historical data may be persisted to memory or secondary storage and replayed using [NATS Streaming](/doc/streaming/nats-streaming-intro/), an event streaming service based on (and compatible with) NATS.

### <a name="unsubscribe"></a>How do I gracefully shut down an asynchronous subscriber?

To gracefully shutdown an asynchronous subscriber so that any outstanding MsgHandlers have a chance to complete outstanding work, call sub.Unsubscribe().
There is a Go routine per subscription.
These will be cleaned up on Unsubscribe(), or upon connection teardown.

### <a name="createsubjects"></a>How do I create subjects?

Subjects are created and pruned (deleted) dynamically based on interest (subscriptions).
This means that a subject does not exist in a NATS cluster until a client subscribes to it, and the subject goes away after the last subscribing client unsubscribes from that subject.
