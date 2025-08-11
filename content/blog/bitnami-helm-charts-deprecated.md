+++
categories = ["Engineering", "General"]
date = "2025-08-11"
tags = ["NATS", "Kubernetes"]
title = "Bitnami Helm Charts will be deprecated by August 28th, 2025. Migrate to official NATS.io charts"
author = "Andrew Connolly"
+++

## Important Notice for NATS.io Users on Bitnami Helm Charts

If you're running NATS using Bitnami Helm charts, we strongly recommend migrating to the official NATS charts maintained by Synadia.

### Why migrate now?
- [Bitnami is deprecating the majority of it's community tier helm charts, including NATS](https://github.com/bitnami/charts/issues/35164)
- Legacy Bitnami images stop receiving updates on August 28th
- Future access to NATS via Bitnami will require a paid Bitnami Secure Images subscription ($72K annually)

### The solution:

**Switch to the official NATS Helm charts, maintained by the team at Synadia**

Don't wait for the deprecation deadline. Start your migration to the [official NATS helm chart](https://github.com/nats-io/k8s?tab=readme-ov-file#getting-started-with-nats-using-helm) today.

* Questions? Ask in our community - https://slack.nats.io - we're here to help make your transition smooth.
* Want formal support from NATS experts as you migrate? [Contact Synadia](https://www.synadia.com/contact).
