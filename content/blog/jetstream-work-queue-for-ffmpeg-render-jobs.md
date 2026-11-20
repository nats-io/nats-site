+++
date = "2026-11-16"
draft = false
title = "A JetStream work queue for FFmpeg render jobs"
author = "Mark Santos"
categories = ["Engineering"]
tags = ["NATS", "JetStream", "FFmpeg", "Python"]
+++

Video work produces a steady pile of render jobs: transcodes, loudness passes, exports for each platform. They are slow, they occasionally fail on a bad input, and the same job must not be rendered twice into the same file. A JetStream work queue fits that shape well: jobs wait in a stream, any number of workers pull them, and a job leaves the stream only when a worker acknowledges it.

I'm a video editor, and I built and tested this pattern with FFmpeg as the workload. This post walks through the stream, the consumer and a worker in Python, then the four situations that matter in practice: a render that takes longer than the acknowledgement timeout, an input that will never render, an output that renders but fails a quality check, and a job submitted twice. Every result below comes from running it against nats-server 2.15.2 with nats-py 2.16.0 and FFmpeg 9.0.2.

## The stream and the consumer

Jobs go to a stream with work-queue retention, so each job is delivered to one worker and removed once that worker acks it. A second stream keeps the results:

```python
from nats.js.api import AckPolicy, ConsumerConfig, RetentionPolicy, StreamConfig

await js.add_stream(StreamConfig(
    name="RENDER", subjects=["render.jobs.*"],
    retention=RetentionPolicy.WORK_QUEUE,  # a job leaves the stream once a worker acks it
    duplicate_window=120))                  # same Nats-Msg-Id within 2 min = same job
await js.add_stream(StreamConfig(name="RESULTS", subjects=["render.results.*"]))
await js.add_consumer("RENDER", ConsumerConfig(
    durable_name="workers", ack_policy=AckPolicy.EXPLICIT,
    ack_wait=30, max_deliver=3, filter_subject="render.jobs.*"))
```

Every worker binds to the same durable pull consumer, `workers`. JetStream hands each job to one of them, and `ack_wait` and `max_deliver` decide what happens when a worker goes quiet or a job keeps failing.

## Submitting a job

A job is a small JSON document: an id, the input, the FFmpeg arguments and the output path. The job id doubles as the message id:

```python
await js.publish(f"render.jobs.{job['id']}", json.dumps(job).encode(),
                 headers={"Nats-Msg-Id": job["id"]})
```

With `duplicate_window=120`, publishing the same id again within two minutes is acknowledged but not stored. In the test, submitting `ep1` twice and `ep2` once produced:

```text
ep1: seq 1
ep1: seq 1 (duplicate, ignored)
ep2: seq 2
```

A double-clicked button or a retried upload hook becomes one render.

## The worker

Each worker fetches one job at a time, renders it, checks the result and then acknowledges in one of three ways:

```python
sub = await js.pull_subscribe_bind("workers", stream="RENDER")
while True:
    try:
        msgs = await sub.fetch(1, timeout=5)
    except nats.errors.TimeoutError:
        continue
    msg = msgs[0]
    job = json.loads(msg.data)
    n = msg.metadata.num_delivered

    hb = asyncio.create_task(heartbeat(msg))   # see the next section
    root, ext = os.path.splitext(job["output"])
    tmp = f"{root}.{name}-{n}.part{ext}"     # each delivery renders to its own file
    code, tail = await render(job, tmp)
    hb.cancel()

    if code != 0:
        await msg.nak(delay=2)                 # maybe transient: try again later
    else:
        lufs, peak = measure(tmp)
        if abs(lufs - TARGET_LUFS) <= TOLERANCE and peak <= MAX_TP:
            os.replace(tmp, job["output"])     # only a checked file goes into place
            await msg.ack()
        else:
            await msg.term()                   # rendering again gives the same file
```

`render()` runs FFmpeg with `asyncio.create_subprocess_exec`, so the event loop stays free for the heartbeat. With three workers and six short jobs, every job ran exactly once, two per worker.

## Long renders and AckWait

