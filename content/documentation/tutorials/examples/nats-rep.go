package main

import (
        "fmt"
        "github.com/nats-io/go-nats"
)

func main(){
        fmt.Println("Receiver is listening...")

        natsConnection, _ := nats.Connect(nats.DefaultURL)
        defer natsConnection.Close()

        // Receiver, responds
        donech := make(chan bool, 1)
        natsConnection.Subscribe("help.please", func(msg *nats.Msg){
                fmt.Println("Someone needs help: ", msg)
                natsConnection.Publish(msg.Reply, []byte("OK I CAN HELP!!!"))
                donech <- true
        })

        <-donech
}
