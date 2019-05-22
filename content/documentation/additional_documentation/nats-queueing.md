# nats-queueing

+++ date = "2015-09-27" title = "Explore NATS Queueing" description = "" category = "tutorials" \[menu.main\] name = "Explore Queueing" weight = 5 identifier = "doc-nats-queueing" parent = "Additional Documentation" +++

NATS supports [message queueing](https://github.com/nats-io/nats-site/tree/c42c46a7c6b8669e66e28419887d2f8dd29aa502/documentation/writing_applications/concepts/README.md) using queue groups. Subscribers register a queue group name. A single subscriber in the group is randomly selected to receive the message.

### Prerequisites

* [Set up your Go environment](https://github.com/nats-io/nats-site/tree/c42c46a7c6b8669e66e28419887d2f8dd29aa502/documentation/additional_documentation/go-install/README.md)
* [Installed the NATS server](https://github.com/nats-io/nats-site/tree/c42c46a7c6b8669e66e28419887d2f8dd29aa502/documentation/managing_the_server/installing/README.md)

## Instructions

**1. Start the NATS server.**

```text
nats-server
```

**2. Clone the repositories for each client examples**

```text
go get github.com/nats-io/go-nats
git clone https://github.com/nats-io/node-nats.git
git clone https://github.com/nats-io/ruby-nats.git
```

**3. Run the Go client subscriber with queue group name.**

```text
cd $GOPATH/src/github.com/nats-io/go-nats/examples
go run nats-qsub.go foo my-queue
```

**4. Install and run the Node client subscriber with queue group name.**

```text
npm install nats
cd node-nats/examples
node node-sub foo my-queue
```

**5. Install and run the Ruby client subscriber with queue group name.**

```text
gem install nats
nats-queue foo my-queue &
```

**6. Run another Go client subscriber** _**without**_ **the queue group.**

```text
cd $GOPATH/src/github.com/nats-io/go-nats/examples
go run nats-sub.go foo
```

**7. Publish a NATS message using the Go client.**

```text
cd $GOPATH/src/github.com/nats-io/go-nats/examples
go run nats-pub.go foo "Hello NATS!"
```

**8. Verify message publication and receipt.**

You should see that the publisher sends the message: _Published \[foo\] : 'Hello NATS!'_

You should see that only one of the my-queue group subscribers receives the message. In addition, the Go client subscriber not in the my-queue group should also receive the message.

**9. Publish another message.**

```text
go run nats-pub.go foo "Hello NATS Again!"
```

You should see that a different queue group subscriber receives the message this time, chosen at random among the 3 queue group members.

