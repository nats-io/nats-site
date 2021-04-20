+++
categories = ["Clients", "Java"]
date = "2021-04-17"
tags = ["java", "headers"]
title = "Headers with the NATS.io Java Library"
author = "Scott Fauerbach"
+++

A few months ago, Header support was added to NATS Server.
With the release of the 2.10.0 [Java client](https://github.com/nats-io/nats.java), Headers are completely supported.

NATS Headers are analogous to http request Headers and you can leverage them for the same type of things,
for example, to pass information like security, request, transaction or state information.

In Java terms, it's analogous to a map of type

```java
List<String, List<String>>
```

In fact, that's exactly what is used for the backing data structure in the Headers object. 
Using Headers is straightforward, again analogous to a Java map with some limitations to the keys and values.

### Keys

Keys can contain only printable characters in the ascii range except for the colon. 
So every character from space to tilde are allowed, again except for the colon.

### Values

Values can contain all printable characters including the colon and are also allowed to contain the
tab (0x9) character. If you want to encrypt a value, make sure you use some encoding like base64 to make sure
it conforms to this requirement.

## Creating Headers

Headers are simple to create.

```java
Headers h = new Headers();
h.add("key1", "value1");
h.add("key1", "value2");
h.add("key2", "value1");
```

They even support fluent style creation...

```java
Headers h = new Headers().add("key1", "value1").add("key1", "value2").add("key2", "value1");
```

The NatsMessage Builder has a place for them and they work with regular or JetStream messages.

```java
Message msg = NatsMessage.builder()
        .subject("my-subject")
        .headers(new Headers().add("key", "value"))
        .build()
```

```java
natsConnection.publish(msg);      
```

```java
jetStream.publish(msg);
```

## Reading Headers

The Message object has 2 new relevant APIs that allow you to work with the Headers.
You can check if the the message has Headers, and get them if they do:

```java
Message msg = sub.nextMessage(Duration.of Minutes(1));
if (msg.hasHeaders()) {
    Headers headers = msg.getHeaders();
    List<String> values = headers.get("key1");
    ...
}
```

The Headers object allows you to do many Java Map like operations

```java
if (headers.containsKey("key1")) {
 ...
}
```

```java
Set<String> setOfKeys = headers.keySet();
for (String key : setOfKeys) {
   ...
}
```

```java
for (Map.Entry<String, List<String>> entry : headers.entrySet()) {
    String key = entry.getKey();
    List<String> values = entry.getValue();   
    ...     
}
```

```java
BiConsumer<String, List<String>> action = new BiConsumer<String, List<String>>() {
    @Override
    public void accept(String s, List<String> strings) {
        ...
    }
};

headers.forEach(action);
```

Or even the lambda form

```java
headers.forEach((key, values) -> ... );
```

That's all there is too it!

## About the Author

Scott Fauerbach is a member of the engineering team at [Synadia Communications](https://synadia.com).
