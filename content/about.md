+++
title = "About NATS"
chart = true
+++

NATS is a connective technology built for the ever increasingly hyper-connected world. It is a single technology that enables applications to securely communicate across any combination of cloud vendors, on-premise, edge, web and mobile, and devices.
NATS consists of a family of open source products that are tightly integrated but can be deployed easily and independently. NATS is being used globally by thousands of companies, spanning use-cases including microservices, edge computing, mobile, IoT and can be used to augment or replace traditional messaging.

The NATS Server acts as a central nervous system for building distributed applications. Official clients are available in Go, Rust, JavaScript (Node and Web), TypeScript (Deno), Python, Java, C#, C, Ruby, Elixir and a CLI in addition to 30+ community-contributed clients. Real time data streaming, highly resilient data storage and flexible data retrieval are supported through [JetStream](https://docs.nats.io/jetstream/), the next generation streaming platform built into the NATS server. Check out the full list of [NATS clients](/download).

NATS was created by Derek Collison, in response to the market need for a simple, secure, and connective technology. NATS is currently deployed in some of the largest cloud platforms, including: VMware, CloudFoundry, Baidu, Siemens, and GE. NATS is 100% free to use under the Apache-2.0 Open Source License.

NATS is unique in its simplicity and performance, and as a result powers some of the largest production environments. You can learn more about NATS in our [extensive documentation](https://docs.nats.io).

<!--{{< throughput >}} -->

---

## Roadmap

The purpose of the roadmap is to communicate the known set of features and changes coming in a release. Each release contains a set of strategic and high-value changes decided by the NATS maintainers. There are several sources of input for this decision making:

- Community, driven by GitHub and Slack interest and discussions
- Customers, solicited from [Synadia's](https://synadia.com) customer use cases
- Support, sourced from recurring challenges with existing capabilities
- Opportunity, ideated by the maintainers insight and vision

We are excited to bring these advances to the NATS community and look forward to your valuable input! Feel free to reach out on our [Slack channel](https://slack.nats.io), start a [GitHub discussion](https://github.com/nats-io/nats-server/discussions), or [email us](mailto:info@nats.io) with any questions, comments, or requests.

{{< columns >}}

{{< column >}}

### 2.10 Release

_Coming June 2023_

The following list of items have been committed to for this release. A detailed blog post introducing these features will be available once released.

- Authorization callout
- Enhanced cluster routes
- Large/fast updating KV optimizations
- Multi-filter consumers
- Stream subject transforms
- On-disk stream compression
- Native support for Windows certificate store
- Stream and consumer metadata fields
- Multi-CA OCSP support
- Support for stream republish edits
- Opt-in UTC-based log timestamps

Nightly container image builds are available during development on Docker Hub under the [`synadia/nats-server:nightly`](https://hub.docker.com/r/synadia/nats-server) repo.

{{< /column >}}

{{< column >}}

### 2.11 Release

_Coming Summer 2023_

The following short-list of items have been committed to, but will be refined once the previous version is released.

- Key-value based NATS resolver
- Message processing callout
- Encryption key rotation
- Key-Value typed values

{{< /column >}}

{{< column >}}

### Future Considerations

_Coming soon!_

If you have any ideas or requests, be sure to contact us using one of the methods above ☝️!

{{< /column >}}

{{< /columns >}}

---

## Recent posts

{{< recent-posts >}}

---

## Resources

In addition to our official [Documentation](https://docs.nats.io), the following resources are just a few available to learn, share, and grow your knowledge of NATS.
If you would like to share your experience with NATS and would like help publishing you can [contact us](mailto:info@nats.io) or if you have an article published, tag us on [Twitter](https://twitter.com/nats_io) or ping us on [Slack](https://slack.nats.io).

- [Byron Ruth Blog](https://www.byronruth.com/) | Byron Ruth has created a weekly NATS News combining announcements, Slack Q&A, and updates. Additional featured NATS articles are also available.
- [Karan Pratap Singh NATS Series](https://dev.to/karanpratapsingh/series/17024) | Karan shares his experiences with NATS including "Building Microservices" and "NATS with Kubernetes".
- [SlideShare](https://www.slideshare.net/nats_io/presentations)
- [Ovum's "On the Radar" Report](https://nats.io/collateral/On_The_Radar_NATS.pdf)
- [YouTube](https://www.youtube.com/c/nats_messaging/videos)

{{< resources >}}
