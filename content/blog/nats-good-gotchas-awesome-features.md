# nats-good-gotchas-awesome-features

+++ categories = \["Community", "Engineering"\] date = "2017-07-01" tags = \["nats", "guest post", "storageos"\] title = "Guest Post: StorageOS on how and why they use NATS in their storage platform" author = "Karolis Rusenas" +++

Over the last two years, I have used [NATS](http://nats.io) extensively in many projects. In this blog post I would like to highlight some pros and cons to help you decide whether NATS is the right tool for you.

At [StorageOS](http://www.storageos.com/), we are building a system that provides [persistent storage for containers](https://storageos.com/why-containers-miss-a-major-mark-solving-persistent-data-in-docker/). StorageOS enables users to deploy database workloads inside containers and use local node storage without the fear of losing data and without frustration of slow disks.

Our current architecture looks like this:

![Architecture Diagram](https://github.com/nats-io/nats-site/tree/c42c46a7c6b8669e66e28419887d2f8dd29aa502/img/blog/nats-good-gotchas-awesome-features/architecture-overview-diagram-v8-nats.png)

We have used NATS right from the initial prototype, relying on it to transmit system level events like volume creation and deletion between nodes.

## The good

Over the years NATS remained focused on delivering a simple way to publish and receive messages. It’s remarkable that the interface hasn’t really changed in the last two years, meaning that you can usually integrate and forget about it \(at least for a while!\)

Other things I like about NATS:

* **Embeddable**. It’s trivial to embed the NATS server into your Go binary so you don’t have to run it separately. Early on we embedded a NATS server into the StorageOS binary, making it a breeze to deploy our solution.
* **Auto discovery**. A really cool feature to discover routes to other servers makes clustering bliss. By combining auto discovery with embedded server, you can get a pretty good mesh network between your nodes. Kudos to the NATS dev team for this feature!
* **No-fuss pub/sub**. Some platforms/tools that provide pub/sub functionality have weird ceremonies of creating topic and subscriptions prior to using them. With NATS, it’s as simple as deciding what kind of topic you want to publish to and just publishing, nothing more. Our implementation is much cleaner, without any additional steps needed to ensure that certain topics and subscriptions exist before dispatching payloads.
* **Optional persistence**. The NATS server provides the ability to persist messages to ensure their delivery. This feature is optional, making the NATS server lighter for users like StorageOS that don’t need this functionality, which is good for everyone.

## Gotchas

There aren’t many tools that can do everything, and usually the ones that do too much are bad ones. When you keep adding more and more useless features, at some point your application becomes too complicated, riddled with bugs and it’s just easier to burn it than fix that monstrosity.

![Architecture Diagram](https://github.com/nats-io/nats-site/tree/c42c46a7c6b8669e66e28419887d2f8dd29aa502/img/blog/nats-good-gotchas-awesome-features/star-wars-meme.png)

_The jedi defense engineers tried to explain scope creep, but the emperor just wasn’t listening._

So even though these features are what I see missing from NATS, it doesn’t necessarily mean that they should be added! But you should be aware of them before you start integrating NATS into your system.

* **Lack of proper authentication**. The current authentication method in NATS is not intended for end-users, and there is no way to dynamically add/remove users to NATS server. This feature would be very useful for people who would want to distribute client applications that connect to a main server via the NATS protocol. I have seen some people modifying gnats server code, but it might not be a future proof solution. My suggestion here would be to provide a pluggable authorization interface with a simple default implementation, but let users easily supply their own implementations.
* **Shallow context integration**. This clashes with my “the good” part regarding extremely stable API, but I believe that cancellable PublishRequest would be a great addition to NATS. Quite recently NATS team added a function to make a request with context, but it only stops waiting for response. It would be interesting to see the context being passed to the subscriber and notify it to stop any work being done.
* **Large message sizes**.  Large message sizes.  Well, you shouldn’t share movies or images over NATS as it’s meant for small messages but sometimes you just need to. One way to send a large \(&gt;1MB\) message is to pass a pointer to an object store from where to retrieve it, but this requires maintaining a separate object store. It would be more convenient to send large payloads directly when needed.

## The awesome features

Of course NATS is awesome! If it wasn’t, we wouldn’t be using it and you wouldn’t be reading this article :\). NATS has some major advantages over other messaging queues. It elegantly combines three important ways of messaging into a single library:

1. **Asynchronous pub/sub** \(broadcast to all\). Great when you need to inform your cluster about certain changes. We use it during volume provisioning when we need to inform the whole cluster about updated volume configuration. Since StorageOS provides a global namespace to access volumes, any node can access any volume in the cluster through our “virtual volumes” and these virtual volumes get configuration through NATS. It’s very fast and very efficient – awesome.
2. **Asynchronous pub/sub queues** \(one message to the first subscriber in the queue\). Perfect when you want only one worker to get the message. If you had a hundred workers that constantly dequeue messages, this feature removes some of the need for locking/orchestration code. And any code that you don’t have to write is bug free. 🙂
3. **Synchronous requests**. My favourite one! Sometimes a function making a request to another node needs to know right away whether that node succeeded or failed to process the message. That’s where PublishRequest comes in. Requests are heavily utilised by the StorageOS internal scheduler, which orchestrates and provisions volumes in the cluster. It needs to know whether the request to a node where the master volume is going to be deployed succeeded, because if it wasn’t there is no point in configuring replicas or virtual volumes.

An especially important point is that the whole stack \(server and client\) is under the Apache-2.0 license. When you consider embedding anything inside your product, licensing is crucial.

## Conclusion

If you want a battle tested messaging system between your cluster nodes, I would definitely recommend NATS, which despite being in the community for a long time has done a great job of avoiding feature creep and bloat.

Alternatively, if you need tightly controlled authentication, RBAC and also controlling subscriber amount based on account IDs, I would recommend gRPC & protocol buffers.

As a bonus tip, I suggest putting all your NATS related functions in a separate package to avoid directly using NATS types/functions throughout your codebase. This will enable you to replace or enhance NATS functions with additional functionality/protocols if needed. In our case this approach helped as early on to persist certain messages to key/value store before dispatching them.

