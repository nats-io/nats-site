+++
categories = ["Community"]
date = "2018-09-07"
tags = ["community", "engineering", "guest-post", "rest", "architecture", "microservices", "websocket", "real-time" ]
title = "Guest Post: Synchronize web apps in real time with NATS+Resgate"
author = "Samuel Jirénius"
+++


REST APIs are nice. Simple. Stateless. Scalable. But to keep client data updated in real time, things get more complicated. Streaming events is easy, but you start having to deal with questions like:

<img align="right" alt="Wolf Questioning" src="/img/blog/resgate-nats/wolf_questioning_150x240.png">

*Which resources do I need events for?*  
*How do I manage sending each client only the events they need?*  
*Can I prevent subscription to some events for unauthorized clients?*  
*Who keeps state of these event subscriptions?*  
*How do I handle lost connections? Or service crashes?*  
*Is it even possible to make search-, or pagination queries with realtime updates?*  
*Does it scale?*  
*Why can't it be made simpler?!*

Being the lead developer of the cloud offering at a leading provider of contact center solutions, I had to deal with these issues. And with the help of NATS I have a solution.

## Resgate - a Realtime API Gateway
The solution became the [*REsource Subscription (RES) Protocol*](https://github.com/jirenius/resgate/blob/master/docs/res-protocol.md), a simple JSON based protocol that revolves around the concept of *resources*, represented by JSON objects (*models*) and arrays (*collections*). And then [Resgate](https://resgate.io), the gateway implementation that enables it all.

Resgate is a smart WebSocket-to-NATS (and REST-to-NATS) API gateway, written in Go. It is similar to NATS in its high performance and simple setup. By acting as a bridge between the web clients and the (micro-)services, fetching resources, forwarding method calls, and passing on events, it also handles **access control**, **syncing**, **resource caching**, and more.

## NATS - the obvious choice
Resgate needed a messaging system to communicate with the services, one that is **fast**, **reliable**, and **simple**, supporting both the *publish-subscribe* pattern as well as the *request-reply* pattern. NATS, with its admirable simplicity and performance, fitted the description like a glove.

The fact that NATS, just like Resgate, is written in Go, made the choice even easier. During the development of Resgate, NATS has also been used as a reference and inspiration.

## Fitting it all together
A simple NATS+Resgate setup would look like this:

<p align="center">
<img class="img-responsive center-block" alt="Architecture Diagram" src="/img/blog/resgate-nats/simple-res-network-icon.png">
</p>


Resgate, the blue archway, becomes the single entry point for all clients. While there might be one macro-service, or a hundred micro-services, connected to NATS, the client that accesses the API will perceive it as a single unified API.

The service(s), which can be written in any language supported by NATS server, will listen to requests similar to REST. But instead of using HTTP, the service will listen and reply to requests published over NATS.

If a resource is modified, the service uses NATS to publish an event that describes the modification, allowing any Resgate to pass on the event to the subscribing clients so they can have an update within a matter of milliseconds.

Does it sound complicated? It really isn't! Let me show you.

## Writing a service

Below are two javascript (node.js) snippets showing how to serve a resource, `models.mymodel`, using HTTP in comparison with Resgate:

**Using HTTP (with express):**
```js
var mymodel = { message: "Hello HTTP" };
// Listen to HTTP GET requests
app.get('/models/mymodel', function(req, resp) {
  resp.end(JSON.stringify(mymodel));
});
```

**Using Resgate (with nats):** 
```js
var mymodel = { message: "Hello NATS" };
// Listen to RES get requests over NATS
nats.subscribe('get.models.mymodel', function(req, reply) {
  nats.publish(reply, JSON.stringify({ result: { model: mymodel }}));
});
```
Pretty similar, right?  
In addition, *authorization* is handled just as simply by the `access` request.  
And resource updates are done by publishing a simple event message.
```js
// Listen for access requests
nats.subscribe('access.models.mymodel', function(req, reply) {
  let { token } = JSON.parse(req);
  nats.publish(reply, JSON.stringify({ result: {
    get: true // Or false, if the token doesn't provide access
  }}));
});

// Updating the model
mymodel.message = "Hello NATS+Resgate";
nats.publish('event.models.mymodel.change', JSON.stringify({
  values: { message: mymodel.message }
}));
```

<img align="right" alt="Wolf match maker" src="/img/blog/resgate-nats/wolf_now_kiss_135x240.png">

That's it!

Now, let's take a look at the client side.

## Writing a client

There are two ways to get the resources from Resgate:

**Using HTTP:**

*GET: /api/models/mymodel*  
```js
{ "message": "Hello NATS" }
```

**Using javascript with ResClient:**
```js
let client = new ResClient('ws://api.example.com');
client.get('models.mymodel').then(model => {
  console.log(model.message); // Hello NATS
});
```

But when using ResClient, that communicates over WebSockets, your resources are updated in real time!
```js
let changeHandler = function() {
  console.log("Updated: " + model.message); // Updated: Hello NATS+Resgate
}

// Subscribe to events
model.on('change', changeHandler);

// Unsubscribe to events
model.off('change', changeHandler);
```

No extra code is needed for updating the model on events that modifies the state. The resources are updated automatically by ResClient.

## Additional benefits

Apart from the obvious benefit of getting data syncronized between clients in real time, there is more to gain. This blog post is mainly a basic introduction to NATS+Resgate, but I will quickly describe a few other features that each could deserve their own blog post:

**Caching**  
All resources are cacheable by Resgate. This means that if multiple clients requests the same resource, it will only need to send a single *get* request, taking load off the service.

**Resource queries**  
Resgate supports resource queries for searches, filters, or pagination. Just like any other resource, query resources are also updated in real time.

**Scaling**  
Multiple Resgates may be connected to NATS to handle massive amounts of clients. In addition, the setup may be replicated to near limitless scaling.

**Resilience**  
The system recovers and resources are resynchronized seamlessly after lost connections or server failures.  

**Resource linking**  
Resources may be linked together with references. This allows fetching complex and nested data in a single client request.

**Access control**  
Access control is done on the level of resources and resource methods. Access can be revoked in real time without having to wait for a token to expire. For authentication, any sort of schema may be implemented, such as username/password, header authentication, JWT, OAuth2, etc.

## Conclusion and evolution

<img align="right" style="margin: 8px 8px" alt="Wolf relaxing" src="/img/blog/resgate-nats/wolf_relaxing_210x156.png">

 With NATS+Resgate and the REsource Subscription (RES) protocol, you can get real time updates to your web clients while gaining functionality such as **end-user authentication**, **resource caching**, and **data-loss recovery**. And it is **fast** and **simple**!

 While the project is young, the first version of the protocol is settled, where no changes will be added that breaks backwards compatibility. Resgate will continue to get battle tested as the number of projects where the gateway is deployed in increases.

If you are interested in knowing more, visit the [Resgate.io](https://resgate.io) website, which contains guides, examples, and resources to ease introduction and development of services for NATS+Resgate.

Or if you have any question or feedback, don't hesitate to contact me directly via email:

[samuel@jirenius.com](mailto:samuel@jirenius.com)

Or find me in the [NATS Community](https://natsio.slack.com/messages/DBET737GV).

## About the author

Samuel Jirénius is a long time developer with his roots in C64 Basic and Amiga's Motorola 68k assembler, but is now using a wide variety of technologies (with a passion for [Go](https://golang.org/)) to bring highly interactive web experiences to end users.

He has been working as the system architect and lead developer of Altitude Xperience, a cloud based call center solution developed by [Altitude](https://www.altitude.com/). The call center market's requirement of scalability, high availablity, and real time client synchronization, seeded the ideas that would eventually, after leaving Altitude, lead to the development of Resgate.

Samuel is currently working at [PRO NON X](https://www.prononx.se/).

## Links
* **[Resgate.io](https://resgate.io)** - web site with examples, guides, and resources
* **[GitHub - Resgate](https://github.com/jirenius/resgate)** - repository for the realtime API gateway
* **[GitHub - ResClient](https://www.npmjs.com/package/resclient)** - RES client library for javascript
* **[GitHub - Resgate Test App](https://github.com/jirenius/resgate-test-app)** - test application used to test and develop Resgate
* **[GitHub - go-res](https://github.com/jirenius/go-res)** - RES service library for Go


## Examples
* **[Hello World example](https://github.com/jirenius/resgate/tree/master/examples/hello-world)**
* **[Book Collection example](https://github.com/jirenius/resgate/tree/master/examples/book-collection)**


*NOTE: Resgate and all related tools are released under the MIT license.*
