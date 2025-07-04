+++
date = "2024-04-10"
title = "Distributed GraphQL Subscriptions with NATS and Event Driven Architecture"
author = "Jens Neuse, Wundergraph"
categories = ["Engineering", "Wundergraph", "Event-Driven", "Education"]
tags = ["NATS", "graphql"]
+++

In today's fast-paced and interconnected world, building scalable and efficient applications is crucial.
One area that often poses challenges is implementing real-time updates and Subscriptions in a distributed system.
In this blog post, we will explore how to leverage NATS and Event Driven Architecture to achieve distributed GraphQL Subscriptions.
By combining the power of NATS messaging system with the flexibility of GraphQL,
we can create a robust and scalable solution for real-time data synchronization.
So, let's dive in and discover how to build Event Driven Federated Subscriptions with NATS!

## The Basics of GraphQL Subscriptions

Before we dive into the details of Event Driven Federated Subscriptions (EDFS) with NATS,
let's take a moment to understand the basics of federated GraphQL Subscriptions.

GraphQL Subscriptions are a powerful feature that allows clients to receive real-time updates from the server.
In contrast to traditional REST APIs, where clients have to poll the server for updates,
GraphQL Subscriptions allow the client to "subscribe" to a field in the Schema and receive a stream of updates from the server.

Here's an example of a GraphQL Schema with a Subscription type:

```graphql
type Subscription {
  postAdded: Post
}

type Post {
  id: ID!
  title: String
  content: String
}
```

We can now subscribe to the `postAdded` field and receive real-time updates whenever a new `Post` is added to the system using the following subscription:

```graphql
subscription {
  postAdded {
    id
    title
    content
  }
}
```

The GraphQL community has adopted multiple protocols for GraphQL Subscriptions,
such as WebSockets and Server-Sent Events (SSE).

## The differences between traditional GraphQL Subscriptions and Federated GraphQL Subscriptions

In a traditional GraphQL setup, you have a single GraphQL server that handles all incoming Queries, Mutations, and Subscriptions.
Clients connect to this server directly and receive real-time updates through WebSockets or SSE.
Once you start scaling the system or introduce high availability,
you need to implement a mechanism to share state across all instances of the GraphQL server to ensure that clients receive updates regardless of which server instance they are connected to.

This is usually achieved by using a Pub/Sub system such as Redis, RabbitMQ, or NATS to distribute events across all server instances.
This approach works well, but it introduces additional complexity and operational overhead.

In a federated GraphQL setup, you have multiple independent GraphQL servers that are connected through a Router/Gateway.
Each server contributes a part of the overall Schema.
All individual Schemas are combined into a single federated Schema through a process called composition.
For a client, it looks like a single GraphQL server when they connect to the Router,
but behind the scenes, the Router plans the execution of each GraphQL Operation and routes sub-requests to the appropriate server.

## Challenges of implementing real-time updates / Subscriptions in a distributed system like GraphQL Federation

When it comes to GraphQL Subscriptions, the federated setup introduces additional challenges.

1. **Memory Usage and number of open connections**:
    In a monolithic GraphQL server, each client connection is managed by the server itself,
    which means that one client connection maps to one connection on the server.
    In a federated setup, the client connects to the Router, which then connects to the origin GraphQL server, which in turn handles the connection from the Router.
    This means that each client connection results in three open connections and the associated memory overhead.
    This can easily become a bottleneck when you have a large number of clients connected to the system.
2. **Resilience and Flexibility**:
    While also affecting non-federated Subscriptions, the distributed nature of a federated setup introduces additional complexity when it comes to resilience and flexibility.
    When an origin server goes down, or you intend to scale the number of origin servers down,
    you need to ensure that the Router can handle the redistribution of Subscriptions to the remaining servers without losing any events.
    If you don't want to force clients to reconnect, you need to ensure that your origin servers keep running even when they are only serving a single client.
3. **Data Synchronization and Ownership**:
    A Subscription always needs to be tied to a source of truth.
    This source of truth is responsible for emitting events or updates to the Subscription.
    In a federated GraphQL setup, the source of truth will be one of the origin servers (Subgraphs).
    This means that coordination between Subgraphs is necessary if a Subscription needs to be updated based on data from multiple Subgraphs.
    This is counter to the idea of a federated setup, where each Subgraph is independent and doesn't need to know about the existence of other Subgraphs.
4. **Overhead and Duplication**:
    To achieve high availability and resilience, you'll want to run multiple instances of each origin server.
    This means that by default, you need to have a Pub/Sub system in place to distribute events across all instances of the origin server.
    So, if you're already using a Pub/Sub system as the (real) source of truth to invalidate Subscriptions,
    why introduce the additional complexity of piping events from the Pub/Sub system to the origin server and then to the Router?

