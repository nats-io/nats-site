+++
categories = ["Clients", ".NET", "C Sharp", "JetStream"]
date = "2021-07-26"
tags = ["dotnet", "csharp", "jetstream", "client"]
title = "NATS.io .NET C# Client Library JetStream Pre-Release"
author = "Scott Fauerbach"
+++

A pre-release of JetStream support has just been made available for the <a href="https://github.com/nats-io/nats.net">NATS .NET C# Client Library</a>!

The package [NATS.Client 0.14.0-pre1](https://www.nuget.org/packages/NATS.Client/0.14.0-pre1) has been published on NuGet Gallery.

You can follow progress and provide feedback via the [Add Jetstream Connection/Client APIs](https://github.com/nats-io/nats.net/issues/417) GitHub Issue.

## Code Starting Points

These are the important interfaces for you to get familiar with.

[IConnection](https://github.com/nats-io/nats.net/blob/master/src/NATS.Client/IConnection.cs)
has new methods which allow you to work with JetStream.

`CreateJetStreamManagementContext(...)`  gets an implementation of
[IJetStreamManagement](https://github.com/nats-io/nats.net/blob/master/src/NATS.Client/JetStream/IJetStreamManagement.cs),
the interface that provides stream management functions.

`CreateJetStreamContext(...)` gets an implementation of
[IJetStream](https://github.com/nats-io/nats.net/blob/master/src/NATS.Client/JetStream/IJetStream.cs), 
the interface that contains the methods to publish and to create subscriptions.

[IJetStreamSubscription.cs](https://github.com/nats-io/nats.net/blob/master/src/NATS.Client/JetStream/IJetStreamSubscription.cs)
contains the subscription interfaces:
- IJetStreamPushSyncSubscription
- IJetStreamPushAsyncSubscription
- IJetStreamPullSubscription

## Example Code

Here are some sample projects that can help you get started.

- [JetStreamPublish](https://github.com/nats-io/nats.net/tree/master/src/Samples/JetStreamPublish)
- [JetStreamPublishVsCorePublish](https://github.com/nats-io/nats.net/tree/master/src/Samples/JetStreamPublishVsCorePublish)
- [JetStreamPublishWithOptionsUseCases](https://github.com/nats-io/nats.net/tree/master/src/Samples/JetStreamPublishWithOptionsUseCases)
- [JetStreamPushSubcribeSync](https://github.com/nats-io/nats.net/tree/master/src/Samples/JetStreamPushSubcribeSync)

You will also find code examples in the [Integration Tests](https://github.com/nats-io/nats.net/tree/master/src/Tests/IntegrationTests).
Look for the files `TestJetStream*.cs`

More examples are on the way.

## About the Author

Scott Fauerbach is a member of the engineering team at [Synadia Communications](https://synadia.com).

