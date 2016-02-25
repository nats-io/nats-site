+++
categories = ["Community", "Engineering"]
date = "2016-02-24T11:22:41-08:00"
tags = ["nats", "monitoring", "technical"]
title = "Nats-top v0.2.0 Release is now Available"
author = "Wally Quevedo"
+++
As some of you may have noted, last week a new version of the `nats-top` monitor for NATS has been made available for download on Github:

https://github.com/nats-io/nats-top/releases/tag/v0.2.0

If you’re looking for a bit more information about nats-top, my talk last fall at a NATS meetup on nats-top is here:

https://www.youtube.com/watch?v=5TkA9OJbTv4

As nats-top is a top like monitoring tool, so developers who prefer terminal tools such as this will be very comfortable with it. NATS.io already provided a built-in HTTP monitoring endpoint, allowing developers to introspect state information from the server. This also makes devising custom monitoring tools for NATS easy - just poll data from this endpoint.

This version now features monitoring NATS servers which make use of the HTTPS port for doing so securely with certificates.

```
nats-top -h
usage: nats-top [-s server] [-m http_port] [-ms https_port] [-n num_connections] [-d delay_secs] [-sort by]
                [-cert FILE] [-key FILE ][-cacert FILE] [-k]


gnatsd --tls --tlscert server/server-cert.pem --tlskey server/server-key.pem  -DV -ms 8222

nats-top -ms 8222 --cacert ca.pem
```

 An example of this is below:

 <img class="img-responsive center-block" src="/img/blog/nats-top-gif-6.gif" alt="A GIF showing nats-top in action">

 Here’s an additional list of release notes for this version:

## Added
 - Flags for monitoring via https using certificates
 - Displaying of name column for clients sending one on CONNECT
 - Added displaying of uptime column
 - Sorting via idle, last activity which server now supports

## Changed
 - Aborts polling in case first request to monitoring port failed

 I’m interested in any questions, feedback, and comments you have on nats-top - please feel free to reach me via Twitter or Github.