I think it's clear that there's a theme here.
The "real" source of truth is the Pub/Sub system, and the origin servers are just a layer of indirection.
Why pipe events from the Pub/Sub system to the origin server and then to the Router?
Why not connect the Router directly to the Pub/Sub system and let the Router handle the distribution of events to the appropriate clients?
This would simplify the architecture, reduce the number of open connections, and make the Subgraphs stateless (again).

## Introduction to Event Driven Federated Subscriptions (EDFS) - A new approach to distributed GraphQL Subscriptions

Event Driven Federated Subscriptions (EDFS) is a new approach to GraphQL Subscriptions that leverages Event Driven Architecture to achieve real-time updates in a distributed system.
The core idea is to connect the Router directly to an Event Source, such as NATS, and "join" additional fields to the event stream using Federation.
<figure>
<img class="img-responsive center-block" alt="EDFS Architecture" src="/img/blog/edfs_architecture.png">
<figcaption style="font-size:20px">EDFS Architecture</figcaption>
</figure>

In this setup, a client connects to the Router and starts a Subscription, which the Router maps to an event stream.
When an event is published to the stream, the Router uses the Federation protocol to resolve additional fields by sending Queries to the appropriate Subgraphs.
Once all fields for the Subscription are resolved, the Router emits the result to the client.
In simple terms, Queries and Mutations are directly triggered by a client request,
while Subscriptions are triggered by an event from the Event Source,
the rest of the process is the same.

This approach has several advantages over traditional GraphQL Subscriptions:

1. Your Subgraphs (origin servers) are stateless and don't need to manage client connections
2. Only one connection per client is required, reducing memory overhead
3. No coordination between Subgraphs is necessary, as all Subgraphs can independently emit events to the Event Source
4. Less operational overhead, as you're not piping events through the Subgraphs

## Understanding the Basics of NATS Messaging System in the context of EDFS

Event Driven Federated Subscriptions (EDFS) leverages Event Driven Architecture to achieve real-time updates in a distributed system. To understand how EDFS works, it's important to have a good understanding of the underlying messaging system. In this case, we will explore the basics of the NATS messaging system and how it fits into the overall picture of Event Driven Architecture and Federation.

NATS is a high-performance, cloud-native messaging system that is designed for building modern, scalable, and efficient applications. It is a lightweight and easy-to-use messaging system that is well-suited for building distributed systems and microservices. NATS provides a simple and efficient way to connect services, share data, and distribute events across a distributed system.

NATS is built around the concept of Subjects, which are hierarchical names that are used to categorize messages. A Subject is a string that is used to identify a message and route it to the appropriate subscribers. When a message is published to a Subject, it is delivered to all subscribers that are interested in that Subject.

In the context of Event Driven Federated Subscriptions (EDFS), NATS is used as the Event Source that emits events to the Router. When a client starts a Subscription, the Router maps the Subscription to a Subject in NATS. When an event is published to the Subject which the Router has a Subscription for,
the event is received by the Router, which then resolves additional fields through the Federation protocol as described earlier.

## How Event-Driven patterns and NATS can be leveraged to achieve a superior GraphQL Federation Architecture

EDFS leverages Event-Driven patterns to implement real-time updates in a distributed system without tightly coupling the origin servers and keeping them stateless.
Imagine an architecture where every team exposes Subscriptions directly from their Subgraphs.
This would require each team to manage stateful client connections and coordinate with other teams to ensure that Subscriptions are updated correctly.
This is a huge ask on the teams and introduces a lot of operational duplication and complexity.
One of the ideas of Federation is to allow teams to work independently and choose the technology stack, language, and framework that best suits their needs.
Managing stateful client connections at scale is a hard problem to solve,
even more so when every team has to solve it independently with different technologies and frameworks.

By introducing NATS as the Event Source, and EDFS as the protocol to resolve Subscriptions,
we can decouple the Subgraphs from the client connections,
standardize on a single technology stack for real-time updates,
and simplify the operational overhead by managing client connections in a single place.

Modern engineering organizations are moving towards having a dedicated team that is responsible for operating core infrastructure components such as NATS, Federation Routers, and other shared services. Usually, we refer to this team as the Platform Team or Infrastructure Team.
By centralizing the responsibility for managing stateful client connections and an Event Source in a single team,
we can reduce the operational overhead for individual teams and allow them to focus on building features and delivering value to the business.

## Step-by-Step Guide to Implementing Distributed GraphQL Subscriptions with NATS and EDFS

Now that we have a good understanding of Event Driven Federated Subscriptions (EDFS) and how NATS fits into the picture,
let's walk through a step-by-step guide to implementing distributed GraphQL Subscriptions.

Let's assume we want to build a simple real-time chat application that allows us to listen to messages in a chat room.

