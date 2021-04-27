+++
date = "2021-04-27"
draft = false
title = "Intro NATS CLI"
author = "R.I. Piennar"
categories = ["General", "Engineering"]
tags = ["NATS", "CLI", "ADMIN", "JetStream"]
+++

# Introducing NATS CLI

Historically NATS did not have a clear obvious place to go for a CLI tool, users had various example applications
that had to build and run manually. These tools were primarily examples of using the APIs rather than full UX CLI experience.

As part of the NATS 2.2.0 release that introduced JetStream and its administration needs, we took the opportunity
to build a full CLI tool for users and administrators alike.

Below is a quick video tour of the CLI as an introduction.

[![CLI Introduction](https://img.youtube.com/vi/rn5l9rQ-krM/0.jpg)](https://youtu.be/OFUjbv1ItJc)

## Features

This CLI tool has a large number of features which we'll be introducing and studying in depth using a series of blogs and videos.

* JetStream management
* JetStream data and configuration backup
* Message publish and subscribe
* Service requests and creation
* Benchmarking and Latency testing
* Super Cluster observation
* Configuration context maintenance
* NATS ecosystem schema registry
* Health Monitoring for Core features and Stream clusters

## Download

The source code and binary releases can be found in the [natscli](https://github.com/nats-io/natscli) repository and we
also publish it to our Homebrew tap.

```
$ brew tap nats-io/nats-tools
$ brew install nats-io/nats-tools/nats
```

For other Operating Systems and package formats - including Linux, Windows, FreeBSD and more - please see the [releases page](https://github.com/nats-io/natscli/releases).

### About the Author

R.I. Piennar is a long-time NATS Maintainer and a member of the engineering team at [Synadia Communications](https://synadia.com).

Questions? Join our [Slack channel](https://slack.nats.io) or email [info@nats.io](mailto:info@nats.io).
