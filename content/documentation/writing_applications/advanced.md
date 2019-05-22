# advanced

+++ category = "api" title = "Advanced Topics" \[menu.main\] name = "Advanced Topics" weight = 8 identifier = "doc-advanced-topics" parent = "Writing Applications" +++

Managing the interaction with the server is primarily the job of the client library but most of the libraries also provide some insight into what is happening under the covers.

### Get the Current Server Status

The client library may provide a mechanism to get the connections current status.

### Listen for Connection Events

While the status is interesting, it is perhaps more interesting to know when the status changes. Most, if not all, of the NATS client libraries provide a way to listen for events related to the connection and its status. The actual API for these listeners is language dependent, but the following examples show a few of the more common use cases. See the API documentation for the client library you are using for more specific instructions. Connection events may include the connection being closed, disconnected or reconnected. Reconnecting involves a disconnect and connect, but depending on the library implementation may also include multiple disconnects as the client tries to find a server, or the server is rebooted.

### Listen for New Servers

When working with a cluster, servers may be added or changed. Some of the clients allow you to listen for this notification:

### Listen for Errors

The client library may separate server-to-client errors from events. Many server events are not handled by application code and result in the connection being closed. Listening for the errors can be very useful for debugging problems.

## Slow Consumers

NATS is designed to move messages through the server quickly. As a result, NATS depends on the applications to consider and respond to changing message rates. The server will do a bit of impedance matching, but if a client is too slow the server will eventually cut them off. One way some of the libraries deal with bursty message traffic is to cache incoming messages for a subscription. So if an application can handle 10 messages per second and sometimes receives 20 messages per second, the library may hold the extra 10 to give the application time to catch up. To the server, the application will appear to be handling the messages and consider the connection healthy. It is up to the client library to decide what to do when the cache is too big, but most client libraries will drop incoming messages.

Receiving and dropping messages from the server keeps the connection to the server healthy, but creates an application requirement. There are several common patterns:

* Use request/reply to throttle the sender and prevent overloading the subscriber
* Use a queue with multiple subscribers splitting the work
* Persist/cache messages with something like NATS streaming

Libraries that cache incoming messages may provide two controls on the incoming queue, or pending messages. These are useful if the problem is bursty publishers and not a continuous performance mismatch. Disabling these limits can be dangerous in production and although setting these limits to 0 may help find problems, it is also a dangerous proposition in production.

> Check your libraries documentation for the default settings, and support for disabling these limits.

The incoming cache is usually per subscriber, but again, check the specific documentation for your client library.

### Limiting Incoming/Pending Messages by Count and Bytes

The first way that the incoming queue can be limited is by message count. The second way to limit the incoming queue is by total size. For example, to limit the incoming cache to 1,000 messages or 5mb whichever comes first:

### Detect a Slow Consumer and Check for Dropped Messages

When a slow consumer is detected and messages are about to be dropped, the library may notify the application. This process may be similar to other errors or may involve a custom callback. Some libraries, like Java, will not send this notification on every dropped message because that could be noisy. Rather the notification may be sent once per time the subscriber gets behind. Libraries may also provide a way to get a count of dropped messages so that applications can at least detect a problem is occurring.

