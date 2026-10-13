+++
date = "2026-09-03"
draft = false
title = "Laravel NATS: A Production-Ready Bridge for PHP Applications"
author = "Zaeem"
categories = ["Engineering", "Guest Post", "JetStream", "Community"]
tags = ["NATS", "Laravel", "PHP", "JetStream", "Microservices", "Queue", "Open Source"]
+++

PHP powers a large share of the web, and Laravel is one of its most widely adopted frameworks. Teams building event-driven services, background workers, and microservice boundaries in Laravel need messaging that is fast, simple to operate, and easy to wire into familiar Laravel patterns: facades, service providers, queue workers, Artisan commands, and configuration via `.env`.

[Laravel NATS](https://github.com/zaeem2396/laravel-nats) is an open source package that brings NATS and JetStream into Laravel applications without forcing developers to re-learn their framework. It wraps the [basis-company/nats](https://github.com/basis-company/nats.php) PHP client with Laravel-native configuration, a JSON message envelope, queue drivers, JetStream helpers, and production-oriented features such as idempotency, observability hooks, and optional subject ACLs.

This post walks through why the package exists, what it offers, and how it fits into the broader NATS ecosystem.

## Why Laravel Teams Choose NATS

Modern Laravel applications rarely live in isolation. A typical stack might include:

- HTTP APIs that emit domain events when orders are placed or payments are captured
- Horizon or `queue:work` processes that handle retries and failure tracking
- Multiple services that must stay loosely coupled while sharing a reliable event backbone

NATS fits this model well. It is lightweight, supports pub/sub and queue groups out of the box, and JetStream adds persistence, replay, and deduplication when you need stronger delivery guarantees. For teams already running NATS for Go, Node.js, or Python services, adding a Laravel service that speaks the same protocol avoids operating a second message broker.

The challenge for PHP developers is not NATS itself. It is integrating NATS cleanly with Laravel conventions: configuration, dependency injection, queue semantics, logging, and deployment tooling.

That is the gap Laravel NATS fills.

## Why Use the Laravel NATS Package

Building a custom NATS integration in every Laravel project repeats the same work: connection pooling, envelope conventions, graceful shutdown, health checks, and safe configuration for production. Laravel NATS centralizes that effort into a maintained library with documentation, CI, and semver stability.

### Laravel-native developer experience

Install with Composer, publish config, and use the `NatsV2` facade. The package registers a service provider, merges sensible defaults, and exposes Artisan commands for listening, JetStream operations, config validation, and connectivity checks. You stay inside patterns Laravel developers already know.

### Two tracks with a clear migration path

The package supports a **recommended v2 stack** (`NatsV2` on `basis-company/nats`) and a **legacy stack** (`Nats` on the package's native wire client). Existing workloads keep running while new code adopts `NatsV2`. There are no silent removals in minor releases; migration is documented in the package's [Migration Guide](https://github.com/zaeem2396/laravel-nats/blob/main/docs/v2/MIGRATION.md).

### Production features beyond pub/sub

From package **1.4.0** onward, Laravel NATS ships idempotency middleware, publish metrics hooks, correlation headers, and a `nats_basis` queue driver. From **1.5.0**, optional boot-time config validation, TLS production guards, and client-side subject ACLs help teams catch misconfiguration before traffic hits NATS. From **1.6.0**, W3C trace context propagation, subject-prefix connection routing, and a transactional outbox recipe round out advanced integration patterns.

### Quality and compatibility

The package targets PHP 8.2+, Laravel 10 through 13, and NATS Server 2.x. CI runs Pest tests, PHPStan at level 9, Pint, and PHP-CS-Fixer. Integration tests use Docker NATS, matching how teams run NATS locally.

## How Laravel NATS Contributes to the NATS Ecosystem

NATS succeeds because client libraries and framework integrations lower the cost of adoption across languages and platforms. Laravel NATS extends that reach into one of PHP's largest communities.

### Expanding the PHP client surface

The package builds on **basis-company/nats**, a modern PHP NATS client. Laravel NATS does not replace that client; it documents and exercises it in real application contexts: Laravel queues, middleware pipelines, multi-connection routing, and JetStream stream provisioning. That feedback loop helps PHP remain a first-class citizen in polyglot NATS deployments.

### Enabling polyglot event backbones

When a company standardizes on NATS, Laravel services can publish and subscribe using the same subjects, headers, and JetStream streams as Go or Node.js workers. The package's JSON envelope (`id`, `type`, `version`, `data`) gives cross-language consumers a predictable payload shape. Correlation headers (`X-Request-Id`, `Nats-Correlation-Id`) and optional W3C `traceparent` propagation align Laravel traces with the rest of the mesh.

### Operational patterns the ecosystem expects

Health checks via `php artisan nats:ping`, config validation for CI pipelines, reconnect helpers after dropped sessions, and optional metrics bindings (`NatsMetricsContract`) mirror practices NATS users expect from mature clients in other languages. Teams operating mixed stacks get consistent operational tooling rather than a one-off PHP script.

### Open source and community contribution

Laravel NATS is MIT licensed and welcomes issues and pull requests on [GitHub](https://github.com/zaeem2396/laravel-nats). Documentation is index-first under `docs/v2/`, with copy-paste examples for subscribe, queue groups, ACL, reconnect, outbox, trace context, request/reply, and idempotency. That lowers the barrier for Laravel developers to participate in the NATS community and share production patterns.

## Architecture at a Glance

The v2 stack is a thin Laravel wrapper around `Basis\Nats\Client`. Your application code talks to `NatsV2`; the gateway delegates to publishers, subscribers, and connection management; the basis client handles the NATS wire protocol.

{{< figure src="/img/blog/laravel-nats/laravel-nats-v2-architecture.png" alt="Laravel NATS v2 architecture: Laravel app, NatsV2 facade, ConnectionManager, NatsPublisher and NatsBasisSubscriber, Basis NATS client, NATS server with optional JetStream" >}}

At a high level:

1. **Configuration** lives in `config/nats_basis.php` (env-driven, publishable).
2. **`ConnectionManager`** caches named connections and supports seed lists, TLS, and reconnect.
3. **`NatsPublisher`** wraps publish with the JSON envelope, headers, ACL checks, and optional metrics.
4. **Subscriber API** registers PHP callables that receive `InboundMessage` value objects, with middleware and events.
5. **Queue driver `nats_basis`** reuses the same connection stack for Laravel background jobs.

## Getting Started

### Requirements

- PHP 8.2+ (PHP 8.3+ for Laravel 13)
- Laravel 10.x, 11.x, 12.x, or 13.x
- NATS Server 2.x (JetStream enabled when using stream features)

### Install and configure

```bash
composer require zaeem2396/laravel-nats
php artisan vendor:publish --tag=nats-config
```

Match your `.env` to your NATS endpoint:

```env
NATS_HOST=127.0.0.1
NATS_PORT=4222
NATS_USER=
NATS_PASS=
NATS_TOKEN=
```

For local development, the package repository includes a `docker-compose.yml` that starts NATS with a single command:

```bash
docker compose up -d
```

{{< figure src="/img/blog/laravel-nats/laravel-nats-quickstart-terminal.png" alt="Terminal showing docker compose up and php artisan nats:ping returning success" >}}

Verify connectivity:

```bash
php artisan nats:ping --json
```

## Core Messaging with NatsV2

### Publish with a structured envelope

`NatsV2::publish()` serializes payloads into a versioned JSON envelope. Every message gets a unique `id`, the subject as `type`, a configurable `version`, and your application data under `data`. Non-empty headers are sent as HPUB on the wire.

```php
use LaravelNats\Laravel\Facades\NatsV2;

NatsV2::publish(
    'orders.created',
    ['order_id' => 123, 'total' => 4999],
    ['X-Request-Id' => 'req-abc-123'],
);
```

The resulting envelope on the wire looks like:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "type": "orders.created",
  "version": "1",
  "data": {
    "order_id": 123,
    "total": 4999
  }
}
```

This convention helps polyglot consumers: a Go or Python subscriber can decode the same shape without Laravel-specific serialization.

### Subscribe and process messages

Subscriptions register a PHP callable. The basis client is pull-based, so you call `process()` in a loop (or use the Artisan listener command).

```php
use LaravelNats\Laravel\Facades\NatsV2;
use LaravelNats\Subscriber\InboundMessage;

NatsV2::subscribe('orders.created', function (InboundMessage $message): void {
    $payload = $message->envelopePayload();
    logger()->info('Order received', (array) $payload);
});

while ($running) {
    NatsV2::process(null, 1.0);
}
```

For development and debugging, use the built-in listener:

```bash
php artisan nats:v2:listen orders.created --timeout=1
```

### Queue groups for load-balanced consumers

Pass a queue group name as the third argument to `subscribe()` for NATS queue semantics. Only one member of the group receives each message.

```php
NatsV2::subscribe('jobs.run', $handler, 'worker-pool');
```

{{< figure src="/img/blog/laravel-nats/laravel-nats-queue-group-diagram.png" alt="Diagram showing three Laravel worker processes in queue group worker-pool receiving messages in round-robin from NATS" >}}

## JetStream Integration

From package **1.4.0**, JetStream on the v2 stack uses `Basis\Nats\Api`, `Stream`, and `Consumer` from the basis client. Laravel NATS adds facade helpers, stream presets in config, and Artisan commands.

### Publish to a stream

```php
use LaravelNats\Laravel\Facades\NatsV2;

NatsV2::jetStreamPublish(
    stream: 'ORDERS',
    subject: 'orders.created',
    payload: ['id' => 1],
    useEnvelope: true,
    waitForAck: true,
);
```

### Pull consumers

```php
foreach (NatsV2::jetStreamPull('ORDERS', 'worker-1', batch: 5) as $msg) {
    // Process $msg, then ack explicitly
    $msg->ack();
}
```

### Stream provisioning and CLI

Define presets under `nats_basis.jetstream.presets` and provision from Artisan:

```bash
php artisan nats:v2:jetstream:info
php artisan nats:v2:jetstream:streams
php artisan nats:v2:jetstream:provision example_events
php artisan nats:v2:jetstream:pull ORDERS worker-1
```

JetStream gives Laravel applications durable, replayable event logs alongside Core NATS pub/sub, which suits audit trails, event sourcing light, and at-least-once processing with explicit ack/nak control.

## Laravel Queue on NATS

Laravel NATS provides two queue drivers:

| Driver | Client | When to use |
|--------|--------|-------------|
| `nats` | Legacy `Core\Client` | Existing legacy workloads |
| `nats_basis` | `Basis\Nats\Client` | New and migrated workers (recommended) |

Configure `nats_basis` in `config/queue.php`:

```php
'connections' => [
    'nats_basis' => [
        'driver' => 'nats_basis',
        'queue' => env('NATS_BASIS_QUEUE', 'default'),
        'retry_after' => 60,
        'tries' => 3,
        'prefix' => env('NATS_BASIS_QUEUE_PREFIX', 'laravel.queue.'),
        'dead_letter_queue' => env('NATS_BASIS_QUEUE_DLQ'),
    ],
],
```

Dispatch jobs as usual:

```php
ProcessOrder::dispatch($order)->onConnection('nats_basis');
```

Run workers with standard Laravel commands:

```bash
php artisan queue:work nats_basis --queue=default --tries=3
```

The driver supports dead letter queue routing, per-process `max_in_flight` limits, and the same retry and `failed_jobs` semantics Laravel developers expect. Job payloads use a stable JSON shape compatible with the legacy `nats` driver, which simplifies migration.

{{< figure src="/img/blog/laravel-nats/laravel-nats-queue-worker.png" alt="Supervisor managing multiple php artisan queue:work nats_basis processes connected to NATS" >}}

## Subscriber Middleware and Events

The subscriber pipeline supports middleware, similar in spirit to HTTP middleware. Register classes under `nats_basis.subscriber.middleware`:

| Middleware | Purpose |
|------------|---------|
| `LogInboundMiddleware` | Debug logging of inbound messages |
| `CorrelationLogInboundMiddleware` | Propagate request and correlation IDs into log context |
| `RedactedEnvelopeLogInboundMiddleware` | Log envelope metadata with redacted `data` fields |
| `IdempotencyInboundMiddleware` | Skip duplicate handler invocations when an idempotency key is present |

Enable Laravel events with `NATS_SUBSCRIBER_DISPATCH_EVENTS=true` to fire `NatsInboundMessageReceived` before your handler runs. That is useful for global metrics or auditing without changing every callback.

## Idempotency for At-Least-Once Workloads

Retried publishes, redelivered JetStream messages, and duplicate HTTP callbacks are common in distributed systems. Laravel NATS supports optional idempotency keys on publish and deduplication on subscribe.

### Publish with an idempotency key

Include `idempotency_key` in the payload. The publisher strips it from `data`, places it on the envelope root, and mirrors it as an HPUB header (default `Nats-Idempotency-Key`):

```php
NatsV2::publish('payments.captured', [
    'idempotency_key' => 'pay_evt_' . $paymentId,
    'payment_id' => $paymentId,
    'amount' => 1000,
]);
```

### Subscribe with deduplication middleware

```env
NATS_IDEMPOTENCY_ENABLED=true
NATS_IDEMPOTENCY_TTL=86400
NATS_IDEMPOTENCY_CACHE_STORE=redis
```

Register `IdempotencyInboundMiddleware` in config. When a duplicate key arrives within the TTL, the handler is not invoked. Use a shared cache store (Redis) in production so all worker processes share reservations.

This pattern complements JetStream's server-side deduplication (`Nats-Msg-Id` header): application-level idempotency protects your business logic even when the transport layer cannot deduplicate on its own.

## Observability and Correlation

### Publish metrics

Rebind `NatsMetricsContract` to emit counters and histograms to Prometheus, OpenTelemetry, or StatsD:

```php
use LaravelNats\Observability\Contracts\NatsMetricsContract;

$this->app->singleton(NatsMetricsContract::class, YourMetricsImplementation::class);
```

When `NATS_OBSERVABILITY_METRICS=true`, the publisher records `laravel_nats.publish.total` with `connection` and `outcome` labels. Optional latency histograms are available via `NATS_OBSERVABILITY_PUBLISH_LATENCY_MS`.

### Correlation across HTTP and NATS

When `NATS_CORRELATION_INJECT=true`, `NatsV2::publish()` copies `X-Request-Id` and `Nats-Correlation-Id` from the current HTTP request into HPUB headers. Subscribers read them via `InboundMessage::requestId()` and `correlationId()`.

Build headers fluently with `NatsHeaderBag`:

```php
use LaravelNats\Support\NatsHeaderBag;

$headers = NatsHeaderBag::make()
    ->withRequestId('req-1')
    ->withCorrelationId('corr-1')
    ->withIdempotencyKey('idem-1')
    ->toArray();

NatsV2::publish('orders.created', ['order_id' => 123], $headers);
```

### Health checks

Use `php artisan nats:ping` in deploy scripts or expose a readiness route that returns 503 when NATS is unreachable. Pair this with Laravel's scheduler and your existing load balancer health probes.

## Security and Production Hardening

Client-side controls do not replace NATS server authentication and authorization. They reduce configuration mistakes in application code.

### Boot-time validation

```env
NATS_BASIS_VALIDATE_CONFIG=true
```

The service provider validates connection rows on boot: non-empty host, valid port range, positive timeout. Invalid config throws `NatsConfigurationException` so the app fails fast.

Run the same checks in CI:

```bash
php artisan nats:v2:config:validate
```

### TLS in production

When `NATS_TLS_REQUIRE_IN_PRODUCTION=true` and `APP_ENV=production`, each connection must specify TLS material (CA file, client cert/key, or `tlsHandshakeFirst`). This prevents accidental plaintext-only settings in production.

### Subject ACL allowlists

```env
NATS_ACL_ENABLED=true
NATS_ACL_PUBLISH_PREFIXES=orders.,billing.
NATS_ACL_SUBSCRIBE_PREFIXES=orders.,events.
```

`NatsPublisher`, `BasisJetStreamPublisher`, and `NatsBasisSubscriber` enforce prefix rules before wire operations. Trailing dots denote prefix matches (`orders.` allows `orders.created` but not `orders` alone).

Note: the `nats_basis` queue driver publishes directly via the basis client, so ACL does not cover queue subjects. Restrict those with NATS server authorization and careful queue prefix configuration.

## Advanced Features (v2.7)

### W3C trace context

Propagate `traceparent` and `tracestate` from HTTP requests into NATS headers for distributed tracing:

```env
NATS_TRACE_CONTEXT_INJECT=true
```

```php
$headers = NatsHeaderBag::make()
    ->withTraceContext(
        '00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01',
        'rojo=00f067aa0ba902b7',
    )
    ->toArray();

NatsV2::publish('orders.created', ['order_id' => 123], $headers);
```

Subscribers read trace context via `$message->traceParent()` and `$message->traceState()`.

### Subject-prefix connection selection

Route subjects to named NATS clusters without passing a connection argument on every call:

```env
NATS_CONNECTION_SUBJECT_PREFIXES="orders.eu.:orders-eu,orders.:orders,billing.:billing"
```

Longest prefix wins. Explicit `connection:` arguments still override the selector.

### Transactional outbox

The outbox recipe keeps storage in your application while the package provides DTOs and a dispatcher:

```php
$result = NatsV2::dispatchOutbox(app(DatabaseNatsOutboxStore::class));

logger()->info('NATS outbox drained', [
    'published' => $result->published(),
    'failed' => $result->failed(),
]);
```

Insert outbox rows in the same database transaction as your business write, then drain them from a scheduled Artisan command. That gives you atomicity between your database and NATS publishes without two-phase commit.

### Request/reply and reconnect

`NatsV2::request()` performs synchronous request/reply with timeout and no-responder handling. From **1.6.2**, `NatsV2::reconnect()` drops cached clients after a dropped session and opens a fresh connection. `NatsV2::drainConnection()` runs `process()` for a bounded time before disconnecting, useful for graceful shutdown in long-running workers.

```php
try {
    $reply = NatsV2::request('inventory.check', ['sku' => 'ABC-123'], timeout: 2.0);
} catch (NatsNoRespondersException $e) {
    // No subscriber available
} catch (NatsRequestTimeoutException $e) {
    // Timed out waiting for reply
}
```

## Dual Stack and Migration

Teams with existing Laravel NATS integrations on the legacy `Nats` facade and `nats` queue driver can migrate incrementally:

1. Adopt `NatsV2` for new publish and subscribe code.
2. Move queue workers to `nats_basis` when ready.
3. Switch JetStream workflows to `NatsV2::jetstream()` helpers.
4. Enable security validation and ACL as you harden production.

Legacy APIs remain supported; the [Migration Guide](https://github.com/zaeem2396/laravel-nats/blob/main/docs/v2/MIGRATION.md) maps config keys, facade methods, and testing checklists per release.

## Feature Summary

| Area | Highlights |
|------|------------|
| **Messaging** | `NatsV2::publish`, `subscribe`, `process`, queue groups, wildcards |
| **Envelope** | Versioned JSON with `id`, `type`, `version`, `data` |
| **JetStream** | Publish, pull, stream presets, Artisan CLI |
| **Queue** | `nats_basis` driver, DLQ, retries, Supervisor-friendly workers |
| **Idempotency** | Publish keys, subscribe middleware, pluggable store |
| **Observability** | Metrics contract, correlation headers, redaction, `nats:ping` |
| **Security** | Config validation, TLS guard, subject ACL |
| **Tracing** | W3C trace context inject and read |
| **Routing** | Named connections, subject-prefix selection |
| **Reliability** | Reconnect, drain, bootstrap failover with seed lists |
| **Outbox** | Storage-agnostic transactional publish recipe |
| **Protocol** | HPUB headers, multi-value headers, request/reply |

## When Laravel NATS Is the Right Choice

Consider Laravel NATS when you:

- Already run NATS in your organization and want Laravel services on the same event backbone
- Need Laravel queue semantics (retries, failed jobs, DLQ) backed by NATS instead of Redis or SQS
- Want JetStream persistence and consumer management without leaving PHP/Laravel
- Require production guardrails (validation, TLS checks, ACL, idempotency) in a package rather than bespoke code
- Operate polyglot microservices and need consistent envelopes, correlation, and trace headers across languages

If you only need occasional fire-and-forget messages with no Laravel integration requirements, a bare NATS PHP client may suffice. For Laravel applications that will grow into event-driven architectures, the package saves time and encodes community-tested patterns.

## Try It Today

```bash
composer require zaeem2396/laravel-nats
php artisan vendor:publish --tag=nats-config
docker compose up -d   # if using the package's local NATS compose file
php artisan nats:ping
```

Documentation index: [github.com/zaeem2396/laravel-nats/blob/main/docs/INDEX.md](https://github.com/zaeem2396/laravel-nats/blob/main/docs/INDEX.md)

Examples: [github.com/zaeem2396/laravel-nats/tree/main/docs/v2/examples](https://github.com/zaeem2396/laravel-nats/tree/main/docs/v2/examples)

Contributions, issue reports, and production feedback are welcome on [GitHub](https://github.com/zaeem2396/laravel-nats).

## About the Author

Zaeem maintains [Laravel NATS](https://github.com/zaeem2396/laravel-nats) and contributes to making NATS accessible to the Laravel and PHP communities. Find the project on GitHub at [github.com/zaeem2396/laravel-nats](https://github.com/zaeem2396/laravel-nats).
