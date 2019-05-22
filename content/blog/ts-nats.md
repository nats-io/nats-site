# ts-nats

+++ categories = \["Clients"\] date = "2018-08-09" tags = \["typescript", "node", "community update", "engineering", "javascript", "ES5", "ES2017"\] title = "Typescript NATS" author = "Alberto Ricart" +++

## Ode to Node-NATS: Ts-NATS - the TypeScript _native_ NATS for Node.

On December 23, 2011, [Derek Collison](https://www.linkedin.com/in/derekcollison/) gave us [node-nats](https://github.com/nats-io/node-nats) \(Node.js v0.06\). Node-nats is the second oldest client for NATS; only [ruby-nats](https://github.com/nats-io/ruby-nats) is older \(10/30/2010\). Node-nats is arguably one of the most popular NATS clients sporting over 64K monthly downloads.

Over the last year or so, we have been getting requests here and there to _promisify_ the library. While on the surface these seem like syntactic sugar, changing node-nats to offer Promise and Async support requires a bit more. Because of its long history, node-nats was initially developed at a time where the standard callback patterns were not necessarily standard. Most arguments are optional, with the library performing shifting and testing that the argument order is correct. To complicate matters, node-nats offers additional options to support legacy request-reply patterns which further bloat the library and complexify its maintenance.

JavaScript has evolved. I have been working with JavaScript since ancient times on products like LiveWire that only Brendan Eich and I remember. LiveWire was Netscape's answer to writing CGI on the server when Perl was the defacto-standard. Fast-forward to Node, and JavaScript has become the ubiquitous platform. Modern JavaScript looks and feels much different than it did back then, with arguably the most interesting changes in the last three years.

December 2009 brought ES6 with support for Promises, Arrow Functions, and default parameter values. We traded callbacks for Promise Hell. 2017 brought ES8 with Async functions support. Our brains are once again able to scan a function and potentially understand its arcs of execution.

At the same time, a new JavaScript-like language has emerged with meteoric popularity: [TypeScript](https://www.typescriptlang.org/). Its popularity is not undeserved. TypeScript elevates JavaScript several notches. With TypeScript we can write better JavaScript: Tooling helps us write correct code; refactoring code is possible and safer, and compiler warnings keep us honest. In all tiny buy-in risk, with tremendous potential for increased reliability and developer experience.

If we are going to adopt ES new paradigms, now is likely as good time as any to also adopt TypeScript.

## Introducing TS-NATS

Today I introduce you [ts-nats](https://github.com/nats-io/ts-nats). It is an evolution and simplification of node-nats. Most parts have been completely rewritten from scratch, enabling a more straightforward API for NATS on node. Of course, it is written in TypeScript which will help us have more tooling support while evolving the library.

And yes, it supports Promises, async functions, default parameters. The API was normalized, simplified and minimized. A four-line subset of the API will more than suffice to show the changes:

### First a refresher on how node-nats does it:

```javascript
let nats = NATS.connect();

let sid = nats.subscribe(subject, options, (data, reply, subject, sid) => {
    ...
});

let rid = nats.request(subject, data, options, (data, reply, subject, sid) => {
    ...
});

nats.flush(() => {
    ...
});
```

### And here is how ts-nats does it:

```typescript
let nats = await connect();

// returned subscription object provides methods to manage the subscription
let sub = await nats.subscribe(subject, (err, msg) => {
    ...
}, options);

// No callback required, the promise will resolve into a response or reject into an error
let msg = await nats.request(subject, timeout, data);

await nats.flush();
```

Keen eyes will have noticed that message handling callbacks are normalized, and now sport only two arguments. The first complies with node callback standards; the second is an object encapsulating a message. [Msg](https://nats-io.github.io/ts-nats/interfaces/_nats_.msg.html) objects have four properties:

* `data` the optional message payload 
* `reply`  an optional reply subject if one is provided
* `subject` the subject used to publish the message
* `sid` the subscription id \(useful for debugging\)
* `size` the number of bytes as defined by `Buffer.byteSize()` in the payload.

  [Subscription](https://nats-io.github.io/ts-nats/classes/_nats_.subscription.html)s are also full-blown objects. A resolved subscription offers:

* `setTimeout()` - register the number of millis to wait for the subscription to get a message \(or expected messages\)
* `hasTimeout()` - true if it has a timeout
* `cancelTimeout()` - cancel any timeout
* `getReceived()` - returns the count of messages processed by the subscription
* `getMax()` - number of messages expected. Subscription auto-cancels after.
* `isCancelled()` - true if the subscription is cancelled.

## Events

Naturally, it is a node API, and ts-node offers event notifications:

* `close` connection closed
* `connect` client connected
* `connecting` client is attempting to connect
* `disconnect` client disconnected
* `error` the ubiquitous error handler
* `permissionError` client tried to publish or subscribe to a subject for which it has no permissions
* `reconnect` - client reconnected
* `reconnecting` - the client is attempting to reconnect
* `serversChanged` - cluster information received from the server
* `subscribe` - new subscription created by the client
* `unsubscribe` - a subscription was auto-unsubscribed \(expected messages were received\)
* `yield` - client exceeded message processing time, the client will yield to node I/O processing.

## Other benefits

* [Better documentation](https://nats-io.github.io/ts-nats/modules/_nats_.html)
* No 3rd party dependencies
* Lots of tests and faster running tests thanks to [AVA](https://github.com/avajs/ava)

## Performance

On an iMac default tests are not too shabby:

* A publisher efficiently does 1.6 million msgs/sec.
* A subscriber does 1.4 million msgs/sec.
* Request/Reply does 87 thousand request round trips/sec \(on the same process\).
* PubSub does 690 thousand round trips/sec \(on the same process\).

And this is only the first release. Expect performance to improve as we and the community identify enhancements.

## Installing

As expected installation is easy:

`npm install ts-nats`

The npm supplied bundle is built for ES5 which means that Promises, async/await etc. are supported on all currently supported node environments. If you are running on an `ES2017` \(node 7.10 and beyond\), you may want to build the library yourself. It is as easy as:

```bash
git clone git@github.com:/nats.io/ts-nats
npm install
```

Edit `tsconfig.json`:

* Comment `"target": "ES5"`
* Uncomment `"target": "ES2017"`
* Comment: `"lib": ["es2016"]`

```bash
npm run clean
npm run build
npm test
```

If all goes as expected, you should have a version of the library that removes the ES5 compatibility layer. Performance numbers between ES5 compatibility and a bare metal library are entirely analogous. The best reason to do this is for debugging purposes. Runtime-wise the npm package will be just fine.

## What about Node-Nats?

The long-term intention is to create an API wrapper that honors the node-nats API with a ts-nats dependency. This would allow us to have less to maintain while leveraging the ts-nats effort. Of course, there are millions of NATS clients developed with node-nats, and we want developers not to be forced to change their code just because we are doing things a little differently.

## We Want Your Feedback

I believe that the node-nats community will enjoy ts-nats version. But as always, if you have questions, comments or suggestions on how we can improve ts-nats give us a holler in the usual places [Github](https://github.com/nats-io/ts-nats/issues), or [Slack](https://join.slack.com/t/natsio/shared_invite/enQtMzE2NDkxNDI2NTE1LTc5ZDEzYTkwYWZkYWQ5YjY1MzBjMWZmYzA5OGQxMzlkMGQzMjYxNGM3MWYxMjNiYmNjNzIwMTVjMWE2ZDgxZGM).

