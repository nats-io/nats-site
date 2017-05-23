+++
categories = ["Community", "Engineering"]
date = "2017-05-19"
tags = ["nats", "go", "presentation", "meetup"]
title = "GopherFest 2017 Talk: On Adopting Context in the NATS client"
author = "Waldemar Quevedo"
+++

Last Monday, the 2017 edition of the GopherFest was held and we also gave a quick talk on how [we added Context support](https://github.com/nats-io/go-nats/pull/275) to the NATS client, a feature which has been requested since around the time of the Go 1.7 release. As the `context` package now is part of Go, many more library authors are adopting it to support /cancellation propagation/ for blocking calls, making up for more readable code:

<img class="img-responsive center-block" alt="Tip: If it is a blocking call in a library, it will probably benefit from adding context.Context support soon." src="/img/blog/gopherfest-2017-talk-on-adopting-context-in-the-nats-client.png">

At the talk, we gave a quick example of using it to make a Probe Request to gather many responses and either fade out and stop blocking waiting for responses or timeout with a hard deadline. Code from the talk is presented below, notice how we were able to implement this functionality without having to add extra `goroutines`
or `select` statements.

```go
package main

import (
	"context"
	"log"
	"time"

	"github.com/nats-io/go-nats"
)

func main() {
	nc, err := nats.Connect("nats://127.0.0.1:4222")
	if err != nil {
		log.Fatalf("Failed to connect: %s\n", err)
	}

	nc.Subscribe("help", func(m *nats.Msg) {
		log.Printf("Received help request: %s\n", string(m.Data))

		for i := 0; i < 100; i++ {
			if i >= 3 {
				time.Sleep(300 * time.Millisecond)
			}
			nc.Publish(m.Reply, []byte("ok can help"))
			log.Printf("Replied to help request (times=%d)\n", i)
		}
	})

	// Parent context
	ctx := context.Background()

	// Hard deadline for the whole context
	ctx, cancel := context.WithTimeout(ctx, 1*time.Second)
	defer cancel() // must be called always

	// Probe deadline will be expanded as we gather replies
	timer := time.AfterFunc(250*time.Millisecond, func() {
		cancel()
	})

	replies := make([]interface{}, 0)

	// RequestWithContext is actually syntax sugar for something like this
	inbox := nats.NewInbox()
	sub, err := nc.SubscribeSync(inbox)
	defer sub.Unsubscribe()
	if err != nil {
		log.Fatalf("Failed to make request: %s\n", err)
	}

	start := time.Now()
	err = nc.PublishRequest("help", inbox, []byte("please help!"))
	if err != nil {
		log.Fatalf("Failed to create request: %s\n", err)
	}
	for {
		// Wait to receive all messages we can until we stop
		// hearing from members for over 250ms
		result, err := sub.NextMsgWithContext(ctx)
		if err != nil {
			log.Printf("Stopped waiting for replies (reason=%q)", err)
			break
		}
		replies = append(replies, result)
		timer.Reset(250 * time.Millisecond)
	}
	log.Printf("Received %d messages in %.3f seconds", len(replies), time.Since(start).Seconds())
}
```

<hr>

If you want to see the full talk, you can find it here on YouTube:

<div class="row">
  <div class="col-md-12">
    <div class="center-block">
      <div class="embed-responsive embed-responsive-16by9">
        <iframe width="560" height="315" src="https://www.youtube.com/embed/giUatBmmb_Y?start=6683" frameborder="0" allowfullscreen></iframe>
      </div>
    </div>
  </div>
</div>

The slides from the talk are available on SlideShare:

<div class="row">
  <div class="col-md-12">
    <div class="center-block text-center">
      <iframe src="//www.slideshare.net/slideshow/embed_code/key/KH6lTCHbSZZTMT" width="595" height="485" frameborder="0" marginwidth="0" marginheight="0" scrolling="no" style="border:1px solid #CCC; border-width:1px; margin-bottom:5px; max-width: 100%;" allowfullscreen> </iframe>
    </div>
  </div>
</div>

Thanks again, and thanks to the organizers of GopherFest for arranging the event and letting me speak, it was a lot of fun!

If anyone has any questions or comments, feel free to contact me on [Twitter](https://twitter.com/wallyqs), or in the NATS Slack Community [(request an invite if you need one)](https://docs.google.com/a/apcera.com/forms/d/104yA7oqq7SPoMDG_J9MnVE74gVwBnTmVHKP5ABHoM5k/viewform?embedded=true).

See you at GopherCon in a few months!

Wally
