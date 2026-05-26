+++
categories = ["Engineering"]
date = "2026-05-25"
tags = ["NATS", "AI", "Agents"]
title = "What's old is new: A NATS-native protocol for AI agents"
author = "Andrew Connolly"
+++

Agent systems are becoming distributed systems, and NATS already solves many of the communication problems those systems are rediscovering.

NATS has long been a natural fit for distributed, heterogeneous systems. No matter where your devices run, what languages your services use, or how ephemeral your clients are, NATS gives them a simple way to find and talk to one another. And NATS easily bridges different cloud vendors, geographies, runtimes, or hardware.

These traits make NATS an obvious choice for multi-agent architectures. **Set aside the AI language, and agents have many of the same needs as microservices**:

* Discover peers and their capabilities
* Exchange messages across boundaries
* Handle long-running requests without blocking
* Notice when peers come and go

Plus, as orgs race to ship products and services enabled by agents (or build internal agentic workflows), **they aren’t building on one unified agent stack**. They’re mixing models, clouds, runtimes, private data, and physical environments that no layer of their stack can fully understand or control.

> At production scale, agentic systems are distributed systems in a trench coat.

And most teams are stuck gluing them together with HTTP or shoehorning everything into a vendor’s gateway or mesh.

The open source [Synadia Agent Protocol for NATS](https://github.com/synadia-ai/synadia-agent-sdk-docs) lets agents of any kind be addressed on a single fabric. This new protocol on top of NATS isn’t an agent framework, or a runtime, or a product of any kind. It’s a contract that says:

> _If an agent does these few specific things, anything else on the same NATS system can find it and talk to it without knowing what framework you built the agent with_.

The payoff is that callers don't need to care whether an agent is a Python script, a hosted model wrapper, a CLI session, or a long-running service. They discover capabilities, send a prompt, receive a typed stream, and observe liveness the same way every time.

When all your agents speak NATS fluently, you can build the surfaces that work across them — monitor, audit, orchestrate, whatever your architecture needs.

The protocol itself has three responsibilities: discovery, conversation, and liveness.

## Discovery

An agent registers as a NATS micro service with the service name `agents`. Its metadata describes itself — what kind of agent it is, who owns it, what protocol version it implements, optionally what session it belongs to. A caller that wants to know which agents are reachable sends a standard micro service ping at `$SRV.PING.agents` (or asks for full info at `$SRV.INFO.agents`), and every running agent that matches the caller's permissions answers. No registry. No service catalog. No coordinator process you have to keep alive. The thing NATS already does for every other micro service on the cluster is the thing it does for agents too.

Discovery returns full endpoint records: the subject to publish prompts to, capability metadata like maximum payload size and whether attachments are accepted, and the queue group the agent has joined. Callers read these from `$SRV.INFO` rather than constructing them from identity, which means an agent can move subjects without breaking its callers.

## Conversation

Once a caller has an endpoint subject, prompting is one NATS request. The default subject pattern is `agents.prompt.{agent}.{owner}.{name}` — verb-first, so every endpoint type owns its own slot in the hierarchy and a wildcard like `agents.prompt.>` cleanly partitions all prompt traffic from everything else.

The agent answers by streaming typed JSON chunks back to the caller's reply inbox. Each chunk is `{type, data}`:

- `response` chunks carry content (a string or an object with `text` and optional `attachments`).
- `status` chunks carry lifecycle signals. The protocol mandates exactly one `ack` status chunk as the very first message on the reply subject, before any latency-inducing work, so the caller knows the request was received and its inactivity timer can be reset.
- `query` chunks let the agent pause and ask the caller a mid-stream question — a permission prompt, a clarification, a menu selection — supplying a fresh reply subject for the answer. The response stream stays open.

Every stream — successful or errored — ends with the same signal: a zero-byte message carrying no headers. Errors arrive as a NATS micro service error-headered message (`Nats-Service-Error-Code`, `Nats-Service-Error`) immediately before the terminator, with an optional JSON body for structured detail.

That's the entire conversation: typed chunks in publication order, ack first, terminator last.

## Liveness

Every agent publishes a small heartbeat on `agents.hb.{agent}.{owner}.{name}` at a configurable cadence (30 seconds by default). The payload carries the agent's identity, its per-instance `instance_id`, a UTC timestamp, and the cadence itself. The heartbeat subject is the one subject the protocol fixes (instead of letting agents override it), so a caller can subscribe to `agents.hb.*.*.*` and watch every agent on the cluster come up, stay up, and go offline — without ever polling. An instance is considered offline after three missed beats.

For point-in-time liveness, every agent also exposes a `status` request/reply endpoint that returns the same payload shape as a heartbeat, freshly built on demand. A caller that just connected can bootstrap its liveness tracker without waiting up to a full interval for the next beat.

## The details, in one place

What the protocol actually pins down, beyond the three jobs:

- **Subject hierarchy** — `agents.{verb}.{agent}.{owner}.{name}`. Verbs: `prompt`, `hb`, `status`, `attachments` (reserved for future chunked upload). Tokens follow standard NATS subject naming.
- **Service registration** — micro service `name = "agents"`; required metadata: `agent`, `owner`, `protocol_version`, plus `session` when session-aware.
- **Queue group** — the `prompt` and `status` endpoints both register with queue group `"agents"`, which load-balances across same-identity instances without per-deployment coordination.
- **Discovery subjects** — exactly two are stable: `$SRV.PING.agents` and `$SRV.INFO.agents[.{instance_id}]`. Callers MUST read endpoint subjects from `$SRV.INFO`, not construct them.
- **Endpoint capability metadata** — the `prompt` endpoint declares `max_payload` (e.g. `"1MB"`) and `attachments_ok` (boolean). Callers enforce both locally before publishing.
- **Request envelope** — either plain UTF-8 text (shorthand for `{"prompt": <text>}`) or a JSON object with `prompt` (required, non-empty string) plus optional `attachments[]`. Discrimination is by the first non-whitespace byte: `{` means JSON.
- **Attachments** — `{filename, content}` where `content` is standard-alphabet padded base64 (RFC 4648 §4), no URL-safe encoding, no whitespace. No MIME type carried.
- **Unknown fields** — decoders MUST tolerate unknown top-level fields and preserve them when relaying.
- **Response chunks** — `{type, data}` JSON objects. v0.3 defines three types: `response`, `status`, `query`. Plain text is not accepted on the response side. Callers MUST silently ignore unknown chunk types.
- **`response` chunk shape** — `data` is either a string (which IS the text) or an object `{text, attachments?}`. Multiple `response` chunks concatenate in publication order.
- **`status` values** — v0.3 defines `ack` (mandatory first message on every reply, before any work that introduces observable latency). Unknown values are silently ignored.
- **`query` chunk shape** — `{id, reply_subject, prompt, attachments?}`. Caller publishes exactly one reply to `reply_subject`. Multiple queries MAY be in flight concurrently within a single stream.
- **Stream termination** — every stream ends with a zero-byte body, zero-header message. No further publishes after the terminator.
- **Delivery semantics** — at-most-once (core NATS). Callers MUST apply a per-stream inactivity timeout; recommended default 60 seconds since the last observed chunk.
- **Heartbeat payload** — `{agent, owner, session?, instance_id, ts, interval_s}` on `agents.hb.{agent}.{owner}.{name}`. Default cadence 30s. Recommended offline threshold: 3 × `interval_s`.
- **Subscribe-before-discover** — callers SHOULD subscribe to the heartbeat wildcard before their first `$SRV.PING.agents` to avoid races.
- **`status` endpoint** — request/reply at `agents.status.{agent}.{owner}.{name}`. Reply payload uses the heartbeat shape.
- **Error reporting** — NATS micro service error headers (`Nats-Service-Error-Code`, `Nats-Service-Error`) plus optional JSON body `{error, message, ...}`. Mid-stream errors are followed by the standard terminator.
- **Security** — delegated entirely to NATS accounts, users, and subject permissions. E2E encryption and strong agent identity are deferred.

## Small, composable primitives

The protocol is intentionally narrow. It doesn't define how an agent thinks, what model it runs, how it persists memory, whether it uses tools, how it bills, or who pays. It doesn't ship a runtime. It doesn't mandate a framework. It tells you the smallest possible set of things an agent has to put on NATS so that the rest of the ecosystem can address it, prompt it, and notice it.

That's deliberately the same shape NATS itself takes. NATS handles subjects, headers, and the request/reply contract, and leaves everything above that to applications. The agent protocol handles a subject convention, a request envelope, a chunk format, and a heartbeat, and leaves everything above *that* to agents.

The same way a NATS micro service today can be written in any language and consumed from any other, a compliant agent today can be a wrapped Claude Code session, a DSPy ReAct loop, a long-running daemon written in Go, or a one-shot Python script — and any caller that speaks the protocol can talk to all of them with the same code path.

## What's not included (but might be soon)

Some pieces are deliberately deferred to keep the initial version small. A few of the areas we expect to touch in upcoming extensions of the protocol:

* a chunked `attachments` endpoint for large files
* JetStream-backed at-least-once delivery
* stronger per-agent identity
* durable state and handoff
* audit traces

## Where to find it

Reference SDKs in TypeScript and Python implement the protocol, but the NATS CLI can speak it by hand and anything else that knows the rules can join the conversation.

- Specification: [github.com/synadia-ai/synadia-agent-sdk-docs](https://github.com/synadia-ai/synadia-agent-sdk-docs)
- Reference SDKs and harnesses: [github.com/synadia-ai/synadia-agents](https://github.com/synadia-ai/synadia-agents)
