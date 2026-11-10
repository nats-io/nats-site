---
title: Download
# The client tables need the full column width.
wide: true
aliases: 
  - /download/nats-server/
  - /download/nats-streaming-server/
---

The NATS Server, its [clients](#clients), and community [connectors and utilities](#connectors-and-utilities). The [documentation](https://docs.nats.io) covers getting started.

{{< servers >}}
The Nightly build is an unreleased development image, published as `synadia/nats-server:nightly` and built from upstream NATS code with nothing added ([all tags](https://hub.docker.com/r/synadia/nats-server/tags)).

## Clients
Starred <span><i class="fas fa-star fa-xs fa-star-blue"></i></span> clients are maintained by the NATS authors in the `nats-io` GitHub organization. To add a client, send a pull request updating [language.toml](https://github.com/nats-io/nats-site/blob/main/data/language.toml).

{{< client_glc >}}

## Connectors and Utilities

To add a connector or utility, send a pull request updating [addons.toml](https://github.com/nats-io/nats-site/blob/main/data/addons.toml).

{{< connectors >}}

