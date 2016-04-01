// Copyright 2014 Apcera Inc. All rights reserved.

package main

import (
	"flag"
	"log"
	"os"
	"strings"
	"time"

	"github.com/apcera/nats"
)

const (
	PING = "ping.test"
)

func usage() {
	log.Fatalf("Usage: nats-ping [-s server] [-d delay]\n" +
		"       NATS_URI env can be used to set the server(s) as well")
}

func main() {
	var urls = flag.String("s", "", "The NATS server URL(s) (separated by comma)")
	var delay = flag.Float64("d", 2.0, "Delay represented as fractional seconds")
	var help = flag.Bool("h", false, "Display usage")

	log.SetFlags(0)
	flag.Usage = usage
	flag.Parse()

	if *help {
		usage()
	}

	opts := nats.DefaultOptions

	// Process servers to connect to..
	if *urls == "" {
		// Check env for NATS_URI
		if nuri := os.Getenv("NATS_URI"); nuri != "" {
			*urls = nuri
		} else {
			*urls = nats.DefaultURL
		}
	}
	opts.Servers = strings.Split(*urls, ",")
	for i, s := range opts.Servers {
		opts.Servers[i] = strings.Trim(s, " ")
	}

	// Setup the event hooks to be notified on
	// disconnect and reconnect events.
	opts.ReconnectedCB = func(nc *nats.Conn) {
		log.Printf("[EVENT] Reconnected to %s [ID:%s]\n",
			nc.ConnectedUrl(), nc.ConnectedServerId())
	}

	opts.DisconnectedCB = func(nc *nats.Conn) {
		log.Printf("[EVENT] Got disconnected\n")
	}

	opts.ClosedCB = func(nc *nats.Conn) {
		log.Fatalf("[EVENT] Connection closed!\n")
	}

	// Connect and setup encoded connection.
	nc, err := opts.Connect()
	if err != nil {
		log.Fatalf("[ERR] Can't connect to server: %v\n", err)
	}

	log.Printf("[EVENT] Connected to %s [ID:%s]\n",
		nc.ConnectedUrl(), nc.ConnectedServerId())

	ec, err := nats.NewEncodedConn(nc, nats.JSON_ENCODER)
	if err != nil {
		log.Fatalf("Can't create encoded connection: %v\n", err)
	}

	// Calculate delay
	delayTime := time.Duration(*delay * float64(time.Second))
	log.Printf("[INFO] Delay is %v\n", delayTime)

	// Setup our listener to the pings.
	ec.Subscribe(PING, func(sent time.Time) {
		log.Printf("[PING] Latency: %v\n", time.Since(sent))
	})

	// Loop, publishing our ping after delay seconds.
	for {
		ec.Publish(PING, time.Now())
		time.Sleep(delayTime)
	}
}
