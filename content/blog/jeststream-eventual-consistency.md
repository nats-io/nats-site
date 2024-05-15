+++
date = "2023-12-09"
draft = true
title = "Delegate with trust"
author = "Vincent Vermersch @vinceveve"
categories = ["Community"]
tags = ["jetstream", "eventsourcing", "idempotency"]
+++
# Delegate with trust

When speaking about async patterns (messaging, event sourcing, etc.) with other developers, they come across as *afraid* of eventual consistency. However, it is stated in the form of:
> The frontend needs the answer directly
> The business process needs to be validated with perfect data
> My next page needs fresh data to display properly

With a messaging system, you have to wait for the message to be processed and the state to be updated. Then you can query it with *trust*. In the happy path this could something reasonable like 30ms, but could be arbitrarily long if there is an interruption in the flow.

With a classic CRUD system, you write to your database and query it directly with trust.

How can I delegate the job and be sure that it’ll be done or that I get an error if it can’t be done?
Let’s dive into use cases and tactics where I can get the same trust using NATS JetStream.

## Their can only be one
I have a payment system, and in this system we must withdraw the customer for a given `orderID` only once!
Sadly our partner who triggers the payment can call us multiple times with sometimes 1 day of delay.

Here we use one subject per order to store its payment log.
The subject will contains only one message the withdrawal.
Using publish expectations, I can be sure that there will be only one subject per order payment.

```typescript
// connect to NATS
const nc = connect();
// create a jetstream client:
const js = nc.jetstream();
const orderID = shortUID();
// The message should be the first on the subject
await js.publish(`payment.${orderID}`, Empty, {
	expect: { lastSubjectSequence: 0 }
});
```

## The impatient clicker
The customer always clicks multiple times on the same button, so it calls the backend and duplicates messages !
This triggers side effects multiples times creating spam, and exploding the BI.

NATS JetStream embed a deduplication system based on message ID for a given window. The window is configured in nano seconds at the stream level.

```typescript
// connect to NATS
const nc = connect();
// create the stream
const jsm = await nc.jetstreamManager();
await jsm.streams.add({
	name: "a",
	subjects: ["a.*"],
	// Deduplicate for 5 seconds
	duplicate_window: 5_000_000_000
});
// create a jetstream client:
const js = nc.jetstream();
// if this message is published twice within 5s, only the first published will be stored
await js.publish("a.b", Empty, { msgID: "a" });
```

## Order maintenance
I have a payment system, for the refund process, I need first to have a double human validation. Then the refund can append. And it must append only once.

For a refund subject, I will say that the refund must be exactly in 3rd place or crash.
```typescript
// connect to NATS
const nc = connect();
// create a jetstream client:
const js = nc.jetstream();
const orderID = shortUID();
// The message should be the first on the subject
await js.publish(`refund.${orderID}`, Empty, {
	expect: { lastSubjectSequence: 3 }
});
```


## Business rule
On my order process, I can’t refund more than the price of the order.

I can query my order subject like I would query my database. Data is up to date.
Here I’ll check the `OrderPassed` event to get the amount and my business rule.

```typescript
const nc = connect();
const jsm = await nc.jetstreamManager();
const codec = JSONCodec();

const refund = {
	amount: 10
};

// Create an temporary ordered consumer fetching all events for my order ID.
const c = await js.consumers.get(stream, {
   filterSubject: `*.${orderID}`
 });

// Get all messages for this order and publish only if the condition matches.
const messages = await c.consume();
for await (const m of messages) {
	const event = codec.decode(m.body);
	if(event.name == 'OrderProcessed') {
		if(event.data.price < refund.amount) {
			await js.publish(`refund.${orderID}`, codec.encode(refund)})
			break;
		}
  }
}
```
Yes message processing like this can help to build a state from all previous events. You rebuild the freshest state fetching previous events.

All these solutions could be applied elegantly in an [Aggreate](https://domaincentric.net/blog/event-sourcing-aggregates-vs-projections) if you need this tactic.
