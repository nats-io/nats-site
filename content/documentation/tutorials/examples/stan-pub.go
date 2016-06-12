// Simple STAN publisher

package main
// package stan

// Import packages
import (
	"log"

	"github.com/nats-io/go-stan"
)	

func main() {

	// Connect to server no auth and auth; defer close
    natsConnection, _ := stan.Connect(stan.DefaultURL)

    // Keep connection alive, log connection URL.
    defer standConnection.Close()
    log.Println("Connected to " + stan.DefaultURL)

    // Publish message on subject
    subject := "foo"
	stanConnection.Publish(subject, []byte("Hello STAN"))
	log.Println("Published message on subject " + subject)
}

// package main

// // Import packages
// import (
//     "log"

//     "github.com/nats-io/nats"
// )   

// func main() {

//     // Connect to server no auth and auth; defer close
//     natsConnection, _ := stan.Connect(stan.DefaultURL)

//     // natsConnection, _ := nats.Connect("nats://foo:bar@localhost:4222")
//     defer natsConnection.Close()
//     log.Println("Connected to " + nats.DefaultURL)

//     // Publish message on subject
//     subject := "foo"
//     natsConnection.Publish(subject, []byte("Hello NATS"))
//     log.Println("Published message on subject " + subject)
// }