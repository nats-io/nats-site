// Simple Async Subscriber

package main

// Import Go and NATS packages
import (
	"log"
	"os"
	"runtime"

	"github.com/nats-io/nats"
) 

func main() {

    // Create server connection: auth and no auth
    // natsConnection, _ := nats.Connect("nats://foo:bar@localhost:4222")
    natsConnection, _ := nats.Connect(nats.DefaultURL)
    log.Println("Connected to " + nats.DefaultURL)

    var subject string
    if len(os.Args) > 1 {
      subject = os.Args[1]
    } else {
      subject = "foo"
    }
    // Subscribe to subject
    log.Printf("Subscribing to subject %s\n", subject)
    natsConnection.Subscribe(subject, func(msg *nats.Msg) {
      
      // Handle the message
      log.Printf("Received message '%s\n", string(msg.Data) + "'")
  })

  // Keep the connection alive
  runtime.Goexit()
}