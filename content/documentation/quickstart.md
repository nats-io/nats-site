+++
title = "Quickstart"
description = "Run the NATS server locally"
[menu.main]
  name = "Quickstart"
  weight = 2
  identifier = "quickstart"
  parent = "Getting Started With NATS"
+++

This tutorial takes you from zero to running the current version of NATS Server (**{{< latest >}}**) locally in your preferred environment. The quickstart currently works for:

* [Binary](#binary)
* [Docker](#docker)

## Binary

Click on the relevant OS/processor combo for your environment, which will trigger the download of a ZIP file (or copy the URL and download using a tool like [wget](https://www.gnu.org/software/wget/)):

{{< downloads >}}

The unzipped directory will contain a `LICENSE` file, a `README`, and a `gnatsd` binary that you can use to run the NATS Server.

Here are some example steps for `darwin-amd64`:

```bash
wget https://github.com/nats-io/gnatsd/releases/download/v{{< latest >}}/gnatsd-v{{< latest >}}-darwin-amd64.zip
unzip gnatsd-v{{< latest >}}-darwin-amd64.zip
ls gnatsd-v{{< latest >}}-darwin-amd64
LICENSE README.md gnatsd
```

To start up the server:

```bash
./gnatsd --debug
```

This will run the NATS Server on port 4222 in debug mode. Debug mode isn't *necessary* but it will come in handy during this tutorial.

## Docker

```bash
docker run -p 4222:4222 nats --debug
```