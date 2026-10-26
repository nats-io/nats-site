+++
date = "2026-10-26"
draft = true
title = "How Cordum routes agent jobs over NATS"
author = "Yaron Torgeman"
categories = ["Engineering", "Community"]
tags = ["NATS", "JetStream", "AI", "agents", "Cordum"]
+++

Consider a hypothetical infrastructure workflow: an agent proposes restarting a production service, but a person must approve the job before a worker can act. Approval must not be confused with completion, and an operator needs a trace from the original request to the recorded result. The restart operation is illustrative; the gateway, scheduler and worker boundaries below are the Cordum implementation being described.

I use NATS in Cordum to carry agent jobs from an API gateway to a scheduler and workers, then carry results back. Policy checks happen in the control plane. NATS supplies the messaging layer. Keeping those responsibilities separate makes the execution path easier to inspect, especially when a job is denied, held for approval or delivered again.

I'm Yaron Torgeman, the solo developer behind [Cordum](https://github.com/cordum-io/cordum), with 15 years in software, infrastructure and cybersecurity. Cordum coordinates policy-controlled agent work. Its components exchange messages using the [Cordum Agent Protocol, or CAP](https://github.com/cordum-io/cap). This walkthrough follows the HTTP gateway, scheduler and included Go worker.

## Follow a job through the system

The HTTP gateway receives a job with a topic and input. Before publishing the job for execution, it evaluates admission policy. A denied request is recorded and rejected. A request requiring approval is held; it does not enter the worker path merely because the API received it.

For an allowed job, the gateway stores input and job metadata in Redis and publishes a CAP job request on `sys.job.submit`. The scheduler consumes that request and applies its dispatch gate before choosing an eligible worker. Both gates call the Safety Kernel through gRPC. The broker does not make the policy decision.

## Give subjects and pointers different jobs

The subject definitions keep the control path explicit. Submission uses `sys.job.submit`; workers return results on `sys.job.result`. Dispatch can target `worker.<id>.jobs`, with topic routing under `job.>` also supported. Worker selection belongs to the scheduler, which considers the configured pool and available worker information. An empty pool is a scheduling problem, not a reason to publish blindly and assume something will execute.

Large input and output data take a different path. The request carries a context pointer; the worker retrieves the context, executes its handler, stores the result and publishes a result pointer. Redis holds application state and payloads, while NATS carries the messages that move the job forward. This keeps the message contract separate from the payload's storage and retention rules.

Completion also has an application boundary. The scheduler processes a worker result and records the result pointer before the terminal job state. It then emits `sys.internal.job.result.accepted`. The workflow runner subscribes to that accepted-result subject, rather than advancing directly from an unchecked worker result. Approval follows another path: an explicit approval returns a held job to pending submission. Approval is permission to continue, not evidence of completion.

## Trace an approval before execution

A job held for approval makes these boundaries easy to see. Its absence from the worker's subject is expected, rather than evidence that NATS lost a message. The gateway has recorded the request but has not published it for execution. Once an explicit approval resumes the job, the request returns to `sys.job.submit`. The scheduler validates the stored approval against the job before allowing dispatch.

The useful debugging exercise is to follow one job identifier through admission, submission, dispatch and result handling. Check the configured subject and worker subscription as well as the application's recorded state. For example, the scheduler marks a job running after publishing its dispatch; that state is not a broker-level acknowledgement that the worker's handler has begun. The hello-worker example in the Cordum repository shows how the worker side fits into this path.

## Check each delivery boundary

The Compose configuration explicitly enables JetStream for core services. The bus implementation creates file-backed streams for system and job subjects. Core-service consumers use explicit acknowledgements on the durable paths. Heartbeats, cancellation and progress use Core NATS publish and subscribe paths. They should not be described as having the same delivery behavior as a durable consumer.

There is an important implementation detail here: the included Go worker's CAP runtime uses a Core NATS queue subscription and Core publish calls. A stream can capture messages on its subjects without making that worker a durable JetStream consumer. If a deployment requires recovery of work missed while workers are offline, the worker's consumer and acknowledgement design must provide that guarantee too. The [NATS guide to acknowledgements](https://docs.nats.io/using-nats/developer/develop_jetstream/model_deep_dive) explains the consumer side of this guarantee.

JetStream availability also needs verification. The core bus can run in Core NATS mode, and its current initialization path can fall back if JetStream is unavailable. Enabling a setting is not sufficient evidence of the delivery mode actually in use. Stream retention, replica count and consumer configuration belong in deployment checks, alongside Redis persistence.

## Make retries safe at the application boundary

Cordum has scoped duplicate controls, including message identifiers, a stream deduplication window, per-job locking and terminal-state checks. These reduce repeated processing within their respective boundaries. They do not make an external action execute exactly once.

A worker can complete a side effect and fail before its result is recorded. A retry then needs an application-level answer: reuse an idempotency key supported by the downstream service, or reconcile whether the operation already happened before repeating it. This is especially important for agent tools that change infrastructure or other external state.

Redis and NATS also do not share a transaction. Persisting state and publishing a message are separate operations, so failure handling must account for a successful write followed by a failed publish. For me, this is the useful way to reason about the design: trace each transition, identify who owns it and verify what can be replayed safely.

The implementation is available in [Cordum](https://github.com/cordum-io/cordum), whose core is licensed under BUSL 1.1. [CAP](https://github.com/cordum-io/cap) is a separate Apache 2.0 licensed project. The distinction matters for anyone evaluating the protocol, integrating a worker or reusing code.

NATS fits this design because subject-based routing lets the gateway, scheduler and workers communicate without hard-wiring every peer, while queue subscriptions and JetStream provide distinct tools for distributing work and retaining messages. I can keep policy decisions and job state in the control plane and choose delivery semantics at each boundary. To explore the design, start with Cordum and the CAP protocol, then follow the code for the exact behavior of each component.
