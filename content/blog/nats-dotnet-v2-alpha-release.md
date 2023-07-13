+++
date = "2023-07-13"
draft = false
title = "NATS .NET Client v2 Alpha Released with Core NATS Support"
author = "Ziya Suzen"
categories = ["Engineering"]
tags = ["NATS", "Client", "Pre-release", ".NET"]
+++

Starting in 2018 with [.NET Core 2.1](https://devblogs.microsoft.com/dotnet/announcing-net-core-2-1/), the .NET platform began to receive serious performance improvements in every major release. This excited many .NET developers, who have been enjoying faster and more efficient runtimes just by upgrading their project targets with every new .NET release. In 2021, [.NET 6](https://devblogs.microsoft.com/dotnet/announcing-net-6/) became the first LTS release under Microsoft’s new [.NET and .NET Core Support Policy](https://dotnet.microsoft.com/en-us/platform/support/policy/dotnet-core).

The original NATS .NET client, called [NATS.Client v1](https://www.nuget.org/packages/NATS.Client) on NuGet, pre-dates these advancements and Microsoft’s new LTS roadmap - it was originally released in 2015! Backwards compatibility remains a large commitment in NATS.Client v1, which would make it difficult to port in order to take advantage of new APIs.

NATS community members started to take note, and develop client libraries for NATS based on modern .NET APIs. One notable client library that emerged was the [AlterNats](https://github.com/Cysharp/AlterNats) library by Cysharp, which includes a fully asynchronous API, leverages [Span&lt;T&rt;](https://learn.microsoft.com/en-us/archive/msdn-magazine/2018/january/csharp-all-about-span-exploring-a-new-net-mainstay), and supports client-side WebSockets from browsers in [Blazor](https://dotnet.microsoft.com/en-us/apps/aspnet/web-apps/blazor). NATS maintainers and AlterNats maintainers agreed that AlterNats would make a great starting point for NATS.Client v2!

Today, we’re excited to announce our first developer preview release of [NATS.Client.Core v2](https://www.nuget.org/packages/NATS.Client.Core), which supports [Core NATS](https://docs.nats.io/nats-concepts/core-nats). JetStream support is under development and will be coming soon!

## What’s Supported?

[NATS.Client.Core v2](https://www.nuget.org/packages/NATS.Client.Core) is a complete implementation of all Core NATS features including headers. We take full advantage of async/await, IAsyncDisposable, Channels, IAsyncEnumerable and ValueTask to provide a great developer experience and high performance.

### Publish-subscribe

```csharp
using NATS.Client.Core;

// Create a new connection
await using var nats = new NatsConnection();

// Create a subscription on subject "foo"
await using sub = await nats.SubscribeAsync<int>("foo");

// Publish 10 messages on subject "foo"
for (int i = 0; i < 10; i++)
{
    Console.WriteLine($" Publishing {i}...");
    await nats.PublishAsync<int>("foo", i);
}

// Read messages from the subscription
await foreach (var msg in sub.Msgs.ReadAllAsync())
{
    Console.WriteLine($"Received {msg.Subject}: {msg.Data}\n");
}
```

### Request-Reply

```csharp
using NATS.Client.Core;

// Create a new connection
await using var nats = new NatsConnection();

// Create subscription (service) that will be responding to requests
await using var sub = await conn.SubscribeAsync<int>("math.double");

await foreach (var msg in sub.Msgs.ReadAllAsync())
{
    Console.WriteLine($"Received request: {msg.Data}");

    // Reply to the sender of the message via the reply subject
    await msg.ReplyAsync($"Answer is: { 2 * msg.Data }");
}

await using var nats = new NatsConnection();

// Send a request (message), expecting a reply. The client automatically
// creates an inbox subscription to receive this message.
var reply = await nats.RequestAsync<int, string>("math.double", 2);

Console.WriteLine($"Received reply: {reply}")
```

### Queue Groups

```csharp
using NATS.Client.Core;

await using var nats = new NatsConnection();

var subs = new List<NatsSubBase>();
var replyTasks = new List<Task>();

for (int i = 0; i < 3; i++)
{
    // Create three subscriptions all on the same queue group
    var opts = new NatsSubOpts { QueueGroup = "maths-service" };
    var sub = await nats.SubscribeAsync<int>("math.double", opts);

    subs.Add(sub);

    // Create a background message loop for every subscription
    var replyTaskId = i;
    replyTasks.Add(Task.Run(async () =>
    {
        // Retrieve messages until unsubscribed
        await foreach (var msg in sub.Msgs.ReadAllAsync())
        {
            Console.WriteLine($"[{replyTaskId}] Received request: {msg.Data}");
            await msg.ReplyAsync($"Answer is: {2 * msg.Data}");
        }

        Console.WriteLine($"[{replyTaskId}] Done");
    }));
}

// Send a few requests
for (int i = 0; i < 10; i++)
{
    var reply = await nats.RequestAsync<int, string>("math.double", i);
    Console.WriteLine($"Reply: '{reply}'");
}

Console.WriteLine("Stopping...");

// Unsubscribing or disposing will complete the message loops
foreach (var sub in subs)
    await sub.UnsubscribeAsync();

// Make sure all tasks finished cleanly
await Task.WhenAll(replyTasks);

Console.WriteLine("Bye");
```

## Version Numbers, Packages and .NET Targets

NATS.Client v1 will continue to be supported, and will target .NET Framework / NETStandard. It already includes full-featured implementations of Core NATS, JetStream, Key Value, Object Store.

NATS.Client.Core v2 (alpha) launches targeting .NET 6 and will follow the .NET LTS support policy going forward. NATS.Client.Hosting v2 (alpha) supporting .NET Hosting APIs has also been launched.

## What’s Next?

Our first priority is implementing JetStream on top of NATS.Client.Core v2. This will be followed by Key Value and Object Store implementations.

We are also interested in learning more about .NET ecosystem packages that could benefit from NATS integrations. [SignalR Core Scaleout](https://learn.microsoft.com/en-us/aspnet/core/signalr/scale?view=aspnetcore-7.0) and [Orleans](https://learn.microsoft.com/en-us/dotnet/orleans/overview) are two examples that come to mind.

## Try it Today

NATS.Client.Core v2 (alpha) is available on [NuGet](https://www.nuget.org/packages/NATS.Client.Core) and the source code is available on [GitHub](https://github.com/nats-io/nats.net.v2). Generated [API documentation](https://nats-io.github.io/nats.net.v2/) is also available.

We would love community feedback! Please open issues or discussions on the [nats-io/nats.net.v2](https://github.com/nats-io/nats.net.v2) GitHub repository or ask questions in the NATS [#dotnet Slack](https://natsio.slack.com/channels/dotnet) channel!

## About the Author

Ziya Suzen is a Software Engineer at Synadia and maintainer of the NATS .NET v2 Client.
