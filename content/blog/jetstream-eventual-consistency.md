+++
date = "2024-05-21"
draft = false
title = "Delegate with trust"
author = "Vincent Vermersch"
categories = ["Community"]
tags = ["jetstream", "eventsourcing", "idempotency", "optimistic concurrency"]
+++

<img title="The problem" src="/img/blog/jetstream-eventual-consistency.png">

When speaking about async patterns (messaging, event sourcing, etc.) with other developers, they often seem *afraid* of eventual consistency. However, it is often expressed in the form of:

> The frontend needs the answer directly
>
> The business process needs to be validated with perfect data
>
> My next page needs fresh data to display properly

With a messaging system, you have to wait for the message to be processed and the state to be updated. Then you can query it with *trust*. In the happy path, this could be something reasonable like 30ms, but it could be arbitrarily long if there is an interruption in the flow.

With a classic CRUD system, you write to your database and query it directly with trust.

How can I delegate the job and be sure that it’ll be done or that I get an error if it can’t be done?

Let’s dive into use cases and tactics where I can gain the same trust using NATS JetStream.

## There can only be one
I have a payment system, and in this system, we must withdraw the customer for a given `orderID` only once!
Sadly, our partner who triggers the payment can call us multiple times with sometimes a 1-day delay.

Here, we use one subject per order to store its payment log.
The subject will contain only one message, the withdrawal.
Using publish expectations, I can be sure that there will be only one subject per order payment.

```typescript
const nc = connect();
const js = nc.jetstream();

// Generate a unique order ID.
const orderID = shortUID();

// Using a lastSubjectSequence of 0 requires this message
// to be the first one for the subject in the stream.
await js.publish(`payment.${orderID}`, Empty, {
	expect: { lastSubjectSequence: 0 }
});
```

## The impatient clicker
The customer always clicks multiple times on the same button, so it calls the backend and duplicates messages!
This triggers side effects multiple times, creating spam and downstream issues for business intelligence.

NATS JetStream has a built-in deduplication system based on message ID for a given time window. The window is configured in nanoseconds at the stream level.

```typescript
const nc = connect();
const jsm = await nc.jetstreamManager();

// Create the stream with an explicit 5s deduplication window.
await jsm.streams.add({
	name: "a",
	subjects: ["a.*"],
	duplicate_window: 5_000_000_000
});

const js = nc.jetstream();

// If this message is published twice within 5s, only the first published will be stored.
await js.publish("a.b", Empty, { msgID: "a" });
```

## Business rule
In my order process, I can’t refund more than the price of the order.

I can query my order subject like I would query my database. Data is up to date.
Here, I’ll check the `OrderPassed` event to get the amount and my business rule.

```typescript
const nc = connect();
const jsm = await nc.jetstreamManager();
const codec = JSONCodec();

const refund = {
	amount: 10
};

// Create a temporary ordered consumer fetching all events for my order ID.
const c = await js.consumers.get(stream, {
   filterSubject: `*.${orderID}`
 });

// Get all messages for this order and publish only if the condition matches.
const messages = await c.consume();
for await (const m of messages) {
	const event = codec.decode(m.body);
	if(event.name == 'OrderProcessed') {
		if(event.data.price < refund.amount) {
			await js.publish(`refund.${orderID}`, codec.encode(refund));
			break;
		}
  }
}
```
Yes, message processing like this can help to build a state from all previous events. You rebuild the freshest state fetching previous events.

All these solutions could be elegantly applied in an [Aggregate](https://domaincentric.net/blog/event-sourcing-aggregates-vs-projections) if you need this tactic.

## Maintain Order
I have a payment system, and for the refund process, I need first to have double human validation. Then the refund can append. And it must append only once.

For a refund subject, I will say that the refund must be exactly in 3rd place or fail.

```typescript
// connect to NATS
const nc = connect();
// create a JetStream client:
const js = nc.jetstream();
const orderID = shortUID();
// The message should be the first on the subject
await js.publish(`refund.${orderID}`, Empty, {
	expect: { lastSubjectSequence: 2 }
});
```
**Hint :**

In NATS, the sequence applies to the whole stream.
In this example, I assume I have only one refund in the whole stream (which is not for production).

For example, if I have in my streams 2 orders the sequences will be :
- refund.uuid-order-1 -> seq 1
- refund.uuid-order-1 -> seq 2
- refund.uuid-order-2 -> seq 3
- refund.uuid-order-2 -> seq 4
- refund.uuid-order-2 -> seq 5

If I write my Refund after all this, the `lastSubjectSequence` should be 6 to maintain ordering.

To get the current sequence :
1. When subscribing to a subject, the received event contains the sequence. I can store the last subscribed and use it.
2. Fetching the last event metadata before writing (as in the `Business rule` example).
3. Save the sequence of your last write in memory

## Too many events
I have a boiler that sends an event every 10 milliseconds.
To adapt room temperature, I need to compare current temperature with an average water temperature from the last hour.

To get this average water temperature I will need to read every events from the last hour, it means reading 36 0000 events.

To make this faster, you can create one `snapshot` event every hour.
Then read this snapshot stream to validate your business rule.

```typescript
const nc = connect();
const jsm = await nc.jetstreamManager();
const codec = JSONCodec();

// Create a temporary ordered consumer fetching events from last hour
const c = await js.consumers.get(stream, {
   filterSubject: `boiler.${boilerID}`
 });

let totalTemperature = 0;
let temperaturePoints = 0;
let lastSnapshot = Date.now() / 1000 | 0;

// Subscription to build the snapshot
const messages = await c.consume();
for await (const m of messages) {
	const event = codec.decode(m.body);
	totalTemperature+= event.data.temperature;
	temperaturePoints++;
	if(event.data.created_at-lastSnapshot >= 3600) {
	   const now = Date.now() / 1000 | 0;
		  // Publish to snapshot subject
      await js.publish(`boiler.${boilerID}.hourly-snapshot`, {
        temperature : averageTemperature/temperaturePoints,
        created_at : now,
        temperature_points: temperaturePoints
      });
      totalTemperature = 0;
      temperaturePoints = 0;
      lastSnapshot = now;
	}
}
```


## About the Author
[Vincent Vermersch](https://www.linkedin.com/in/vincent-vermersch), SAAAS Architect. I build digital factories since 2002.
Mainly for data driven products on marketing and e-commerce industry.
Event sourcer, event modeler, Wardley mapper and micro phenomenology practitioner.
