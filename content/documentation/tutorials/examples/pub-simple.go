// Simple NATS publisher

package main

// Import packages
import (
	"log"

	"github.com/nats-io/go-nats"
)	

func main() {

	// Connect to server no auth and auth; defer close
    natsConnection, _ := nats.Connect(nats.DefaultURL)
    // natsConnection, _ := nats.Connect("nats://foo:bar@localhost:4222")
    defer natsConnection.Close()
    log.Println("Connected to " + nats.DefaultURL)

    // Publish message on subject
    subject := "foo"
	natsConnection.Publish(subject, []byte("Hello NATS"))
	log.Println("Published message on subject " + subject)
}