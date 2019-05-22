# nats-req-rep

+++ date = "2015-09-27" title = "Explore NATS Request Reply" description = "" category = "tutorials" \[menu.main\] name = "Explore Request Reply" weight = 4 identifier = "doc-nats-req-rep" parent = "Additional Documentation" +++

NATS supports [request reply messaging](https://github.com/nats-io/nats-site/tree/c42c46a7c6b8669e66e28419887d2f8dd29aa502/documentation/writing_applications/concepts/README.md). In this tutorial you explore how to exchange point-to-point messages using NATS.

## Prerequisites

* [Set up your Go environment](https://github.com/nats-io/nats-site/tree/c42c46a7c6b8669e66e28419887d2f8dd29aa502/documentation/additional_documentation/go-install/README.md)
* [Installed the NATS server](https://github.com/nats-io/nats-site/tree/c42c46a7c6b8669e66e28419887d2f8dd29aa502/documentation/managing_the_server/installing/README.md)
* [Cloned go-nats project to `$GOPATH/src/github.com/nats-io`](https://github.com/nats-io/go-nats)

## 1. Start the NATS server

```bash
% nats-server
```

## 2. Start two terminal sessions

You will use these sessions to run the NATS request and reply clients.

## 3. Change to the examples directory

```bash
% cd $GOPATH/src/github.com/nats-io/go-nats/examples
```

## 4. In one terminal, run the reply client listener

```bash
% go run nats-rply/main.go foo "this is my response"
```

You should see the message `Receiver is listening`, and that the NATS receiver client is listening on the "help.please" subject. The reply client acts as a receiver, listening for message requests. In NATS, the receiver is a subscriber.

## 5. In the other terminal, run the request client

```bash
% go run nats-req/main.go foo "request payload"
```

The NATS requestor client makes a request by sending the message "some message" on the “help.please” subject.

The NATS receiver client receives the message, formulates the reply \("OK, I CAN HELP!!!\), and sends it to the inbox of the requester.

