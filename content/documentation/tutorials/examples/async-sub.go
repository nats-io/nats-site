// Simple Async Subscriber

package main

// Import packages
import (
	"log"
	"runtime"

	"github.com/nats-io/go-nats"
)

func main() {

	// Create server connection: auth and no auth
	// natsConnection, _ := nats.Connect("nats://foo:bar@localhost:4222")
	natsConnection, _ := nats.Connect(nats.DefaultURL)
	log.Println("Connected to " + nats.DefaultURL)

	// Subscribe to subject
	log.Printf("Subscribing to subject 'foo'\n")
	natsConnection.Subscribe("foo", func(msg *nats.Msg) {

		// Handle the message
		log.Printf("Received message '%s\n", string(msg.Data)+"'")
	})

	// Keep the connection alive
	runtime.Goexit()
}
