+++
categories = ["Engineering"]
date = "2026-08-01"
tags = ["NATS", "AI", "Agents", "JetStream"]
title = "Coordinating Teams of AI Agents in Real Time on NATS and JetStream"
author = "David Farah and Sven Jonscher"
+++

*Guest post by David Farah and Sven Jonscher, creators of [Cotal](https://github.com/Cotal-AI/Cotal).*

We build Cotal, the open standard for AI agents to work together in one shared space.
Our first multi-agent prototypes taught us where the real difficulty lives: in the wiring
between agents. Who can talk to whom? What happens to a message when the recipient is
busy? Who is even online right now?

Most frameworks settle those questions for you by imposing a single shape, usually a controller handing out work to workers that never talk
to each other. We wanted the shape to be configuration. A topology in Cotal is a graph:
peers talk sideways in shared channels, pipelines hand work down a DAG of specialists,
and a supervisor with workers is simply one of the shapes you can write down in a config
file. To get there without reinventing a message bus, we built the entire contract on
NATS and JetStream.

<img class="img-responsive center-block" src="/img/blog/coordinating-ai-agent-teams-on-nats/topologies.png" alt="Three Cotal topologies: a flat team of peers, a supervised tree, and a DAG pipeline">
<figcaption>One wire contract, three of the shapes it runs: the topology lives in a config file.</figcaption>

## Before NATS: everything is bespoke

Coordination for agents sounds simple until you write it down. A message to a busy agent
has to wait somewhere durable until the agent can take it. An agent that comes online
late needs to catch up on what it missed. "Send this to any available reviewer" needs a
work queue with exactly-once handoff. Every agent needs a live presence signal so peers
can see who is idle and who is heads-down. And because agents now act with real
authority, a sender cannot be allowed to simply claim to be someone else in the payload.
Build all of that yourself and you have written a broker, a queue, a presence service,
and an auth layer before you have coordinated a single agent.

## With NATS: the hard parts already exist

Cotal itself stays thin: a set of subject conventions, message schemas, and required
client behaviors, with NATS doing the heavy lifting underneath. Our three addressing
modes map straight onto primitives NATS already ships:

- **Multicast** (broadcast to a channel) is subject fan-out on `cotal.<space>.chat.>`.
  Everyone subscribed to a channel receives the message.
- **Unicast** (message one peer, durably) is a per-agent inbox backed by a JetStream
  durable consumer on `inst.>`. A message to a busy or offline agent waits on the stream
  and is delivered when the agent frees up. Nothing is lost.
- **Anycast** (reach any one of a role) is a JetStream work queue on `svc.>`. Address a
  service like "reviewer" and exactly one available instance claims the work. Delegation
  and load-balancing fall out of the addressing, with no worker named by hand.

Underneath all three is **presence**, which is just a per-space NATS KV bucket with TTL
and heartbeats. Each agent publishes a live state (idle, working, waiting, offline) plus
its capabilities, and any peer can watch the bucket to see who is doing what. Channels
carry their own registry in KV too, watched live, so a late joiner discovers the space as
it is. Durable delivery, per-reader bookmarks, and late-join history replay are all
JetStream doing what JetStream does. We did not write any of it.

<img class="img-responsive center-block" src="/img/blog/coordinating-ai-agent-teams-on-nats/architecture.png" alt="Cotal's three addressing modes and presence mapped onto NATS and JetStream primitives">
<figcaption>Every delivery mode is a NATS primitive wearing a Cotal subject.</figcaption>

## Sender identity rides the subject

The part we are proudest of is the part with the least code in it. In Cotal the sender's
name is the last token of the subject, `cotal.<space>.inst.<target>.<sender>`, and the
server polices it against the agent's JWT. If that token disagrees with who the
connection actually is, the publish is refused before anyone reads it, fail-closed, so
one agent cannot impersonate another. We lean on decentralized NATS auth with account as
space and user as agent, and deny-by-default per-agent ACLs. Direct messages stay
confidential by construction: delivery is ACL-gated by subject, and each agent's inbox is
a pre-created, bind-only durable consumer it cannot re-create or re-target. Account
isolation, subject-level permissions, and JWT-based auth are what let us make strong
security guarantees with a small spec.

<img class="img-responsive center-block" src="/img/blog/coordinating-ai-agent-teams-on-nats/subject.png" alt="Anatomy of a Cotal direct-message subject: prefix, space, mode, target, and the ACL-pinned sender token">
<figcaption>Anatomy of a direct message: the sender token is enforced by the server, so it can be trusted by the reader.</figcaption>

## Where we are, and where we are going

Cotal runs today with a TypeScript reference implementation, a CLI, a supervisor, and
connectors for Claude Code, OpenCode, Hermes, and pi, all speaking the same wire
contract. Because the contract is subjects, streams, and accounts, the same setup goes
from one laptop to a clustered, multi-machine deployment unchanged, which is exactly the
NATS property we were counting on. It also composes naturally with the recently announced
NATS Agent Protocol: that contract lets a caller discover and prompt any single agent on
the fabric, while Cotal is the layer where a team of those agents coordinates as peers.

The heaviest user so far is Cotal itself. We develop the project with agent teams on a
Cotal mesh: feature work happens in channels, a panel of reviewer agents picks apart
every change before it lands, and verification jobs go out by anycast to whichever
tester is free. The screenshot below is one of those review channels, live.

<img class="img-responsive center-block" src="/img/blog/coordinating-ai-agent-teams-on-nats/dashboard-channel.png" alt="The Cotal web dashboard: online roster and channels on the left, a review channel mid-discussion, and presence tiles across the top">
<figcaption>The web dashboard on a live space: the roster and channels on the left, a review team mid-discussion, and presence rolled up into the tiles along the top.</figcaption>

Where this goes is scale. A space holds five agents today and can hold five thousand
tomorrow: adding one costs a subscription and a KV entry, and the clustering,
superclusters, and leaf nodes that already carry global NATS deployments carry a space
across machines and organizations unchanged. Next we are documenting the wire spec fully
enough for clients in other languages, since anything with a NATS client can implement
it. That is a step toward the end state we are building for: an internet of agents, open
addressable spaces where anyone's agents can find each other and work together, with
identity and access control built into the fabric from day one.

<img class="img-responsive center-block" src="/img/blog/coordinating-ai-agent-teams-on-nats/dashboard-graph.png" alt="The Cotal web dashboard graph view: a live force-directed constellation of channels and agents">
<figcaption>The web dashboard's graph view of a running space: channels and agents as nodes, a wire per membership, glowing as messages flow.</figcaption>

If you are building multi-agent systems, the lesson we would pass on is one this
community already knows: reach for the NATS primitive before you build your own. For us,
presence became a KV bucket, inboxes became durable consumers, roles became work queues,
and sender identity became a subject token. We got a coordination standard out of
composing what was already there.

## Try it

Cotal is Apache-2.0, and a local mesh is three commands:

```bash
curl -fsSL https://get.cotal.ai | sh
cotal setup
cotal up
```

Or hand the setup to the agent you already run: tell it to read
[docs.cotal.ai/prompt.md](https://docs.cotal.ai/prompt.md) and set Cotal up on your
machine. The docs are written to be readable by agents as well as humans.

The spec and reference implementation live at
[github.com/Cotal-AI/Cotal](https://github.com/Cotal-AI/Cotal), with docs at
[docs.cotal.ai](https://docs.cotal.ai). If you try it, come tell us what you built. And
if you read the wire contract and spot a NATS feature we should be using better, open an
issue. That is exactly the conversation we are hoping to have with this community.
