+++
categories = ["Engineering","Community"]
date = "2015-03-13T11:39:53-08:00"
tags = ["microservices", "containers", "nats", "docker"]
title = "NATS and Tracing: Keeping track of requests"
author = "Donal Byrne"
+++

At [Sendify](https://www.sendify.se) we've been using nats as a simple and effective means of communicating between our backend services. 
I came across Nats a few years ago when building a relatively small microservice backed system and it worked wonderfully. 
With that experience, I introduced it to Sendify this year as the main nervous system for inter-service communication. 

Our system is mainly processing api requests to various freight carriers based on user searches though we're also building integration 
for public api access as well. We have a mix of legacy php and newer golang services. We're running everything as containers 
on docker swarm.

<img class="img-responsive" alt="Sendify infrastructure" src="/img/blog/nats-tracing.png">

One simple requirement when building a system in this way is the need for tracing requests. 
To implement this, we're simply wrapping the nats (golang) client and implementing our own Publish, PublishRequest and 
Request methods to add a uuid to each new request and simply chaining a tag for each service a request makes it's way through. 
Since we're using the protobuf serializer we also need to define a message type for this tracing payload. 

An example of our protobuf schema:

```
enum RequestType {
    REQ = 0;
    PUB = 1;
    PUBREQ = 2;
};

message Trail {
    optional string app_name = 1;
    optional RequestType put_type = 2;
    optional int64 time = 3;
}

message NatsContext {
    repeated Trail trail = 1;
    optional string trace_id = 2;
}

message TestMessage {
    optional NatsContext context = 1;
    optional string data = 2;
}
...
```

And then we use our Publish wrapper:

```
...
func (n *Nats) Publish(subject string, currentContext *NatsContext, data PayloadWithContext) error {
    data.SetContext(currentContext)
    n.updateContext(data, RequestType_PUB)
    return n.EncCon.Publish(subject, data)
}
...
```

The result being that we have a tracing uuid per request chain and a list of the services the request made it's way 
through. An improvement would be to tie the uuid to the incoming http request using a middleware.

You can find a full example of the code [here](https://github.com/byrnedo/apibase/blob/master/natsio/)