1. **Define the EDFS Graph**
    In the first step, we need to define our Subscription and attach it to our Event Source (NATS).

```graphql
type Subscription {
  messageAdded(roomID: ID!): Message @eventsSubscribe(topic: "room.{{ args.roomID }}.messages")
}

type Message @key(fields: "id"){
  id: ID!
}
```

2. **Add two more Subgraphs**
    In the second step, we add a second Subgraph that extends the `Message` entity with the actual message content,
    and a third Subgraph that extends the `Message` entity with the `User` entity.

```graphql
# Message Subgraph

extend type Message @key(fields: "id") {
  id: ID!
  text: String
  createdAt: DateTime
}
```

The sole purpose of the Message Subgraph is to be responsible for the actual message content,
as we only want to publish the `id` of the message to the Event Source to keep the payload small,
and the state of the message within the Message Subgraph.

```graphql
# User Subgraph

extend type Message @key(fields: "id") {
  id: ID!
  user: User
}

type User @key(fields: "id") {
  id: ID!
  name: String!
  email: String!
}
```

3. **Composing the Supergraph**
    We can now compose the two Schemas into a single federated Schema.

```graphql
type Subscription {
  messageAdded(roomID: ID!): Message
}

type Message {
  id: ID!
  text: String
  createdAt: DateTime
  user: User
}

type User {
  id: ID!
  name: String!
  email: String!
}
```

As you can see, all Federation-related directives are removed from the Schema, as the Router will handle the Federation logic.
From the user's perspective, it looks like a single GraphQL Schema.

4. **Start a GraphQL Subscription**
    In the next step, we need to make a Subscription request to the Router.

```graphql
subscription {
  messageAdded(roomID: "123") {
    id
    text
    createdAt
    user {
      id
      name
      email
    }
  }
}
```

5. **Publish an event to NATS**
    Finally, we can publish an event to NATS that triggers the Subscription.
    Let's use the NATS cli to publish an event to the `room.123.messages` Subject.

```bash
nats pub 'room.123.messages' '{"__typename":"Message","id": "1"}'
```

What's important to note here is that the event payload contains the `__typename` and the `id` of the entity.
As it's possible to return an Interface or Union type from a Subscription,
the Router needs to know the concrete type of the entity.
In addition, all fields marked with `@key` are required to resolve the Subscription.
In this case, we're required to return the `id` of the `Message` entity.
This is required so that the Router can join additional fields to the event stream from the Message Subgraph and the User Subgraph.

6. **Receive the Subscription Result**
    Once the event is published to NATS, the Router will receive the event and resolve the Subscription.
    The result will be sent to the client, and the client will receive the real-time update.

Here's how the result might look like:

```json
{
  "data": {
    "messageAdded": {
      "id": "1",
      "text": "Hello, World!",
      "createdAt": "2024-03-19T12:00:00Z",
      "user": {
        "id": "1",
        "name": "Alice",
        "email": "alice@wonderland.com"
      }
    }
  }
}
```

