+++
categories = ["Engineering"]
date = "2016-01-11T11:22:41-08:00"
tags = ["nats", "C#", ".NET"]
title = "NATS in Microsoft .NET"
author = "Colin Sullivan"
+++

Performance at scale is critically important for building distributed systems today.  Microservices and IoT require applications to be distributed across a physical or virtual infrastructure, comprised of thousands, possibly millions of endpoints, many of which can be .NET services or applications.  The end user needs these services to operate seamlessly, requiring extremely fast, lightweight, scalable, resilient, and always-on communication - NATS.

In developing the [NATS C# .NET Client](https://github.com/nats-io/csnats), the .NET Framework SDK's extremely rich API eliminated reliance on third parties, but most importantly, performance is there. **The NATS .NET client, currently as a beta release, can publish over 3 million messages per second within a Windows VM on a MacBook pro.**

While mirroring functionality and internals of other Apcera supported clients, the NATS .NET client public API will make the .NET developer feel at home with object serialization, IDisposable interfaces, and delegates for handling NATS events.  The NATS .NET client is fully managed and strong named.

One feature of the NATS .NET client that faciliates development is object serialization.  Here is example code that creates a connection and publishes an object into a NATS cluster:

```c#
[Serializable]
public class Company
{
    public string Name = "Apcera";
    public string Address = "140 New Montgomery St.";
}
           
// Create a connection then send an object to subject "foo".
using (IEncodedConnection c = new ConnectionFactory().CreateEncodedConnection())
{
    c.Publish("foo", new Company());
}
```


And here is corresponding code that asynchronously receives the message and processes the object:

```c#
using (IEncodedConnection c = new ConnectionFactory().CreateEncodedConnection())
{
    // Create an event handler to process a Company object.
    EventHandler<EncodedMessageEventArgs> eh = (sender, args) =>
    {
        Company company = (Company)args.ReceivedObject;
        System.Console.WriteLine("Name: {0}, Address: {1}", 
            company.Name, company.Address);
    };

    // Subscribe, registering the handler, and then process incoming 
    // messages for 5 seconds.
    using (IAsyncSubscription s = c.SubscribeAsync("foo", eh))
    {
        System.Console.WriteLine("Waiting for a message..");
        Thread.Sleep(5000);
     }
}
```

Functions that serialize and deserialize objects can be set through the API, allowing complete customization.

The NATS .NET client offers full use of delegates, including updating a multicast delegate on an active subscriber.  This allows the developer to componentize, adding and removing functionality based on application state. 

The code below demonstrates this, printing the 4th and 5th message received on subject "foo" through temporarily multicasting the delegate.

```c#
// prints the message to the console.
void printMessage(object sender, MsgHandlerEventArgs e)
{
    System.Console.WriteLine(e.Message);
}

// simply tallies the message, and adds a delegate to print the message
// starting after the 3rd message received, and stopping after the 5th.
// In practice this could be used to enable/disable debugging or layer 
// processing based on application state.
void processMessage(object sender, MsgHandlerEventArgs e)
{
    count++;

    IAsyncSubscription sub = (IAsyncSubscription)e.Message.ArrivalSubcription;
    if (count == 3)
    {
        sub.MessageHandler += printMessage;
    }
    else if (count == 5)
    {
        sub.MessageHandler -= printMessage;
    }
}

public void demonstrateRuntimeDelegates()
{
    using (IConnection c = new ConnectionFactory().CreateConnection())
    {
        using (IAsyncSubscription s = c.SubscribeAsync("foo", processMessage))
        {
            // Process for 5 seconds.
            Thread.Sleep(5000);
        }
    }
}
```


Having added TLS 1.2 support, future plans include offering NATS as a WCF Binding, and always, increased performance.  Please don't hesistate to contact us with comments, feature requests, or contributions!

Download the NATS .NET client at [NuGet](https://www.nuget.org/packages/NATS.Client), or get it from [github](https://github.com/nats-io/csnats), and browse the [API documentation](http://nats-io.github.io/csnats/).  Let us know what you think, and visit our [Community](http://nats.io/community/) Page!  Contributors are welcome!
