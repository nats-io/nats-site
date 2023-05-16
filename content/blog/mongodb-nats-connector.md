+++
date = "2023-05-16"
draft = false
title = "MongoDB NATS Connector"
author = "Andrea Damiani"
categories = ["Engineering"]
tags = ["NATS", "Connector", "MongoDB", "CDC"]
+++

## Data Synchronization Between Microservices

With microservice architectures becoming the standard nowadays, it is a common need to extract data from your database to synchronize other downstream services.

Consider a social network where you have a service that stores new posts in a [MongoDB ](https://www.mongodb.com/what-is-mongodb)collection. You may want to notify other services when a post is created, perhaps so that you can save it on [Redis](https://redis.io/docs/about/) for fast retrieval, or add it to [Elastic](https://www.elastic.co/guide/index.html) for full text search queries.

The first approach that might come to mind is to sequentially:

1. Persist the post in a MongoDB collection
2. Save the post in Redis
3. Add the post to Elastic

However this approach presents a problem, creating a new post would involve three different systems. The more systems are involved, the higher the chances that one of them will be unavailable, therefore increasing the overall chances of errors.

Moreover, what if we want to add more systems to the mix? The speed of the service, which was initially designed to simply insert a new post, would be negatively impacted as it now performs multiple commands.

## NATS to the Rescue

To address this problem, you could use [NATS](https://docs.nats.io/nats-concepts/overview), a lightweight and high-performance messaging system that supports pub-sub, request-reply, and message storing and replaying.

For example, you could:

1. Persist the post on a MongoDB collection
2. Publish a message on [NATS JetStream](https://docs.nats.io/nats-concepts/jetstream)
3. Let other services consume the stream and react to it (e.g., save the post on Redis, add it to Elastic, etc.)

This approach improves the design, but there’s still a concern. What if NATS becomes unavailable after persisting the post on MongoDB? In such cases, data inconsistencies arise. The post is added to MongoDB, but no message is published, leaving other services unaware of the new post.

To mitigate this, you can consider using MongoDB transactions: insert the post in MongoDB, publish the message on NATS, and if the latter fails, rollback; otherwise commit. However, if the commit fails, the other services would be notified about the new post, but it would not be present in MongoDB.

## Change Data Capture

One solution to this problem is [Change Data Capture](https://en.wikipedia.org/wiki/Change_data_capture) (CDC). Whenever there is a data change event in MongoDB (such as an insertion, an update or a deletion), we can capture it and write it to NATS JetStream. From there, any number of consumers can subscribe to the stream, process the change events, and react accordingly. Each consumer processes the data and sends an _acknowledged_ (ACK) signal to NATS, to confirm the correct handling. In case of retryable errors, consumers can send a _not-acknowledged_ (NAK) signal, prompting NATS to redeliver the message. Although this introduces eventual consistency, as the post may be found on MongoDB but not yet on Redis and Elastic, it eventually reaches all systems.

Now the question is, how do we capture data changes on MongoDB and publish them on NATS JetStream? A vital piece of the puzzle is still missing.

## MongoDB Change Streams

MongoDB has a built-in feature called [Change Streams](https://www.mongodb.com/docs/manual/changeStreams/#change-streams), which provides a real-time stream of database changes, precisely what we need for CDC. Your next thought might be:

1. Leverage any of the official MongoDB client libraries to make your services subscribe to change streams
2. React to the change events and publish them on NATS JetStream
3. Let other services consume the stream and react to it (e.g., save the post on Redis, add it to Elastic, etc.)

This decouples the insertion of a new post from the other systems. Any service interested in it, can subscribe to the change stream and react accordingly. Adding new services to the mix becomes more manageable as well. However, this approach still has its challenges. What if the service subscribing to a change stream fails to publish a message on NATS? In such cases, the responsibility to handle errors and retries falls on the service itself.

Moreover, what if the service crashes while consuming change events? While many modern architectures can handle that scenario by automatically restarting containers, the service still needs to address the issue of determining the last processed change event before the crash. Improper handling could lead to missed change events or the publication of undesired duplicate messages by reading the same events multiple times.

Another consideration is the horizontal scaling of the service. If multiple instances of the service consume the same change stream, duplicate messages would be published.

## Enter MongoDB-NATS Connector

To address these challenges I decided to build [MongoDB-NATS Connector](https://github.com/damianiandrea/mongodb-nats-connector), a tool that utilizes MongoDB’s change streams to capture data changes and publish them to NATS JetStream.

The connector efficiently synchronizes these two technologies, relieving the services from the burden of managing errors, retries and duplicate messages. It achieves this by utilizing MongoDB _resume tokens_. Each change event has an \__id_ field that serves as a resume token. When watching a collection, you can set a _resumeAfter_ parameter with a resume token value, MongoDB will use it to [resume the change stream](https://www.mongodb.com/docs/manual/changeStreams/#resume-a-change-stream) after the specific event that is identified with the resume token. After reading a change event, the connector persists that token in a collection, and upon restart, it queries that collection to fetch the last inserted record. This enables the connector to resume after the last processed change event.

However, the connector still faces a few challenges:

- What if the connector crashes before publishing the message to NATS and persisting the resume token?
- What if it fails to publish the message to NATS, perhaps due to unavailability?
- What if it successfully publishes the message to NATS, but fails to persist the resume token?

In all three cases, the connector simply retries, restarting from the previous resume token. While the first two cases do not pose significant issues, the third case could result in a duplicate message being published on NATS, since the message was already published before the failure. To address this, the connector uses the current resume token as the _Nats-Msg-Id_ header. This way, service consumers do not have to worry about duplicate messages, as NATS JetStream automatically [discards them](https://docs.nats.io/using-nats/developer/develop_jetstream/model_deep_dive#message-deduplication).

## Conclusion

So there you have it! MongoDB-Connector is a powerful tool that simplifies data extraction from MongoDB and synchronization with other services through NATS JetStream. By handling the complexity of errors, retries, and duplicate messages, the connector allows you to focus on the business logic of your services while ensuring efficient and reliable data synchronization.

## About the Author

Andrea Damiani is a passionate software engineer at Spindox, and a big fan of MongoDB & NATS.