And that's it! You've successfully implemented distributed GraphQL Subscriptions with NATS and Event Driven Federated Subscriptions (EDFS).
For more information on how to implement EDFS in your own projects, check out the [EDFS documentation](https://cosmo-docs-source.wundergraph.com/router/event-driven-federated-subscriptions-edfs).

## EDFS and CQRS: How to leverage EDFS to implement Command Query Responsibility Segregation

Command Query Responsibility Segregation (CQRS) is a design pattern that separates the read and write operations of a system.
In a CQRS architecture, the read and write operations are handled by separate components,
which allows for better scalability, performance, and flexibility.

EDFS can be leveraged to implement CQRS in a distributed GraphQL system.
Let's say we'd like to implement a system to scrape the content of a website and analyze it using AI.
This operation will be very resource-intensive and time-consuming,
so we want to split it into multiple steps to make it more resilient and scalable.

First, we trigger the scraping operation by sending a Command to the system,
we can do this through a Mutation.

Next, we want to receive real-time updates on the progress of the scraping operation,
so we start a Subscription to listen to the progress events.

Finally, once the scraping operation is complete, we want to retrieve the results.

By using EDFS, we can implement the CQRS pattern in a distributed GraphQL system with clear separation of concerns.
One Subgraph is responsible for handling the Command (Mutation) which triggers the scraping operation,
another Subgraph is responsible for performing the scraping operation and emitting progress events to NATS,
and a third Subgraph is responsible for storing the results of the scraping operation and serving them to the client.

This approach allows us to scale each component independently and handle failures gracefully.
If the scraping operation fails, we can retry it without affecting the client's Subscription.
If the client disconnects and reconnects, they can resume the Subscription without missing any events.

Here's an example of how you might implement CQRS with EDFS:

```graphql
# Scraping Command Subgraph

type Mutation {
  scrapeWebsite(url: String!): ID
}
```

This Subgraph is responsible for handling the Command to scrape a website.
When the Mutation is called, it triggers the scraping operation and returns an ID that can be used to start a Subscription to listen to the progress events.

```graphql
# EDFS Graph

type Subscription {
  scrapeJobState(id: ID!): ScrapeJobState @eventsSubscribe(topic: "scrapeJob.{{ args.id }}.state")
}

type ScrapeJobState @key(fields: "id") {
  id: ID!
}
```

All the EDFS Graph does is to tie the Subscription to a topic using the `id` we've got from the Mutation.

```graphql
# Scraping Progress Subgraph

enum ScrapeJobStatus {
  PENDING
  IN_PROGRESS
  COMPLETE
  FAILED
}

extend type ScrapeJobState @key(fields: "id") {
  id: ID!
  status: ScrapeJobStatus!
  progress: Float
}
```

This Subgraph is responsible for extending the stream of events with the actual progress of the scraping operation.
Each time the scraping operation makes progress, it emits an event to NATS to trigger the Subscription invalidation in the Router.

From the client's perspective, we can use a Mutation to kick off the scraping operation,
and then start a Subscription to listen to the progress events.

```graphql
mutation {
  scrapeWebsite(url: "https://example.com") # returns an ID
}

subscription {
  scrapeJobState(id: "1") {
    id
    status
    progress
  }
}
```

This approach allows us to implement CQRS using distributed GraphQL.
We can scale each component independently and handle failures gracefully,
and we can provide real-time updates to the client without tightly coupling the read and write operations.

At the same time, we can leverage the full power of the GraphQL ecosystem,
such as clients for all languages and frameworks, Playground solutions, and the ability to introspect the Schema.

What's great about EDFS and GraphQL Federation is that it allows us to implement CQRS on the "backend-side" without sacrificing the developer experience on the "client-side".
For an API consumer, it looks like a single GraphQL Schema, and they can use all the tools and libraries they're used to.
They don't even notice that the system is built using CQRS and EDFS.

## Best Practices for Designing Event Driven Federated Subscriptions

When designing Event Driven Federated Subscriptions (EDFS), there are several best practices to keep in mind to ensure that your system is scalable, efficient, and resilient.

When emitting events to the Event Source, it's important to only emit the keys of the entities that have changed, not the entire state of the entity.
This keeps the payload small and reduces the load on the Router and the Subgraphs.
State should be retrieved from the Subgraphs using the Federation protocol.

When defining your Subscriptions, it's important to use a consistent naming convention for the topics that you attach your Subscriptions to.
This makes it easier to manage and monitor your Subscriptions and ensures that they are easy to understand and maintain.

In the EDFS Graph, it's important to only define Entities with their keys.
All additional fields should be defined in the Subgraphs that extend the Entities.

## Future Trends and Innovations in Distributed GraphQL Subscriptions

Event Driven Federated Subscriptions (EDFS) is a powerful new approach to implementing real-time updates in a distributed GraphQL system.
By leveraging Event Driven Architecture and CQRS, we can build scalable, efficient, and resilient systems that provide real-time updates to clients without tightly coupling the read and write operations.
But this is really just the beginning.

In the future, we intend to support not just Pub/Sub mechanisms like NATS core,
but also more advanced architectures with NATS JetStream and other streaming solutions.

By combining EDFS and NATS JetStream, we can add more advanced features such as time traveling,
replaying events, deduplication, and more.
With JetStream as the Event Source, consumers can subscribe to a stream of events and replay events from a specific point in time,
or even pause a Subscription, go offline, and resume the Subscription when they come back online,
all without missing any events.

## Conclusion

In this blog post, we've explored how to leverage NATS and Event Driven Architecture to implement Subscriptions in a distributed GraphQL system.
By using Event Driven Federated Subscriptions (EDFS), we can build scalable, efficient, and resilient systems that provide real-time updates to clients without tightly coupling the read and write operations.
We've also explored how EDFS can be leveraged to implement CQRS in a distributed GraphQL system,
and we've discussed best practices for designing EDFS.
Finally, we've looked at future trends and innovations in distributed GraphQL Subscriptions.

I hope this blog post has given you a good understanding of how to implement distributed GraphQL Subscriptions with NATS and EDFS,
and I hope it has inspired you to explore new ways to build real-time updates in your own systems.

If you have any questions or feedback, feel free to reach out to me on Twitter at [@TheWorstFounder](https://twitter.com/TheWorstFounder).
I'd love to hear your thoughts and ideas on this topic!

If you want to learn more about EDFS and how to implement it in your own projects, check out the [EDFS documentation](https://cosmo-docs-source.wundergraph.com/router/event-driven-federated-subscriptions-edfs).
