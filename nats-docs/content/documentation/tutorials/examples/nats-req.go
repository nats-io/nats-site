package main

import (
        "fmt"
        "time"
        "github.com/nats-io/nats"
)

func main(){
        fmt.Println("Sending a NATS request")

        natsConnection, _ := nats.Connect(nats.DefaultURL)
        defer natsConnection.Close()

        // Requester
        msg, err := natsConnection.Request("help.please", []byte("some message"), 1000*time.Millisecond)
        if err == nil {
             fmt.Println("Got reply: ", string(msg.Data))
        } else {
             fmt.Println("Error: ", err)
	}
}
