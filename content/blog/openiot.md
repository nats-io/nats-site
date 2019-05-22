# openIoT

+++ categories = \["Community"\] date = "2016-05-09" tags = \["NATS", "IoT", "Presentation", "Video"\] title = "NATS: A Central Nervous System for IoT Messaging" author = "Brian Flannery" +++

The [Linux Foundation’s](https://twitter.com/linuxfoundation) [OpenIoT Summit](http://events.linuxfoundation.org/events/openiot-summit/program/about) was held in San Diego in April, and for those of you who attended and maybe went home with some swag, you’ll remember the [NATS](http://www.nats.io) team had a booth. What you may not remember a month later are the details of [Larry McQueary’s](https://github.com/mcqueary) overview of NATS at one of the speaking [sessions](http://sched.co/6DBE). As a refresher, the recording of the talk is now available for viewing on YouTube. You can see a quick demo of NATS later in the video \(starting [here](https://youtu.be/6uPopWEdldU?t=32m42s)\), and QnA at the [end](https://youtu.be/6uPopWEdldU?t=38m30s). The full video is available below:

The slides Larry presents in the talk are available via [SlideShare](http://www.slideshare.net/Apcera/nats-a-central-nervous-system-for-iot-messaging-larry-mcqueary).

Among the key points Larry makes are that traditional messaging systems disappoint because:

* They try to do too much
* Performance and stability are not enough of a priority - functionality is
* They carry too many dependencies
* They get generalized over time, and lose their initial focus and intent

If you are at all familiar with NATS, you know NATS is the opposite of this. NATS is all about simplicity and performance, and has no external dependencies. It’s a simple plain-text protocol. The Docker image is a mere 7MB, and the client libraries are just a few hundred K in size.

The lightweight, high performance profile of NATS make it ideal for IoT messaging where device characteristics and communication patterns mean a heavy, general purpose messaging system won’t scale.

If you’re considering IoT development, and look for a messaging layer we would be interested to hear from you! You might also want to take a look at the [NATS Arduino client](http://nats.io/download/joshglendenning/arduino-nats/) developed by the Community.

You can continue the conversation with us on [Twitter](https://twitter.com/nats_io), or join the [NATS Community](http://nats.io/community/) and let us know your thoughts.