`ack_wait` is how long JetStream waits for an acknowledgement before it assumes the worker died and delivers the job to someone else. Render times vary a lot, so any fixed value is wrong for some job.

To make this repeatable, the test job reads a 12-second clip with FFmpeg's `-re` flag, which makes the encode take about as long as the clip, and the consumer has `ack_wait` set to 5 seconds. Two workers are running. Without heartbeats:

```text
w1: long start (delivery 1) at 22:57:14
w2: long start (delivery 2) at 22:57:19
long  ok  delivery 1 by w1 in 11.6s
long  ok  delivery 2 by w2 in 11.6s
```

Five seconds into the first render, JetStream redelivered the job and the second worker started rendering the same thing. Both renders finished. Before I gave each delivery its own temporary file, both FFmpeg processes were writing to the same output path at the same time.

The fix is to tell JetStream the job is still alive. `in_progress()` resets the acknowledgement timer:

```python
async def heartbeat(msg):
    while True:
        await asyncio.sleep(HEARTBEAT)   # well under ack_wait
        await msg.in_progress()
```

With a heartbeat every 2 seconds and the same 5-second `ack_wait`, the job ran once, on one worker, and the other worker never saw it. `ack_wait` can then stay short, so a worker that really crashes gives up its job quickly.

## Inputs that will never render

A truncated upload fails every time. The worker naks it with a short delay, JetStream redelivers it, and after `max_deliver` attempts it stops:

```text
broken  error  delivery 1 by w2  (Error opening input files: Invalid data found when processing input)
broken  error  delivery 2 by w1
broken  error  delivery 3 by w2
dead letter: broken after 3 deliveries (stream seq 1)
```

When a job reaches `max_deliver`, JetStream publishes a `MAX_DELIVERIES` advisory for that stream and consumer with the job's stream sequence, so a small watcher can fetch the original message and record it:

```python
async def on_advisory(m):
    adv = json.loads(m.data)
    original = await js.get_msg("RENDER", adv["stream_seq"])
    record_dead_letter(json.loads(original.data))
    await js.delete_msg("RENDER", adv["stream_seq"])

await nc.subscribe("$JS.EVENT.ADVISORY.CONSUMER.MAX_DELIVERIES.RENDER.workers", cb=on_advisory)
```

The last line matters. After the third failure the consumer stopped delivering the job, but with work-queue retention it was still in the stream: one message was left in `RENDER` after the run. Deleting it once it's recorded leaves the queue empty.

## Checking the output before acking

A render can succeed and still be wrong. The worker measures the output's integrated loudness and true peak with FFmpeg's `ebur128` filter and only acks a file that meets the spec (-14 LUFS ± 1 LU, true peak at or below -1 dBTP). In the test, a job that stream-copied a quiet source instead of normalizing it came back at -61.8 LUFS:

```text
quiet-copy  rejected  delivery 1 by w2  -61.8 LUFS -57.5 dBTP
quiet-norm  ok        delivery 1 by w1  -14.0 LUFS  -8.6 dBTP
```

A failed check is not a reason to retry, because the same command produces the same file. So the worker calls `term()`, which removes the job from the queue without redelivery, publishes a `rejected` result, and deletes its temporary file. Only checked files are renamed into place, so the output folder never holds a file that failed.

## What the run showed

| Situation | What happened |
| --- | --- |
| 6 jobs, 3 workers | Each job ran exactly once |
| 11.6 s render, `ack_wait` 5 s, no heartbeat | Rendered twice; the second worker started at +5 s |
| Same, heartbeat every 2 s | Rendered once |
| Corrupt input, `max_deliver` 3 | 3 attempts, then the advisory; deleted from the stream after being recorded |
| Output fails the loudness check | `term()`, no retry, file never moved into place |
| Same job id submitted twice | Second publish ignored |

The whole pattern is one stream, one durable consumer and three acknowledgement calls, each matched to a different kind of failure: `ack` for a good file, `nak` for something that might work next time, and `term` for something that never will.

## About the Author

Mark Santos is a video editor. He runs Mark Studios and edits talking-head and YouTube videos for creators and companies. He posts about AI and video on [YouTube](https://www.youtube.com/@markksantos) too.
