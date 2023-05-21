+++
date = "2021-05-20"
draft = false
title = "Replace your MQTT broker with NATS Server"
author = "Ivan Kozlovic"
categories = ["General", "Engineering"]
tags = ["NATS", "MQTT", "IoT"]
+++

# Replace your MQTT broker with NATS Server v2.2.0+

NATS Server v2.2.0+ has native support for MQTT v3.1.1 protocol.

If you already have a deployment with existing MQTT broker(s) and use NATS messaging, or are planning to,
this blog post will show you how easy it is to replace your existing MQTT broker with a NATS server.

Not only you would have to manage a single server instead of two, using NATS with MQTT will allow
you to exchange data from MQTT to NATS and vice-versa.

In this [repository](https://github.com/kozlovic/nats_mqtt_demo) you will find detailed instructions
and all required scripts to run the demonstration.

* The first [stage](https://github.com/kozlovic/nats_mqtt_demo#without-nats) is to run a simulator
that generates MQTT messages and a MQTT subscription to consume them.
* Then, in the second [stage](https://github.com/kozlovic/nats_mqtt_demo#with-standalone-nats-server),
we replace the MQTT broker with NATS and see how messages can be exchanged between MQTT and NATS.
* Finally, in the third [stage](https://github.com/kozlovic/nats_mqtt_demo#with-nats-leafnode-server-connected-to-synadias-ngs)
we run a NATS server with a Leafnode connection to Synadia's NGS super cluster and show how MQTT messages
can be received with NATS from anywhere in the world.

You can watch all that in the following video. Enjoy!

<iframe width="560" height="315" src="https://www.youtube.com/embed/hiYmh9n8Yv8" title="YouTube video player"
frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

### About the Author

Ivan Kozlovic is a senior member of the engineering team at [Synadia Communications](https://synadia.com).

Questions? Join our [Slack channel](https://slack.nats.io) or email [info@nats.io](mailto:info@nats.io).
