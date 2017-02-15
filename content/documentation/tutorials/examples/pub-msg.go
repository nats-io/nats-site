package main

import (
	"fmt"
	"log"

	"github.com/nats-io/go-nats"
)	

func main() {
    fmt.Println("Publishing Hello World")

    natsConnection, _ := nats.Connect(nats.DefaultURL)
    defer natsConnection.Close()
    fmt.Println("Connected to NATS server: " + nats.DefaultURL)

    // Msg structure
	msg := &nats.Msg{Subject: "foo", Reply: "bar", Data: []byte("Hello World")}
	natsConnection.PublishMsg(msg)

	log.Println("Published msg.Subject = " + msg.Subject, "| msg.Data = " + string(msg.Data))
}

