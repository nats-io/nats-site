+++
date = "2015-09-27"
title = "Explore NATS Request Reply"
description = ""
category = "tutorials"
[menu.main]
  name = "Explore Request Reply"
  weight = 4
  identifier = "doc-nats-req-rep"
  parent = "Additional Documentation"
+++

NATS supports [request reply messaging](/documentation/writing_applications/concepts). In this tutorial you explore how to exchange point-to-point messages using NATS.

#### Prerequisites

- [Set up your Go environment](/documentation/tutorials/go-install/)
- [Installed the NATS server](/documentation/tutorials/gnatsd-install/)

#### 1. Start the NATS server

```sh
% gnatsd
```

#### 2. Start a shell or command prompt session

You will use these sessions to run the NATS reply client.

#### 3. Change to the examples directory

```sh
% cd $GOPATH/src/github.com/nats-io/go-nats/examples/nats-rply
```

#### 4. Run the reply client listener

```sh
% go run main.go help.please "OK, I CAN HELP!!!"
```

You should see the message `Listening on [help.please]`, and that the NATS receiver client is listening on the "help.please" subject. The reply client acts as a receiver, listening for message requests. In NATS, the receiver is a subscriber.

#### 5. Start another shell or command prompt session

You will use this session to run a NATS request client.

#### 6. CD to the examples directory

```sh
% cd $GOPATH/src/github.com/nats-io/go-nats/examples/nats-req
```

#### 7. Publish a help request message

```sh
% go run main.go help.please "some message"
```

The NATS requestor client makes a request by sending the message "some message" on the “help.please” subject.

The NATS receiver client receives the message, formulates the reply ("OK, I CAN HELP!!!"), and sends it to the inbox of the requester.
