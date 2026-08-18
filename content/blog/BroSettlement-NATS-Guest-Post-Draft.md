+++
date = "2026-08-17"
draft = false
title = "Building a Wallet Event Backbone with NATS JetStream: Lessons from BroSettlement's Staging Tests"
author = "Vadym Rozov"
categories = ["General", "Engineering", "Guest Post", "JetStream", "Fintech"]
tags = ["NATS", "JetStream", "Fintech"]
+++

# Building a Wallet Event Backbone with NATS JetStream: Lessons from BroSettlement's Staging Tests

I am Vadym Rozov, founder of [BroLabel](https://www.brolabel.io), where we are building [BroSettlement](https://www.brolabel.io/en/brosettlement): API-first, noncustodial MPC wallet, ledger, and settlement infrastructure for fintech, iGaming, and crypto-native platforms. A wallet transaction is not one synchronous request. It moves through policy checks, MPC signing, blockchain broadcast, confirmation, ledger posting, and client notification, and any of those stages may be delayed or fail independently. We selected NATS early in the architecture—not as a replacement for another broker, but to avoid coupling every service through synchronous calls as the platform grew.

## Closing the dual-write gap with a transactional outbox

PostgreSQL remains BroSettlement's transactional source of truth. When an API operation changes durable business state, the service writes both the business rows and an outbox event in the same PostgreSQL transaction. Only after that transaction commits may a background worker publish the event to NATS JetStream. This ordering avoids the two classic dual-write failures: publishing an event for a database transaction that later rolls back, or committing financial state and then losing its event because the broker was temporarily unavailable. If publication fails, the committed outbox row remains the recovery point and the worker retries; an outbox failure cannot roll back or corrupt the already committed ledger state.

A simplified deposit-account flow looks like this:

1. Validate the signed API request, organization scope, permissions, and `Idempotency-Key`.
2. Create the deposit-account mapping and its outbox record inside one PostgreSQL transaction.
3. Commit the transaction.
4. Publish `deposit.account.created.v1` from the outbox with its event ID, correlation ID, and optional idempotency key.
5. Let the Blockchain Gateway consume the event and begin monitoring the address independently of the original API request.

This lets the HTTP path return from committed database state without making blockchain monitoring, audit processing, or WebSocket delivery part of the same distributed transaction.

## Designing explicitly for at-least-once delivery

The outbox closes the producer-side consistency gap, but it deliberately produces **at-least-once**, not magical exactly-once, behavior. A worker can publish successfully and fail before recording its own progress; a consumer can complete its database write and lose its acknowledgment. Duplicates are therefore a normal recovery condition. BroSettlement consumers deduplicate first by the globally unique `eventId` and, for blockchain data, also by the chain-specific transaction identity. Handlers either retain the last processed event identity or make the underlying database mutation idempotent with unique constraints and transactional checks. Client commands use the complementary request-side pattern: repeated mutating requests with the same `Idempotency-Key` resolve to the original resource instead of creating another financial operation.

Our JSON event envelope separates transport metadata from domain data:

```json
{
  "eventId": "evt_01...",
  "type": "chain.deposit.confirmed",
  "version": 1,
  "occurredAt": "2026-08-13T10:21:30Z",
  "orgId": "org_01...",
  "correlationId": "req_01...",
  "idempotencyKey": "client-operation-123",
  "data": {
    "transactionId": "tx_01...",
    "chain": "tron:nile",
    "asset": "USDT"
  }
}
```

The `correlationId` follows one workflow across the API transaction, outbox publish, NATS consumers, ledger transition, and client event. The `version` field—and versioned subjects where appropriate, such as `deposit.account.created.v1`—allows additive evolution without silently changing an existing consumer contract. We use durable consumers and queue-based processing where work must scale horizontally, retry transient failures with backoff, and avoid assuming a single global order across unrelated subjects. Structured publish/consume logs carry the event and correlation IDs, while tracing spans cover the PostgreSQL transaction boundary and NATS publish/ack timing.

## Keeping the internal event bus separate from the public stream

Blockchain gateways, ledger workers, audit consumers, and the WebSocket gateway consume NATS events independently. TLS, service credentials, and subject-level permissions limit what each producer and consumer may publish or read. Event payloads carry resource identifiers but never private key material or signing shares. The public WebSocket layer does not expose internal NATS subjects directly: it authenticates the external client with its BroSettlement API key, binds the connection to one organization, filters the allowed event families, and translates approved internal messages into a stable client lifecycle contract. The target gateway model uses filtered JetStream consumers with explicit acknowledgments and redelivery backoff, while PostgreSQL read APIs remain available even if live WebSocket delivery is degraded.

<img class="img-responsive center-block" src="/img/blog/brosettlement-nats-architecture-1.png" alt="Sanitized Brosettlement Staging Architechture using NATS JetStream">

## What staging tests taught us

Our staging resilience tests made the value of this separation concrete. A 400-attempt TRON Nile scenario began with 100 requests launched concurrently, followed by 30 waves of 10 requests over five minutes. The scenario was designed to exercise partial failures and transaction-processing errors as well as normal request handling. With a dedicated WebSocket listener connected throughout the run and reconciliation window, the NATS-backed event path delivered the complete observed lifecycle set: 926 business events with 926 unique, non-null event IDs—222 `transaction.created`, 484 `transaction.updated`, and 220 `transaction.failed` events. Those events covered every durable source transaction: all 214 requests that returned `201`, all six that returned `503`, and both that returned `500`. When the API returned `500` or `503` after durable state had already been created, the corresponding transaction event, lifecycle history, and correlation information remained available through the NATS-backed event path. This demonstrated an important property for financial infrastructure: a synchronous error response did not erase the asynchronous operational record, so every created workflow remained traceable.

The resilience tests also helped us define the next production-hardening step. When a listener was deliberately disconnected for an entire error lifecycle, the client restored current state through the REST reconciliation path after reconnecting. We now plan to complement that recovery path with an explicit resume contract backed by durable JetStream consumer state, expose sequence or cursor information safely to clients, align retry windows with MPC and blockchain timeouts, and strengthen metrics around publish, consume, retry, and replay behavior. We also keep the immutable ledger journal as the rebuildable financial source and use idempotent reconciliation jobs to compare ledger state with chain state rather than treating the event stream itself as the accounting database. NATS has given us more than a transport: it has given us a clean place to validate partial-failure behavior, test recovery assumptions, and evolve a financial workflow without making every component depend on every other component.

## About the author

Vadym Rozov is the founder of BroLabel, a fintech company building digital-asset infrastructure products. BroSettlement provides API-first MPC wallets, a client-controlled Co-Signer, an immutable operating ledger, blockchain broadcast, and real-time lifecycle events for teams embedding stablecoin and crypto wallet operations.
