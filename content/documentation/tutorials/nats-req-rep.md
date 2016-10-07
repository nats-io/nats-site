+++
date = "2015-09-27"
title = "Explore NATS Request Reply"
description = ""
category = "tutorials"
[menu.main]
  name = "Explore NATS Request Reply"
  weight = 6
  identifier = "tutorial-nats-req-rep"
  parent = "Tutorials"
+++

# Explore NATS Request Reply

NATS supports [request reply messaging](/documentation/concepts/nats-req-rep/). In this tutorial you explore how to exchange point-to-point messages using NATS.

## Prerequisites

- [Set up your Go environment](/documentation/tutorials/go-install/)
- [Installed the NATS server](/documentation/tutorials/gnatsd-install/)

## Instructions

**1. Start the NATS server.**

```
gnatsd
```

**2. Start two terminal sessions.**

You will use these sessions to run the NATS request and reply clients.

**3. Change to the examples directory.**

```
cd $GOPATH/src/github.com/nats-io/nats/examples
```

**4. In one terminal, run the reply client listener.**

```
go run nats-rply.go foo "this is my response"
```

You should see the message `Receiver is listening`, and that the NATS receiver client is listening on the "help.please" subject. The reply client acts as a receiver, listening for message requests. In NATS, the receiver is a subscriber.

**5. In the other terminal, run the request client.**

```
go run nats-req.go foo "request payload"
```

The NATS requestor client makes a request by sending the message "some message" on the “help.please” subject.

The NATS receiver client receives the message, formulates the reply ("OK, I CAN HELP!!!), and sends it to the inbox of the requester.
