+++
categories = ["Community"]
tags = ["REST","HTTP","proxy","architecture","nats","microservices"]
date = "2016-04-23T05:00:49+02:00"
title = "Guest Post: REST to NATS Proxy"
author = "Radomír Sohlich"
+++

The REST to NATS proxy project [sohlich/nats-proxy](http://gopkg.in/sohlich/nats-proxy.v1) is the micro framework that provides a bridge between HTTP and NATS. To introduce the problem, we first compare the HTTP and NATS communication models. The table below represents the matching of HTTP and NATS concepts and what do they provide.

| HTTP |  NATS ||
| ----- | -----|----|
|Request/Response|Request/Reply|synchronous communication|
|Websocket|Publish/Subscribe|real-time asynchronous communication|

As you can see, the NATS provides both synchronous and asynchronous communication between clients. The synchronous communication, represented by simple Request and Response of HTTP protocol, could be matched with the Request/Reply communication model of NATS. As the documentation for ["request reply" ](http://nats.io/documentation/concepts/nats-req-rep/) model describes: each request sent via NATS contains reply subject, to which the reply is sent. The asynchronous, let's say real-time communication, can be represented by Websockets on HTTP side.The truth is that it is not really related to HTTP, but if we simplify it, at least the handshake is based on HTTP. For this purpose, the Publish/Subscribe model could be used.

So the REST to NATS project uses this similarity between NATS and HTTP communication and tries to implement the bridge between HTTP(Websockets) and NATS in such way. The library was originally created for the purpose of migrating REST based architecture like this

<img class="img-responsive center-block" src="/img/blog/natsproxy/natsproxy_rest.png">

into NATS messaging platform based one. But as it evolved, it started to grow into some kind of framework, that can be used for the creation of service API and seamless protocol bridging. So one of the many examples of how the system using a nats-proxy framework could look like is on the architecture below.

<img class="img-responsive center-block" src="/img/blog/natsproxy/natsproxy_arch.png">



## Proxy basics
As the name of the project suggests the function of the library is very similar to basic HTTP proxy. The proxy receives the HTTP request and translates it into a struct, which contains all the information from original request (URL, header, body).

```go
type Request struct {
	URL        string
	Method     string
	Header     http.Header
	Form       url.Values
	RemoteAddr string
	Body       []byte
}
```

This struct is serialized and sent as a message through NATS via request (see http://nats.io/documentation/concepts/nats-req-rep/) to ensure synchronous processing.
The subject, to which the serialized struct is sent, is constructed from the HTTP request URL and METHOD by a very simple rule: slashes in the path are replaced by dots and the method is used as the prefix.

<img class="img-responsive center-block" src="/img/blog/natsproxy/natsproxy_request.png">

>Lets say we have GET request on URL `http://example.com/user/info` so the proxy will translate this URL to  subject `GET:user.info`.

The client side is subscribed to the subject `GET:user.info`. Because of that, it receives the request and writes back the response to the reply subject. The response struct also contains the body, status and header.

```go
type Response struct {
	Header     http.Header
	StatusCode int
	Body       []byte
}
```
For better picture of how it works in reality. There is a code of simple client and proxy.

## Proxy
The proxy side implements the `http.Handler` interface, so it can be used with built-in `http` package as you can see in the code below. The handler does nothing special. It parses the request and translates it to custom representation which is then serialized to JSON by built in `json` package encoder.

```go
import(
        "gopkg.in/sohlich/nats-proxy.v1"
        "net/http"
        "github.com/nats-io/nats"
    )

func main() {
	proxyConn, _ := nats.Connect(nats.DefaultURL)
	proxy, _ := natsproxy.NewNatsProxy(proxyConn)
	defer proxyConn.Close()
	http.ListenAndServe(":8080", proxy)
}
```
The proxy itself does not implement any mechanisms to apply filters before the request is passed to the proxy handler as this could be implemented by decorating the proxy handler or other similar techniques.
Because the implementation does not allow writing data to the `http.ResponseWriter` after the handler is applied, the proxy provides `natsproxy.Hook` interface. This hook is applied on the response before it is written to `http.ResponseWriter`. The example bellow shows the usage of hook to translate JWT token with all user info to meaningless reference token.

```go
proxyHandler.AddHook(".*", func(r *Response) {
        // Exchange the jwt token for
        // reference token to hide user information
        jwt := r.GetHeader().Get("X-Auth")
        refToken := auth.GetTokenFor(jwt)
		r.GetHeader().Set("X-Auth", refToken)
	})
```


## Client
The client code uses the nats connection as the constructor argument, so all available options for configuring the connection are accessible. The client itself uses the asynchronous subscription to handle incoming messages, so it's behavior similar to `http.HandlerFunc`. The client API and internals are heavily inspired by [Gin Gonic](https://gin-gonic.github.io/gin/) project. The sample code shows how to use the client API.

```go

import(
    "gopkg.in/sohlich/nats-proxy.v1"
    "net/http"
    "github.com/nats-io/nats"
)

func main(){
	clientConn, _ := nats.Connect(nats.DefaultURL)
	natsClient, _ := natsproxy.NewNatsClient(clientConn)
	//Subscribe to URL /user/info
	natsClient.GET("/user/info", func(c *natsproxy.Context) {
	   user := struct {
		    Name string
	    }{
		    "Alan",
	    }
		c.JSON(200, user)
	})
	defer clientConn.Close()

	// Waiting for signal to close the client
	sig := make(chan os.Signal, 1)
	signal.Notify(sig, syscall.SIGINT, syscall.SIGTERM)
	fmt.Println("Press Ctrl+C for exit.")
	<-sig
}
```

The client API naturally provides the subscription for other HTTP methods and generic subscription method. The request handler which implements `natsproxy.NatsHandler` interface uses `natsproxy.Context` struct which encapsulates both Request and Response and provides some useful methods to access request data and to write a response.

```go
//GET
natsClient.GET("/user/info", func(c *natsproxy.Context) {
		c.JSON(200, "Hello")
	})

//POST
natsClient.POST("/user/info", func(c *natsproxy.Context) {
		c.JSON(200, "Hello")
	})

//PUT
natsClient.PUT("/user/info", func(c *natsproxy.Context) {
		c.JSON(200, "Hello")
	})

//DELETE
natsClient.DELETE("/user/info", func(c *natsproxy.Context) {
		c.JSON(200, "Hello")
	})

//General method
natsClient.Subscribe("HEAD","/user/info", func(c *natsproxy.Context) {
		c.JSON(200, "Hello")
	})

```
The client also implements middleware function that provides the means of accessing the request before it is handled by the specific handler. The reason behind this feature is to provide options for security checks, logging, etc. The example shows the implementation of middleware, that logs all incoming requests.

```go
natsClient.Use(func logger(c *natsproxy.Context) {
    log.Infof("%s:%s from %s", c.Request.Method, c.Request.URL)
})
```

## Summary
The first version (v1) of the nats-proxy framework implements only HTTP Request/Response proxying. 
Because it started as some kind of proof of concept, the solution is not really optimized, all the work is done on the proxy side. 
Also, the serialization of structs is done by JSON encoder, which does not provide very fast serialization.
However for the purpose of bridging REST(HTTP) requests to NATS messaging platform, it's enough to make it possible.

Currently, the next version (v2) is under development.
The v2 should bring some performance improvements because the serialization is done via protocol buffers. Also, a lot of work originally done on the proxy side was moved to client(service) side.The next significant feature is the WebSocket support.

If you are interested or have some ideas, see [REST to NATS proxy](https://github.com/sohlich/nats-proxy) project, fire an issue.
